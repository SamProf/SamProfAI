import {WorldGenom} from './world-genom';

export class WorldBotState {

  energyKill: number = 0;
  energyEat: number = 0;

  health: number = 0;
  age: number = 0;
  angle: number = 0;
  x: number;
  y: number;
  commandIndex: number = 0;

  isDead: boolean = false;

  getCommand(): number {
    return this.genom.commands[this.commandIndex];
  }

  addCommandAddr(addr: number) {
    this.commandIndex = (this.commandIndex + addr) % this.genom.commands.length;
  }


  constructor(public genom: WorldGenom) {
    this.health = 100;
  }
}
