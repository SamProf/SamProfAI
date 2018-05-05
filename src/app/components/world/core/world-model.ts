import {MathHelper} from '../../../helpers/math-helper';
import {WorldGenom} from './world-genom';


export class WorldModel {
  map: WorldCellModel[][];
  bots: BotWorldCell[];

  stepIndex: number;

  constructor(private generation: WorldGenom[], public width: number = 100, public height: number = 70) {
    this.clear();
    this.createBots();
    this.liveBotCount = generation.length;
    this.addGrass(20);
    this.addPoison(20);
    this.addWall(20);

  }


  run(stepCount: number = 1000, stepByRun: number = 10): Promise<void> {
    this.stepIndex = 0;
    return new Promise<void>((resolve) => {
      var runStep = () => {
        setTimeout(() => {
          for (var i = 0; i < stepByRun; i++) {
            this.step();
            if (this.stepIndex >= stepCount) {
              resolve();
              return;

            }
          }

          if (this.stepIndex < stepCount) {
            runStep();
          }

        }, 0);
      };
      runStep();
    });
  }


  liveBotCount: number;

  step() {

    this.liveBotCount = 0;
    this.stepIndex++;
    this.addGrass(2);
    this.addPoison(1);
    for (var iBot = 0; iBot < this.bots.length; iBot++) {
      var bot = this.bots[iBot];
      var currentCommand = 0;
      if (!bot.isDead) {
        this.liveBotCount++;


        while (currentCommand++ < 10) {
          var command = bot.getCommand();
          if (command <= 7) {
            // debugger;
            let x, y;
            [x, y] = this.getXYByAngle(bot, (command - 0) * 45);
            var cell = this.map[y][x];
            if (cell instanceof PoisonWorldCell) {
              bot.health = 0;
              bot.addCommandAddr(1);
            }
            else if (cell instanceof WallWorldCell) {
              bot.addCommandAddr(2);
            }
            else if (cell instanceof BotWorldCell) {
              bot.addCommandAddr(3);
            }
            else if (cell instanceof GrassWorldCell) {
              bot.health += 10;
              this.map[bot.y][bot.x] = new EmptyWorldCell();
              bot.x = x;
              bot.y = y;
              this.map[bot.y][bot.x] = bot;

              bot.addCommandAddr(4);
            }
            else if (cell instanceof EmptyWorldCell) {
              this.map[bot.y][bot.x] = new EmptyWorldCell();
              bot.x = x;
              bot.y = y;
              this.map[bot.y][bot.x] = bot;

              bot.addCommandAddr(5);
            }
            else {
              throw new Error('cell type');
            }
            break;
          }
          else if (command <= 15) {
            // debugger;
            let x, y;
            [x, y] = this.getXYByAngle(bot, (command - 8) * 45);
            var cell = this.map[y][x];
            if (cell instanceof PoisonWorldCell) {
              this.map[y][x] = new GrassWorldCell();
              bot.addCommandAddr(1);
            }
            else if (cell instanceof WallWorldCell) {
              bot.addCommandAddr(2);
            }
            else if (cell instanceof BotWorldCell) {
              bot.addCommandAddr(3);
            }
            else if (cell instanceof GrassWorldCell) {
              bot.health += 10;
              this.map[y][x] = new EmptyWorldCell();
              bot.addCommandAddr(4);
            }
            else if (cell instanceof EmptyWorldCell) {
              bot.addCommandAddr(5);
            }
            else {
              throw new Error('cell type');
            }
            break;
          }
          else if (command <= 23) {
            // debugger;
            let x, y;
            [x, y] = this.getXYByAngle(bot, (command - 16) * 45);
            var cell = this.map[y][x];
            if (cell instanceof PoisonWorldCell) {
              bot.addCommandAddr(1);
            }
            else if (cell instanceof WallWorldCell) {
              bot.addCommandAddr(2);
            }
            else if (cell instanceof BotWorldCell) {
              bot.addCommandAddr(3);
            }
            else if (cell instanceof GrassWorldCell) {
              bot.addCommandAddr(4);
            }
            else if (cell instanceof EmptyWorldCell) {
              bot.addCommandAddr(5);
            }
            else {
              throw new Error('cell type');

            }
          }
          else if (command <= 31) {
            bot.angle = (bot.angle + (command - 24) * 45) % 360;
            bot.addCommandAddr(1);
          }
          else {
            bot.addCommandAddr(command);
          }
        }

        bot.health--;
        if (bot.isDead) {
          this.map[bot.y][bot.x] = new GrassWorldCell();
        }

        bot.health = Math.min(bot.health, 100);
      }
      else {
        bot.health--;

      }
    }
  }


  getXYByAngle(bot: BotWorldCell, angle: number): number[] {
    angle = (bot.angle + angle) % 360;
    switch (angle) {
      case 0: {
        var dx = 0;
        var dy = -1;
        break;
      }
      case 45: {
        var dy = -1;
        var dx = 1;
        break;
      }
      case 90: {
        var dx = 1;
        var dy = 0;
        break;
      }
      case 135: {
        var dx = 1;
        var dy = 1;
        break;
      }
      case 180: {
        var dx = 0;
        var dy = 1;
        break;
      }
      case 225: {
        var dx = -1;
        var dy = 1;
        break;
      }
      case 270: {
        var dx = -1;
        var dy = 0;
        break;
      }
      case 315: {
        var dx = -1;
        var dy = -1;
        break;
      }
      default:
        throw new Error('getXYByAngle ' + angle);
    }

    return this.getXYByDxDy(bot, dx, dy);
  }


  getXYByDxDy(bot: BotWorldCell, dx: number, dy: number): number[] {
    var x = (bot.x + dx);
    x %= this.width;
    if (x < 0) {
      x = this.width - 1;
    }

    var y = (bot.y + dy);
    y %= this.height;
    if (y < 0) {
      y = this.height - 1;
    }

    return [x, y];
  }


  botGoTo(bot: BotWorldCell, dx: number, dy: number) {
    var x, y;
    [x, y] = this.getdXdY(bot, dx, dy);

    var canGo = false;
    var cell = this.map[y][x];

    if (cell instanceof EmptyWorldCell) {
      canGo = true;
    }
    else if (cell instanceof GrassWorldCell) {
      bot.health += 10;
      canGo = true;
    }

    if (canGo) {
      this.map[bot.y][bot.x] = new EmptyWorldCell();
      this.map[y][x] = bot;
      bot.x = x;
      bot.y = y;
    }
  }

  createBots() {
    this.bots = [];


    for (var i = 0; i < this.generation.length; i++) {
      var x, y, flag;
      var bot = new BotWorldCell(this.generation[i]);

      [x, y, flag] = this.getEmptyCell(9999);

      if (!flag) {
        throw new Error('createBots getEmptyCell');
      }

      bot.x = x;
      bot.y = y;
      bot.angle = (MathHelper.getRandomInt(0, 8) * 45) % 360;
      this.map[y][x] = bot;
      this.bots.push(bot);
    }
  }

  private getEmptyCell(tryCount: number = 100) {

    var c = 0;
    while (c++ < tryCount) {
      var x = MathHelper.getRandomInt(0, this.width);
      var y = MathHelper.getRandomInt(0, this.height);
      if (this.map[y][x] instanceof EmptyWorldCell) {
        return [x, y, true];
      }
    }
    return [-1, -1, false];
  }


  addGrass(count: number): void {
    for (var i = 0; i < count; i++) {
      var x, y, flag;
      [x, y, flag] = this.getEmptyCell();
      if (flag) {
        this.map[y][x] = new GrassWorldCell();
      }
    }
  }

  addPoison(count: number): void {
    for (var i = 0; i < count; i++) {
      var x, y, flag;
      [x, y, flag] = this.getEmptyCell();
      if (flag) {
        this.map[y][x] = new PoisonWorldCell();
      }
    }
  }

  addWall(count: number): void {
    for (var i = 0; i < count; i++) {
      var x, y, flag;
      [x, y, flag] = this.getEmptyCell();
      if (flag) {
        this.map[y][x] = new WallWorldCell();
      }
    }
  }


  clear() {
    this.map = [];
    for (var y = 0; y < this.height; y++) {
      var row: WorldCellModel[] = [];
      for (var x = 0; x < this.width; x++) {
        row.push(new EmptyWorldCell());
      }
      this.map.push(row);
    }
  }
}


export abstract class WorldCellModel {
  public abstract cls: string;

  public abstract text(): string;
}


export class EmptyWorldCell extends WorldCellModel {
  cls: string = 'emptyCell';

  text(): string {
    return '';
  }
}


export class GrassWorldCell extends WorldCellModel {
  cls: string = 'grassCell';

  text(): string {
    return '';
  }
}

export class PoisonWorldCell extends WorldCellModel {
  cls: string = 'poisonCell';

  text(): string {
    return '';
  }
}


export class WallWorldCell extends WorldCellModel {
  cls: string = 'wallCell';

  text(): string {
    return '';
  }
}

export class BotWorldCell extends WorldCellModel {
  text(): string {
    return this.health.toString();
    // return "";
  }

  cls: string = 'botCell';

  health: number = 0;
  angle: number = 0;
  x: number;
  y: number;

  get isDead(): boolean {
    return this.health <= 0;
  }


  commandIndex: number = 0;

  getCommand(): number {
    return this.genom.commands[this.commandIndex];
  }

  addCommandAddr(addr: number) {
    this.commandIndex = (this.commandIndex + addr) % this.genom.commands.length;
  }


  constructor(public genom: WorldGenom) {
    super();
    this.health = 100;
  }
}

