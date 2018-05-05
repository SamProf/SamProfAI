import {MathHelper} from '../../../helpers/math-helper';
import {WorldGenom} from './world-genom';
import {visitProjectedRenderNodes} from '@angular/core/src/view/util';


export class WorldModel {
  map: WorldCellModel[][] = [];
  commands: WorldCommand[] = [];
  bots: BotWorldCell[] = [];


  addCommand(count: number, func: (BotWorldCell, number) => boolean) {
    var index = 0;
    if (this.commands.length) {
      index = this.commands[this.commands.length - 1].Index;
    }
    index += count;
    var cmd = new WorldCommand();
    cmd.Index = index;
    cmd.Func = func;
    this.commands.push(cmd);
  }


  constructor(private settings: WorldSimSettings) {
    this.addCommand(8, (bot, cmd) => {

      // step
      let x, y;
      [x, y] = this.getXYByAngle(bot, cmd * 45);
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
      else if (cell instanceof EatingWorldCell) {
        bot.health += 10;
        this.map[bot.y][bot.x] = new EmptyWorldCell();
        this.currentEating--;
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
      return true;
    });

    this.addCommand(8, (bot, cmd) => {
      // Grab or convert poison
      let x, y;
      [x, y] = this.getXYByAngle(bot, cmd * 45);
      var cell = this.map[y][x];
      if (cell instanceof PoisonWorldCell) {
        this.map[y][x] = new EatingWorldCell();
        this.currentEating++;
        this.currentPoison--;
        bot.addCommandAddr(1);
      }
      else if (cell instanceof WallWorldCell) {
        bot.addCommandAddr(2);
      }
      else if (cell instanceof BotWorldCell) {
        bot.addCommandAddr(3);
      }
      else if (cell instanceof EatingWorldCell) {
        bot.health += 10;
        this.map[y][x] = new EmptyWorldCell();
        this.currentEating--;
        bot.addCommandAddr(4);
      }
      else if (cell instanceof EmptyWorldCell) {
        bot.addCommandAddr(5);
      }
      else {
        throw new Error('cell type');
      }
      return false;
    });


    this.addCommand(8, (bot, cmd) => {
      // see
      let x, y;
      [x, y] = this.getXYByAngle(bot, cmd * 45);
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
      else if (cell instanceof EatingWorldCell) {
        bot.addCommandAddr(4);
      }
      else if (cell instanceof EmptyWorldCell) {
        bot.addCommandAddr(5);
      }
      else {
        throw new Error('cell type');
      }
      return false;
    });

    this.addCommand(8, (bot, cmd) => {
      // rotate
      bot.angle = (bot.angle + cmd * 45) % 360;
      bot.addCommandAddr(1);
      return false;
    });

    this.addCommand(settings.botMemoryLength, (bot, cmd) => {
      // jump
      bot.addCommandAddr(cmd);
      return false;
    });
  }


  stepIndex: number;
  liveBotCount: number;
  currentEating: number;
  currentPoison: number;
  currentWall: number;

  prepare(gens: WorldGenom[]) {
    this.stepIndex = 0;
    this.liveBotCount = gens.length;
    this.clear();
    this.createBots(gens);
    this.createWall();

    this.createEating();
    this.createPoison();
  }

  step() {
    this.liveBotCount = 0;
    this.stepIndex++;
    this.createEating();
    this.createPoison();

    for (var iBot = 0; iBot < this.bots.length; iBot++) {
      var bot = this.bots[iBot];
      var currentCommand = 0;
      if (!bot.isDead) {
        this.liveBotCount++;

        while (currentCommand++ < 10) {
          var command = bot.getCommand();

          var prev = 0;
          for (var iCmd = 0; iCmd < this.commands.length; iCmd++) {
            if (command < this.commands[iCmd].Index) {
              this.commands[iCmd].Func(bot, command - prev);
              break;
            }
            prev = this.commands[iCmd].Index;
          }
        }

        bot.health--;
        if (bot.isDead) {
          this.map[bot.y][bot.x] = new EatingWorldCell();
          this.currentEating++;
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
    x %= this.settings.width;
    if (x < 0) {
      x = this.settings.width - 1;
    }

    var y = (bot.y + dy);
    y %= this.settings.height;
    if (y < 0) {
      y = this.settings.height - 1;
    }

    return [x, y];
  }


  createBots(gens: WorldGenom[]) {
    this.bots = [];


    for (var i = 0; i < gens.length; i++) {
      var x, y, flag;
      var bot = new BotWorldCell(gens[i]);

      [x, y, flag] = this.getEmptyCell(-1);

      bot.x = x;
      bot.y = y;
      bot.angle = (MathHelper.getRandomInt(0, 8) * 45) % 360;
      this.map[y][x] = bot;
      this.bots.push(bot);
    }
  }

  private getEmptyCell(tryCount: number = 100) {

    while (tryCount != 0) {
      var x = MathHelper.getRandomInt(0, this.settings.width);
      var y = MathHelper.getRandomInt(0, this.settings.height);
      if (this.map[y][x] instanceof EmptyWorldCell) {
        return [x, y, true];
      }
      tryCount--;
    }
    return [-1, -1, false];
  }


  createEating(): void {
    while (this.currentEating / (this.settings.height * this.settings.width) < this.settings.eatingPercent) {
      var x, y, flag;
      [x, y, flag] = this.getEmptyCell();
      if (flag) {
        this.map[y][x] = new EatingWorldCell();
        this.currentEating++;
      }
      else {
        break;
      }
    }

  }

  createPoison(): void {
    while (this.currentPoison / (this.settings.height * this.settings.width) < this.settings.poisonPercent) {
      var x, y, flag;
      [x, y, flag] = this.getEmptyCell();
      if (flag) {
        this.map[y][x] = new PoisonWorldCell();
        this.currentPoison++;
      }
      else {
        break;
      }
    }
  }

  createWall(): void {
    while (this.currentWall / (this.settings.height * this.settings.width) < this.settings.wallPercent) {
      var x, y, flag;
      [x, y, flag] = this.getEmptyCell();
      if (flag) {
        this.map[y][x] = new WallWorldCell();
        this.currentWall++;
      }
      else {
        break;
      }
    }
  }


  clear() {
    this.currentEating = 0;
    this.currentPoison = 0;
    this.currentWall = 0;
    this.map = [];
    for (var y = 0; y < this.settings.height; y++) {
      var row: WorldCellModel[] = [];
      for (var x = 0; x < this.settings.width; x++) {
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


export class EatingWorldCell extends WorldCellModel {
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


export class WorldCommand {
  Index: number;
  Func: (BotWorldCell, number) => boolean;
}


export class WorldSimSettings {

  constructor(config: Partial<WorldSimSettings> = {}) {
    Object.assign(this, config);
  }

  botMemoryLength: number = 64;
  botCount: number = 64;

  width: number = 64;
  height: number = 64;

  eatingPercent: number = 0.2;
  poisonPercent: number = 0.1;
  wallPercent: number = 0.1;

  stepCount: number = 10000;
}
