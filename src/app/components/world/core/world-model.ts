import {MathHelper} from '../../../helpers/math-helper';
import {WorldGenom} from './world-genom';
import {WorldCellModel} from './world-cell-model';
import {WorldCellType} from './world-cell-type';
import {WorldBotState} from './world-bot-state';
import {WorldCommand} from './world-command';
import {WorldSimSettings} from './world-sim-settings';


export class WorldModel {
  map: WorldCellModel[][] = [];
  commands: WorldCommand[] = [];
  bots: WorldBotState[] = [];


  addCommand(count: number, func: (BotWorldCell, number) => boolean) {
    // var firstIndex = 0;
    // if (this.commands.length) {
    //   firstIndex = this.commands[this.commands.length - 1].index;
    // }
    // var index = firstIndex + count;
    // var cmd = new WorldCommand();
    // cmd.firstIndex = firstIndex;
    // cmd.index = index;
    // cmd.func = func;
    // this.commands.push(cmd);

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


  private dataDxDyLongByAngle: number[][] = [
    [0, -2],
    [1, -2],
    [2, -2],
    [2, -1],
    [2, 0],
    [2, 1],
    [2, 2],
    [1, 2],
    [0, 2],
    [-1, 2],
    [-2, 2],
    [-2, 1],
    [-2, 0],
    [-2, -1],
    [-2, -2],
    [-1, -2],
  ];

  constructor(private settings: WorldSimSettings) {
    this.addCommand(8, (bot, cmd) => {

      // step
      let x, y;
      [x, y] = this.getXYByAngle(bot, cmd * 45);
      var cell = this.map[y][x];

      switch (cell.type) {
        case WorldCellType.poison: {
          bot.health = 0;
          bot.addCommandAddr(1);
          break;
        }
        case WorldCellType.wall: {
          bot.addCommandAddr(2);
          break;
        }
        case WorldCellType.bot: {
          bot.addCommandAddr(3);
          break;
        }
        case WorldCellType.eating: {
          bot.health += 10;
          this.map[bot.y][bot.x].type = WorldCellType.empty;
          this.currentEating--;
          bot.x = x;
          bot.y = y;
          cell.type = WorldCellType.bot;
          cell.bot = bot;

          bot.addCommandAddr(4);
          break;
        }
        case WorldCellType.empty: {
          this.map[bot.y][bot.x].type = WorldCellType.empty;
          bot.x = x;
          bot.y = y;
          cell.type = WorldCellType.bot;
          cell.bot = bot;

          bot.addCommandAddr(5);
          break;
        }
      }
      return true;
    });

    this.addCommand(8, (bot, cmd) => {
      // Grab or convert poison
      let x, y;
      [x, y] = this.getXYByAngle(bot, cmd * 45);
      var cell = this.map[y][x];

      switch (cell.type) {
        case WorldCellType.poison: {
          this.map[y][x].type = WorldCellType.eating;
          this.currentEating++;
          this.currentPoison--;
          bot.addCommandAddr(1);
          break;
        }
        case WorldCellType.wall: {
          bot.addCommandAddr(2);
          break;
        }
        case WorldCellType.bot: {
          bot.addCommandAddr(3);
          break;
        }
        case WorldCellType.eating: {
          bot.health += 10;
          cell.type = WorldCellType.empty;
          this.currentEating--;
          bot.addCommandAddr(4);
          break;
        }
        case WorldCellType.empty: {
          bot.addCommandAddr(5);
          break;
        }
      }
      return false;
    });


    this.addCommand(8, (bot, cmd) => {
      // see
      let x, y;
      [x, y] = this.getXYByAngle(bot, cmd * 45);
      var cell = this.map[y][x];


      switch (cell.type) {
        case WorldCellType.poison: {
          bot.addCommandAddr(1);
          break;
        }
        case WorldCellType.wall: {
          bot.addCommandAddr(2);
          break;
        }
        case WorldCellType.bot: {
          bot.addCommandAddr(3);
          break;
        }
        case WorldCellType.eating: {
          bot.addCommandAddr(4);
          break;
        }
        case WorldCellType.empty: {
          bot.addCommandAddr(5);
          break;
        }
      }


      return false;
    });

    if (this.settings.longSee) {
      this.addCommand(16, (bot, cmd) => {
        // see


        let dx, dy;
        let x, y;

        [dx, dy] = this.dataDxDyLongByAngle[(((cmd * 45) + bot.angle) % 360) / 45];
        [x, y] = this.getXYByDxDy(bot, dx, dy);
        var cell = this.map[y][x];

        switch (cell.type) {
          case WorldCellType.poison: {
            bot.addCommandAddr(1);
            break;
          }
          case WorldCellType.wall: {
            bot.addCommandAddr(2);
            break;
          }
          case WorldCellType.bot: {
            bot.addCommandAddr(3);
            break;
          }
          case WorldCellType.eating: {
            bot.addCommandAddr(4);
            break;
          }
          case WorldCellType.empty: {
            bot.addCommandAddr(5);
            break;
          }
        }

        return false;
      });
    }

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
  liveBotsCount: number;
  currentEating: number;
  currentPoison: number;
  currentWall: number;

  prepare(gens: WorldGenom[]) {
    this.stepIndex = 0;
    this.clear();
    this.createBots(gens);
    this.createWall();

    this.createEating();
    this.createPoison();
  }

  step() {
    this.liveBotsCount = 0;
    var liveBots: WorldBotState[] = [];
    this.stepIndex++;
    this.createEating();
    this.createPoison();

    for (var iBot = 0; iBot < this.bots.length; iBot++) {
      var bot = this.bots[iBot];

      if (!bot.isDead) {
        var currentCommand = 0;
        while (currentCommand++ < 10) {
          var command = bot.getCommand();


          var cmd = this.commands[command];
          if (cmd.func(bot, command - cmd.firstIndex)) {
            break;
          }


          // for (var iCmd = 0; iCmd < this.commands.length; iCmd++) {
          //   var cmd = this.commands[iCmd];
          //   if (command < cmd.index) {
          //     cmd.func(bot, command - cmd.firstIndex);
          //     break;
          //   }
          // }
        }

        bot.health--;
        if (bot.isDead) {
          this.map[bot.y][bot.x].type = WorldCellType.eating;
          this.currentEating++;

        }
        else {
          this.liveBotsCount++;
        }

        bot.health = Math.min(bot.health, 100);
      }
      else {
        bot.health--;
      }
    }

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
    this.liveBotsCount = this.bots.length;
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


  createEating(): void {
    while (this.currentEating / (this.settings.height * this.settings.width) < this.settings.eatingPercent) {
      var x, y, flag;
      [x, y, flag] = this.getEmptyCell();
      if (flag) {
        this.map[y][x].type = WorldCellType.eating;
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
        this.map[y][x].type = WorldCellType.poison;
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
        this.map[y][x].type = WorldCellType.wall;
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
        row.push(new WorldCellModel());
      }
      this.map.push(row);
    }
  }
}




