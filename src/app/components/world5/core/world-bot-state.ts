import {WorldGenom} from './world-genom';

export class WorldBotState {

  health: number = 0;
  angle: number = 0;
  x: number;
  y: number;
  commandIndex: number = 0;
  takt: number = 0;

  get isDead(): boolean {
    return this.health <= 0;
  }


  getCommand(): number {
    return this.genom.commands[this.commandIndex];
  }

  addCommandAddr(addr: number) {
    // this.commandIndex = (this.commandIndex + addr) % this.genom.commands.length;
    this.commandIndex += addr;
    if (this.commandIndex >= this.genom.commands.length) {
      this.commandIndex = 0;
      this.takt = Number.MAX_SAFE_INTEGER;
    }
  }


  constructor(public genom: WorldGenom) {
    this.health = 100;
  }
}
