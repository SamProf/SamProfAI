export class IFigure {
  states: IFigureState[];
}

export interface IFigureState {
  w: number;
  h: number;
  data: number[];
}
