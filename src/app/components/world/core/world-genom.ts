import {Genom} from '../../../core/genom';
import {MathHelper} from '../../../helpers/math-helper';

export class WorldGenom {
  commands: number[];

  constructor() {
    this.commands = [];
  }

  init(count: number): void {
    this.commands = [];
    for (var i = 0; i < count; i++) {
      this.commands.push(MathHelper.getRandomInt(0, 64));
    }


    // this.commands[0] = 16;
    // this.commands[1] = 8;
    // this.commands[2] = 0;
    // this.commands[3] = 61;
    // this.commands[4] = 0;
    // this.commands[5] = 0;
    // this.commands[6] = 25;
    // this.commands[7] = 57;
    // this.commands[8] = 56;
    // this.commands[9] = 0;
    // this.commands[10] = 54;

  }
}
