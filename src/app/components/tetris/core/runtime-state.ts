import {Genom} from './genom';
import {Settings} from './settings';
import {getRandomInt, MathHelper} from '../../../helpers/math-helper';
import {tetrisFigures, tetrisHeight, tetrisWidth, tetrisZeroMap} from './constants';
import {IFigure, IFigureState} from './figure';


export class RuntimeState {

  constructor(public genom: Genom, private settings: Settings) {
  }

  init() {
    this.map = tetrisZeroMap.slice();
    this.placeNewFigure();
  }


  placeNewFigure() {
    this.figure = tetrisFigures[getRandomInt(0, tetrisFigures.length)];
    this.figureAngle = 0;
    this.figureState = this.figure.states[this.figureAngle];
    this.figureX = (tetrisWidth - this.figureState.w) / 2;
    this.figureY = 0;

    var free = this.checkFree(this.figureX, this.figureY);

    if (free != CheckFreeState.free) {
      this.stampFigure();
    }
  }


  checkScore() {
    for (var y = 0; y < tetrisHeight; y++) {
      if (this.map[y] == 0b1111111111) {
        this.map.splice(y, 1);
        this.score++;
        this.map.unshift(0);
      }
    }
  }

  stampFigure() {
    for (var fy = 0; fy < this.figureState.h; fy++) {
      this.map[this.figureY + fy] |= this.figureState.data[fy] << this.figureX;
    }
    this.checkScore();
    if (this.map[0] != 0) {
      this.isDead = true;
    }
  }

  checkFree(x: number, y: number): CheckFreeState {
    if (x < 0 || x + this.figureState.w > tetrisWidth || y < 0 || y + this.figureState.h > tetrisHeight) {
      return CheckFreeState.border;
    }
    var isFree: boolean = true;
    for (var fy = 0; fy < this.figureState.h; fy++) {
      isFree = isFree && ((this.figureState.data[fy] << x) & this.map[y + fy]) == 0;
    }

    return isFree ? CheckFreeState.free : CheckFreeState.busy;
  }

  goDown() {
    // debugger;
    if (this.checkFree(this.figureX, this.figureY + 1) == CheckFreeState.free) {
      this.figureY++;
    }
    else {
      this.stampFigure();
      if (!this.isDead) {
        this.placeNewFigure();
      }
    }
  }

  goLeft() {
    if (this.checkFree(this.figureX - 1, this.figureY) == CheckFreeState.free) {
      this.figureX--;
    }
  }

  goRight() {
    if (this.checkFree(this.figureX + 1, this.figureY) == CheckFreeState.free) {
      this.figureX++;
    }
  }


  map: number[];
  age: number = 0;
  figureAngle = 0;
  figureX = 0;
  figureY = 0;
  figure: IFigure;
  figureState: IFigureState;

  score: number = 0;

  isDead: boolean = false;
}

export enum CheckFreeState {
  free,
  border,
  busy
}
