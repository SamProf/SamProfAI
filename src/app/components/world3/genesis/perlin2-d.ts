import {MathHelper} from '../../../helpers/math-helper';

export class Perlin2D {

  private permutationTable: number[];

  constructor() {
    this.permutationTable = [];
    for (var i = 0; i < 1024; i++) {
      this.permutationTable.push(MathHelper.getRandomInt(0, 256));
    }
  }


  public getNoise4(fx: number, fy: number, octaves: number, persistence: number): number {
    var amplitude: number = 1;
    var max = 0;
    var result = 0;
    while (octaves-- > 0) {
      max += amplitude;
      result += this.getNoise2(fx, fy) * amplitude;
      amplitude *= persistence;
      fx *= 2;
      fy *= 2;
    }
    return result / max;
  }


  public getNoise2(x: number, y: number): number {
    var left = Math.floor(x);
    var top = Math.floor(y);

    var localX = x - left;
    var localY = y - top;

    // извлекаем градиентные векторы для всех вершин квадрата:
    var topLeftGradient: Vector = this.getPseudoRandomGradientVector(left, top);
    var topRightGradient = this.getPseudoRandomGradientVector(left + 1, top);
    var bottomLeftGradient = this.getPseudoRandomGradientVector(left, top + 1);
    var bottomRightGradient = this.getPseudoRandomGradientVector(left + 1, top + 1);

    // вектора от вершин квадрата до точки внутри квадрата:
    var distanceToTopLeft = new Vector(localX, localY);
    var distanceToTopRight = new Vector(localX - 1, localY);
    var distanceToBottomLeft = new Vector(localX, localY - 1);
    var distanceToBottomRight = new Vector(localX - 1, localY - 1);

    // считаем скалярные произведения между которыми будем интерполировать
    var tx1 = this.dot(distanceToTopLeft, topLeftGradient);
    var tx2 = this.dot(distanceToTopRight, topRightGradient);
    var bx1 = this.dot(distanceToBottomLeft, bottomLeftGradient);
    var bx2 = this.dot(distanceToBottomRight, bottomRightGradient);

    // интерполяция
    var tx = this.lerp(tx1, tx2, this.qunticCurve(localX));
    var bx = this.lerp(bx1, bx2, this.qunticCurve(localX));
    var tb = this.lerp(tx, bx, this.qunticCurve(localY));

    return tb;
  }


  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private dot(a: Vector, b: Vector): number {
    return a.x * b.x + a.y * b.y;
  }


  private qunticCurve(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private getPseudoRandomGradientVector(x: number, y: number): Vector {
    // псевдо-случайное число от 0 до 3 которое всегда неизменно при данных x и y
    var v = Math.floor(((x * 1836311903) ^ (y * 2971215073) + 4807526976) & 1023);
    v = this.permutationTable[v] & 3;

    switch (v) {
      case 0:
        return new Vector(1, 0);
      case 1:
        return new Vector(-1, 0);
      case 2:
        return new Vector(0, 1);
      default:
        return new Vector(0, -1);
    }
  }


}


export class Vector {

  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
