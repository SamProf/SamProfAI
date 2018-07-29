import {MathHelper} from '../../../helpers/math-helper';
import {WorldGenom} from './world-genom';
import {WorldCellModel} from './world-cell-model';
import {WorldCellType} from './world-cell-type';
import {WorldBotState} from './world-bot-state';
import {WorldCommand} from './world-command';
import {WorldSimSettings} from './world-sim-settings';


export class WorldModel {
  map: WorldCellModel[][] = [];
  energy: number[][] = [];
  bots: WorldBotState[] = [];
  commands: WorldCommand[] = [];

  addCommand(count: number, func: (BotWorldCell, number) => number) {
    var firstIndex = this.commands.length;
    var index = firstIndex + count;
    var cmd = new WorldCommand();
    cmd.firstIndex = firstIndex;
    cmd.index = index;
    cmd.func = func;
    for (var i = 0; i < count; i++) {
      this.commands.push(cmd);
    }
  }


  constructor(public settings: WorldSimSettings) {


    this.addCommand(8, (bot, cmd) => {
      // catch
      let x, y;
      [x, y] = this.getXYByAngle(bot, cmd * 45);
      var cell = this.map[y][x];
      switch (cell.type) {
        case WorldCellType.wall:
        case WorldCellType.empty:
          bot.addCommandAddr(1);
          return 0.2;
        case WorldCellType.bot: {
          var canEat = Math.min(settings.botMaxEnergy - bot.health, cell.bot.health);
          bot.health += canEat;
          bot.energyKill += canEat;
          cell.bot.health = 0;
          if (cell.bot.isDead) {
            cell.type = WorldCellType.empty;
            cell.bot = null;
          }

          bot.addCommandAddr(2);
          return 1.0;
        }
        default:
          return 1;

        // case WorldCellType.empty: {
        //   var canEat = Math.min(settings.botMaxEnergy - bot.health, this.energy[y][x]);
        //   bot.health += canEat;
        //   bot.energyEat += canEat;
        //   this.energy[y][x] -= canEat;
        //   bot.addCommandAddr(3);
        //   break;
        // }
      }
    });


    this.addCommand(8, (bot, cmd) => {
      var canEat = Math.min(settings.botMaxEnergy - bot.health, this.energy[bot.y][bot.x]);
      bot.health += canEat;
      bot.energyEat += canEat;
      this.energy[bot.y][bot.x] -= canEat;
      bot.addCommandAddr(1);
      return 0.4;
    });

    this.addCommand(8, (bot, cmd) => {
      // step
      let x, y;
      [x, y] = this.getXYByAngle(bot, cmd * 45);
      var cell = this.map[y][x];

      switch (cell.type) {
        case WorldCellType.wall: {
          bot.addCommandAddr(1);
          return 0.3;
        }
        case WorldCellType.bot: {
          bot.addCommandAddr(2);
          return 0.3;
        }
        case WorldCellType.empty: {
          this.map[bot.y][bot.x].type = WorldCellType.empty;
          bot.x = x;
          bot.y = y;
          cell.type = WorldCellType.bot;
          cell.bot = bot;
          bot.addCommandAddr(3);
          return 1;

        }
        default:
          return 1;
      }

    });

    this.addCommand(8, (bot, cmd) => {
      // see
      let x, y;
      [x, y] = this.getXYByAngle(bot, cmd * 45);
      var cell = this.map[y][x];
      switch (cell.type) {
        case WorldCellType.wall: {
          bot.addCommandAddr(1);
          break;
        }
        case WorldCellType.bot: {
          bot.addCommandAddr(2);
          break;
        }
        case WorldCellType.empty: {
          bot.addCommandAddr(3);
          break;
        }
      }
      return 0.1;
    });

    this.addCommand(8, (bot, cmd) => {
      // rotate
      bot.angle = (bot.angle + cmd * 45) % 360;
      bot.addCommandAddr(1);
      return 0.2;
    });

    this.addCommand(settings.botMemoryLength, (bot, cmd) => {
      // jump
      bot.addCommandAddr(cmd);
      return 0.05;
    });
  }


  stepIndex: number;


  prepare(gens: WorldGenom[]) {
    this.stepIndex = 0;
    this.clear();
    this.createWall();
    this.createBots(gens);
    this.createEnergy();
  }

  step() {

    var liveBots: WorldBotState[] = [];
    this.stepIndex++;
    this.createEnergy();


    for (var iBot = 0; iBot < this.bots.length; iBot++) {

      var bot = this.bots[iBot];
      if (bot.isDead) {
        continue;
      }

      var currentStepEnergy = 0;
      while (currentStepEnergy < 1) {
        var command = bot.getCommand();
        var cmd = this.commands[command];
        currentStepEnergy += cmd.func(bot, command - cmd.firstIndex);
      }
      // bot.health -= bot.age / 100;
      bot.health -= 1;
      if (bot.isDead) {
        this.map[bot.y][bot.x].type = WorldCellType.empty;
        this.map[bot.y][bot.x].bot = null;
      }
      else {
        bot.age++;

        bot.health = Math.min(bot.health, this.settings.botMaxEnergy);

        liveBots.push(bot);

        if (bot.age > 50 && bot.health > this.settings.botMaxEnergy * 0.8) {
          var freeXY = this.getFreePlace(bot);
          if (freeXY != null) {
            // debugger;
            var genom2: WorldGenom = bot.genom.createChild(this);
            var bot2 = new WorldBotState(genom2);
            bot2.x = freeXY[0];
            bot2.y = freeXY[1];
            bot2.angle = bot.angle;
            bot.health /= 2;
            bot2.health = bot.health;
            this.map[bot2.y][bot2.x].type = WorldCellType.bot;
            this.map[bot2.y][bot2.x].bot = bot2;
            liveBots.push(bot2);
          }
        }
      }
    }

    this.bots = liveBots;

  }


  dataDxDyByAngle: number[][] = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
  ];

  getXYByAngle(bot: WorldBotState, angle: number): number[] {
    angle = ((bot.angle + angle) % 360);
    var dx, dy;
    [dx, dy] = this.dataDxDyByAngle[angle / 45];
    return this.getXYByDxDy(bot, dx, dy);
  }

  getFreePlace(bot: WorldBotState): number[] {
    var x, y;
    for (var angle = 0; angle < 360; angle += 45) {
      [x, y] = this.getXYByAngle(bot, angle);
      if (this.map[y][x].type == WorldCellType.empty) {
        return [x, y];
      }
    }
    return null;
  }


  getXYByDxDy(bot: WorldBotState, dx: number, dy: number): number[] {
    var x = (bot.x + dx) % this.settings.width;
    if (x < 0) {
      x = x + this.settings.width;
    }

    var y = (bot.y + dy) % this.settings.height;
    if (y < 0) {
      y = y + this.settings.height;
    }
    return [x, y];
  }


  createBots(gens: WorldGenom[]) {

    this.bots = [];
    for (var i = 0; i < gens.length; i++) {
      var x, y, flag;
      var bot = new WorldBotState(gens[i]);

      [x, y, flag] = this.getEmptyCell(-1);

      bot.x = x;
      bot.y = y;
      bot.angle = (MathHelper.getRandomInt(0, 8) * 45) % 360;
      this.map[y][x].type = WorldCellType.bot;
      this.map[y][x].bot = bot;
      this.bots.push(bot);
    }

  }

  private getEmptyCell(tryCount: number = 100) {

    while (tryCount != 0) {
      var x = MathHelper.getRandomInt(0, this.settings.width);
      var y = MathHelper.getRandomInt(0, this.settings.height);
      if (this.map[y][x].type == WorldCellType.empty) {
        return [x, y, true];
      }
      tryCount--;
    }
    return [-1, -1, false];
  }


  createEnergy(): void {

    for (var y = 0; y < this.energy.length; y++) {
      var rowEnergy = this.energy[y];
      var row = this.map[y];
      for (var x = 0; x < row.length; x++) {
        if (row[x].type == WorldCellType.empty) {
          rowEnergy[x] = Math.min(rowEnergy[x] + this.settings.energyCellGrow, this.settings.energyCellMax);
        }
      }
    }
  }


  createWall(): void {
    var currentWall = 0;
    while (currentWall / (this.settings.height * this.settings.width) < this.settings.wallPercent) {
      var x, y, flag;
      [x, y, flag] = this.getEmptyCell();
      if (flag) {
        this.map[y][x].type = WorldCellType.wall;
        currentWall++;
      }
      else {
        break;
      }
    }
  }


  clear() {
    this.energy = [];
    this.map = [];
    for (var y = 0; y < this.settings.height; y++) {
      var row: WorldCellModel[] = [];
      var rowEnergy: number[] = [];
      for (var x = 0; x < this.settings.width; x++) {
        row.push(new WorldCellModel());
        rowEnergy.push(this.settings.energyCellInit);
      }
      this.map.push(row);
      this.energy.push(rowEnergy);
    }
  }
}




