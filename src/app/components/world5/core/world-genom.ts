import {MathHelper} from '../../../helpers/math-helper';
import {WorldModel} from './world-model';


export class WorldGenom {
  commands: number[];

  constructor(private world: WorldModel) {
  }

  init() {
    this.commands = [0];
  }

  clone(): WorldGenom {
    let g = new WorldGenom(this.world);
    g.commands = [...this.commands];
    return g;
  }

  mutation() {
    var cellCount = MathHelper.getRandomInt(0, 5);
    for (var j = 0; j < cellCount; j++) {
      var cmdIndex = MathHelper.getRandomInt(0, this.commands.length + 1);
      this.commands[cmdIndex] = MathHelper.getRandomInt(0, this.world.commands[this.world.commands.length - 1].index);
    }

  }

  toString() {
    return this.commands.map(i => i.toString().padStart(4, '0')).join(' ');
  }


}
