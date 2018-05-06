export class WorkerMessage {
}


export class WorkerMessage1 extends WorkerMessage {
  public name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
