import {MathHelper} from '../../../helpers/math-helper';
import {WorldSimSettings} from './world-sim-settings';
import {WorldModel} from './world-model';

export class WorldGenom {
  commands: number[];
  botType: number = 0;

  constructor() {
    this.commands = [];
  }


  copy(): WorldGenom {
    var c = new WorldGenom();
    c.commands = [...this.commands];
    c.botType = this.botType;
    return c;
  }


  init(world: WorldModel) {
    this.commands = [];
    for (var о = 0; о < world.settings.botMemoryLength; о++) {
      // this.commands.push(MathHelper.getRandomInt(0, world.commands[world.commands.length - 1].index));
      this.botType = 0;
      // this.commands.push(MathHelper.getRandomInt(0, 2));
      this.commands.push(0);
    }
  }


  mutation(world: WorldModel) {
    var cellCount = MathHelper.getRandomInt(0, this.commands.length * world.settings.mutantCellPercent);
    for (var j = 0; j < cellCount; j++) {
      var cmdIndex = MathHelper.getRandomInt(0, this.commands.length);
      this.commands[cmdIndex] = MathHelper.getRandomInt(0, world.commands[world.commands.length - 1].index);
    }
    if (MathHelper.getRandomInt(0, 1) == 0) {
      this.botType = (this.botType + 1) % 2;
    }
  }

  createChild(world: WorldModel) {
    var c = this.copy();
    if (MathHelper.getRandomInt(0, 100) < world.settings.mutantPercent * 100) {
      c.mutation(world);
    }
    return c;
  }


  compare(g2: WorldGenom): number {
    var len = Math.min(this.commands.length, g2.commands.length);
    var dif = Math.max(this.commands.length, g2.commands.length) - len;
    for (var i = 0; i < len; i++) {
      if (this.commands[i] != g2.commands[i]) {
        dif++;
      }
    }
    return dif / len;
  }


}
