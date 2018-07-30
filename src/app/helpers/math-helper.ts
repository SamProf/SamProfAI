export class MathHelper {
  // Возвращает случайное число между min (включительно) и max (не включая max)
  static getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }


  // Возвращает случайное целое число между min (включительно) и max (не включая max)
  // Использование метода Math.round() даст вам неравномерное распределение!
  static getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}


export function distanceLength(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}


export function distanceLengthPow2(x1: number, y1: number, x2: number, y2: number): number {
  return (x2 - x1) * (x2 - x1) +(y2 - y1) * (y2 - y1);
}
