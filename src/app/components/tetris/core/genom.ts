import {NNet} from './n-net';
import {Settings} from './settings';
import {tetrisHeight, tetrisNNDimensions, tetrisWidth} from './constants';
import {getRandomInt} from '../../../helpers/math-helper';

export class Genom {
  net: NNet;

  constructor(private settings: Settings) {
  }


  init() {
    this.net = new NNet(tetrisNNDimensions);
    this.net.initZeros(NNet.calculateDataLengh(tetrisNNDimensions));
    this.net.initRandom(NNet.calculateDataLengh(tetrisNNDimensions));
  }


  copyFrom(genom: Genom) {
    this.net = new NNet(tetrisNNDimensions);
    this.net.initData(genom.net.data.slice());
  }

  mutation() {
    var cnt = getRandomInt(0, 200);
    for (var i = 0; i < cnt; i++) {
      this.net.data[getRandomInt(0, this.net.data.length)] = Math.random();
    }
  }
}
