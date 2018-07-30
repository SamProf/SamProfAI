import {WorldGenom} from './world-genom';

export class WorldBotState {
  colorR: number =  0;
  colorG:number =  0;
  colorB: number = 1;

  health: number = 0;
  age: number = 0;
  speedX: number =  0;
  speedY: number = 0;
  angle: number;
  x: number;
  y: number;
  commandIndex: number = 0;


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


