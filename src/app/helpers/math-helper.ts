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
