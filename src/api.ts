import axios from 'axios';
import { JobsStatus, JobCommand, JobType } from './types';
import { API_KEY, SERVER_URL } from './config';

const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
  headers: {
    'x-api-key': API_KEY,
  },
});

export async function getJobStatus() {
  const { data } = await api.get<JobsStatus>('jobs');

  return data;
}

async function setJobStatus(jobId: JobType, command: JobCommand) {
  try {
    const { data } = await api.put<JobsStatus>(`jobs/${jobId}`, {
      command,
      force: false,
    });

    return data;
  } catch (error) {
    console.log(
      `Error setting job status for ${jobId}:${command}`,
      error?.response?.data?.message || error.message,
    );
  }
}

export async function startJob(jobId: JobType) {
  await setJobStatus(jobId, 'resume');
  await setJobStatus(jobId, 'start');
}

export async function pauseJob(jobId: JobType) {
  await setJobStatus(jobId, 'pause');
}

export async function pauseJobs(jobs: JobType[]) {
  for (const job of jobs) {
    await pauseJob(job);
  }
}
