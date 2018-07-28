import {setZeroTimeout} from './setZeroTimeout';

export class TimerTask {
  public get isBusy(): boolean {
    return this.fn != null;
  }

  private fn: () => void = null;

  public start(fn: () => void) {
    if (this.isBusy) {
      throw new Error('TimerTask is busy');
    }
    this.fn = fn;
    this.tick();
  }

  public stop() {
    this.fn = null;
  }


  private tick() {
    var fn = this.fn;
    if (fn != null) {
      fn();
      setZeroTimeout(() => {
        this.tick();
      });
    }
  }

}

