import {setZeroTimeout} from './setZeroTimeout';

export function workerAsync(func: () => Promise<void>): Promise<void> {
  return new Promise<void>((resolve => {
    setZeroTimeout(() => {
      func().then(resolve);
    });
  }));
}


export function threadSleepAsync(ms: number): Promise<void> {
  return new Promise<void>((resolve => {
    setInterval(() => {
      resolve();
    }, ms);
  }));
}


export function workerStateAsync(func: (WorkerState) => Promise<void>): WorkerState {
  var state = new WorkerState();
  state.result = workerAsync(async () => {
    await func(state);
  });
  return state;
}


export class WorkerState {
  terminated: boolean = false;
  result: Promise<void> = Promise.resolve();

  terminate() {
    this.terminated = true;
  }
}
