import { getJobStatus, pauseJob, pauseJobs, startJob } from './api';
import { JobType, QueueStatus } from './types';

const TICK_INTERVAL = 30 * 1000;

export class App {
  private currentStep: JobType | null = null;
  private stepsInOrder: JobType[] = [
    'library',
    'sidecar',
    'metadataExtraction',
    'smartSearch',
    'duplicateDetection',
    'faceDetection',
    'facialRecognition',
    'thumbnailGeneration',
    'videoConversion',
  ];

  async init() {
    await pauseJobs(this.stepsInOrder);

    this.currentStep = this.stepsInOrder[0];
    await startJob(this.currentStep);

    console.log(`Starting the loop with ${this.currentStep}`);
    this.endLoop();
  }

  async loop() {
    const state = await this.getState();
    const moreThanOneActive =
      this.stepsInOrder.filter((step) => state[step].isActive).length > 1;
    const allPaused = this.stepsInOrder.every((step) => state[step].isPaused);

    if (
      allPaused &&
      !this.currentStep &&
      state['metadataExtraction'].hasWorkToDo
    ) {
      // we need to start looping again because there is new asset to process
      this.currentStep = this.stepsInOrder[0];
      await startJob(this.currentStep);

      console.log('New asset to process, starting the loop again');
      return this.endLoop();
    }

    if (moreThanOneActive) {
      await pauseJobs(this.stepsInOrder);

      console.log(
        'More than one active job, pausing all jobs to avoid service overload. Will resume in the next loop',
      );
      return this.endLoop();
    }

    if (this.currentStep) {
      const currentStepState = state[this.currentStep];

      if (currentStepState.isActive) {
        // still active processing current step
        return this.endLoop();
      } else {
        // not active anymore, move to the next step
        await pauseJob(this.currentStep);
        const nextJob = this.getNextStep();

        if (nextJob) {
          console.log(`Finished ${this.currentStep}, moving to ${nextJob}`);
          this.currentStep = nextJob;
          await startJob(this.currentStep);
        } else {
          // we reached the end of the steps
          console.log('Finished all steps, pausing all jobs');
          this.currentStep = null;
        }
      }
    }

    this.endLoop();
  }

  private async endLoop() {
    setTimeout(() => {
      this.loop();
    }, TICK_INTERVAL);
  }

  private async getState() {
    const jobStatuses = await getJobStatus();

    const importantJobs = this.stepsInOrder.map((step) => {
      const { jobCounts, queueStatus } = jobStatuses[step];

      return {
        ...queueStatus,
        hasWorkToDo:
          jobCounts.waiting + jobCounts.paused + jobCounts.delayed > 0,
      };
    });

    return Object.fromEntries(
      this.stepsInOrder.map((step, index) => [step, importantJobs[index]]),
    ) as Record<JobType, QueueStatus & { hasWorkToDo: boolean }>;
  }

  private getNextStep(): JobType | undefined {
    const currentIndex = this.stepsInOrder.indexOf(this.currentStep!);
    const nextIndex = currentIndex + 1;

    return this.stepsInOrder[nextIndex];
  }
}
