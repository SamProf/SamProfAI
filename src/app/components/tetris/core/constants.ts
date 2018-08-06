import {IFigure} from './figure';

export var tetrisWidth: number = 10;
export var tetrisHeight: number = 20;
export var tetrisZeroMap = [];
export var tetrisNNDimensions = [tetrisWidth * tetrisHeight * 2, 50, 3];
for (var i = 0; i < tetrisHeight; i++) {
  tetrisZeroMap.push(0);
}


export var tetrisFigures: IFigure[] = [
  {
    states: [
      {
        w: 2,
        h: 2,
        data: [
          0b11,
          0b11,
        ]
      }
    ]
  },
  {
    states: [
      {
        w: 4,
        h: 1,
        data: [
          0b1111,
        ]
      },
      {
        w: 1,
        h: 4,
        data: [
          0b1,
          0b1,
          0b1,
          0b1,
        ]
      },
    ]
  },
];
