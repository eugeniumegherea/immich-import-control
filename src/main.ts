import 'dotenv/config';
import { App } from './app';

async function run() {
  const app = new App();

  app.init();
}

run();
