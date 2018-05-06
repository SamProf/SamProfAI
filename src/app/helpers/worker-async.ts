export function workerAsync(func: () => Promise<void>, flagDisable: boolean = false): Promise<void> {
  if (flagDisable) {
    return func();
  }
  else {
    return new Promise<void>((resolve => {
      setTimeout(() => {
        func().then(resolve);
      }, 0);
    }));
  }
}


export function workerStateAsync(func: (WorkerState) => Promise<void>, flagDisable: boolean = false): WorkerState {
  var state = new WorkerState();
  state.result = workerAsync(async () => {
    await func(state);
  }, flagDisable);
  return state;
}


export class WorkerState {
  terminated: boolean = false;
  result: Promise<void> = Promise.resolve();

  terminate() {
    this.terminated = true;
  }
}
