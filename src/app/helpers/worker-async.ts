import {setZeroTimeout} from './setZeroTimeout';

export function workerAsync(func: () => Promise<void>, timeout: number = 0): Promise<void> {
  return new Promise<void>((resolve => {
    if (timeout == 0) {
      setZeroTimeout(() => {
        func().then(resolve);
      });
    }
    else {
      setTimeout(() => {
        func().then(resolve);
      }, timeout);
    }
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
