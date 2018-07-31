import {MathHelper} from '../../../helpers/math-helper';
import {WorldSimSettings} from './world-sim-settings';
import {botGenomTypeCount, WorldModel} from './world-model';

export class WorldGenom {
  commands: number[];
  type: number;

  constructor() {
    this.commands = [];
    this.type = 0;
  }


  copy(): WorldGenom {
    var c = new WorldGenom();
    c.commands = [...this.commands];
    c.type = this.type;
    return c;
  }


  mutation(world: WorldModel) {
    var cellCount = MathHelper.getRandomInt(0, this.commands.length * world.settings.mutantCellPercent / 100);
    for (var j = 0; j < cellCount; j++) {
      var cmdIndex = MathHelper.getRandomInt(0, this.commands.length);
      this.commands[cmdIndex] = MathHelper.getRandomInt(0, world.commands[world.commands.length - 1].index);
    }

    if (world.settings.botGenomType) {
      if (MathHelper.getRandomInt(0, 5) == 0) {
        this.type = (this.type + 1) % botGenomTypeCount;
      }
    }
  }

  createChild(world: WorldModel) {
    var c = this.copy();
    if (MathHelper.getRandomInt(0, 100) < world.settings.mutantPercent) {
      c.mutation(world);
    }
    return c;
  }


  compare(world: WorldModel, g2: WorldGenom): number {
    var len = Math.min(this.commands.length, g2.commands.length);
    var dif = Math.max(this.commands.length, g2.commands.length) - len;
    for (var i = 0; i < len; i++) {
      if (this.commands[i] != g2.commands[i]) {
        dif++;
      }
    }
    return (dif / len) + ((world.settings.botGenomType && this.type != g2.type) ? 1 : 0);
  }


}
