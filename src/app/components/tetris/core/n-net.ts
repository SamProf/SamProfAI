import {Settings} from './settings';

export class NNet {
  data: number[];

  constructor(public dimensions: number[]) {
  }


  static calculateDataLengh(dimensions: number[]) {
    var len = 0;
    for (var d = 0; d < dimensions.length - 1; d++) {
      len += dimensions[d] * dimensions[d + 1];
    }
    return len;
  }

  static createCalculateVector(dimensions: number[]): number[][] {
    var res: number[][] = [];
    for (var d = 0; d < dimensions.length; d++) {
      var r: number[] = [];
      for (var i = 0; i < dimensions[d]; i++) {
        r.push(0);
      }
      res.push(r);
    }
    return res;
  }


  initZeros(len: number) {
    var data = [];
    for (var i = 0; i < len; i++) {
      data.push(0);
    }
    this.data = data;
  }

  initData(data: number[]) {
    this.data = data;
  }


  calculate(vector: number[][]) {


    // debugger;
    var data = this.data;
    var i = 0;

    for (var d = 0; d < this.dimensions.length - 1; d++) {
      var v1 = vector[d];
      let v2 = vector[d + 1];
      var l1 = this.dimensions[d];
      var l2 = this.dimensions[d + 1];
      for (var i2 = 0; i2 < l2; i2++) {
        // debugger;
        var val = 0;
        // var sum = 0;
        for (var i1 = 0; i1 < l1; i1++) {
          val += v1[i1] * data[i];
          // sum += data[i];
          i++;
        }
        // val /= sum;
        // val = val > 0.5 ? 1 : 0;
        v2[i2] = val;
      }
    }
  }

  initRandom(len: number) {
    var data = [];
    for (var i = 0; i < len; i++) {
      data.push(Math.random());
    }
    this.data = data;

  }
}
