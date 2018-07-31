import {MathHelper} from '../../../helpers/math-helper';
import {WorldGenom} from './world-genom';
import {WorldCellModel} from './world-cell-model';
import {WorldCellType} from './world-cell-type';
import {WorldBotState} from './world-bot-state';
import {WorldCommand} from './world-command';
import {MapCreationType, WorldSimSettings} from './world-sim-settings';
import {Perlin2D} from '../../../helpers/perlin2-d';


export var botGenomTypeCount: number = 2;


export class WorldModel {
  map: WorldCellModel[][] = [];
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

    var settings = this.settings;

    if (settings.commandPhotosynthesis) {
      this.addCommand(this.settings.commandPhotosynthesisMult, (bot, cmd) => {
        if (!settings.botGenomType || bot.genom.type == 0) {
          var canEat = Math.min(settings.botMaxEnergy - bot.health, settings.commandPhotosynthesisEnergy * this.map[bot.y][bot.x].height);
          bot.health += canEat;
          bot.colorG += canEat;
          bot.addCommandAddr(1);
          return 0.6;
        }
        else {
          bot.addCommandAddr(2);
          return 0.05;
        }
      });
    }


    if (settings.commandKill) {

      this.addCommand(8 * settings.commandKillMult, (bot, cmd) => {
        // Kill


        if (!settings.botGenomType || bot.genom.type == 1) {
          let xy = this.getXYByAngle(bot, (cmd % settings.commandKillMult) * 45);
          if (xy == null) {
            bot.addCommandAddr(1);
            return 0.2;
          }
          let x, y;
          [x, y] = xy;
          var cell = this.map[y][x];
          switch (cell.type) {
            case WorldCellType.wall:
              bot.addCommandAddr(2);
              return 0.2;
            case WorldCellType.empty:
              bot.addCommandAddr(3);
              return 0.2;
            case WorldCellType.bot: {
              var possibleEat = cell.bot.isDead || !settings.commandKillDontSimilar || (bot.genom.compare(this, cell.bot.genom) >= this.settings.mutantCellPercent / 100);
              if (possibleEat) {
                cell.bot.isDead = true;
                var canEat = Math.min(settings.botMaxEnergy - bot.health, cell.bot.health * settings.commandKillEnergyPercent / 100);
                bot.health += canEat;
                bot.colorR += canEat;

                cell.type = WorldCellType.empty;
                cell.bot = null;

                bot.addCommandAddr(4);
                return 0.6;
              }
              else {
                bot.addCommandAddr(5);
                return 0.5;
              }
            }
            default:
              throw Error();
          }
        }
        else {
          bot.addCommandAddr(1);
          return 0.05;
        }


      });
    }
    ;


    // this.addCommand(8 * 8, (bot, cmd) => {
    //   // altruism
    //   let xy = this.getXYByAngle(bot, (cmd % 8) * 45);
    //   if (xy == null) {
    //     bot.addCommandAddr(1);
    //     return 0.1;
    //   }
    //   let x, y;
    //   [x, y] = xy;
    //   var cell = this.map[y][x];
    //   switch (cell.type) {
    //     case WorldCellType.wall:
    //       bot.addCommandAddr(1);
    //       return 0.1;
    //     case WorldCellType.empty:
    //       bot.addCommandAddr(1);
    //       return 0.1;
    //     case WorldCellType.bot: {
    //       var possibleGiveEnergy = !cell.bot.isDead && (bot.genom.compare(cell.bot.genom) < this.settings.mutantCellPercent / 100);
    //       if (possibleGiveEnergy) {
    //
    //         if (cell.bot.health < bot.health) {
    //           var canEat = Math.min(settings.botMaxEnergy - cell.bot.health, bot.health * 0.2);
    //           cell.bot.health += canEat;
    //           bot.health -= canEat;
    //           bot.addCommandAddr(2);
    //           return 0.1;
    //
    //         }
    //         else {
    //           bot.addCommandAddr(1);
    //           return 0.1;
    //         }
    //
    //       }
    //       else {
    //         bot.addCommandAddr(1);
    //         return 0.1;
    //       }
    //     }
    //     default:
    //       throw Error();
    //   }
    // });


    if (settings.commandMove) {
      this.addCommand(8 * this.settings.commandMoveMult, (bot, cmd) => {
        // step
        let x, y, xy;
        xy = this.getXYByAngle(bot, cmd % this.settings.commandMoveMult * 45);
        if (xy == null) {
          bot.addCommandAddr(1);
          return 0.3;
        }
        [x, y] = xy;
        var cell = this.map[y][x];

        switch (cell.type) {
          case WorldCellType.wall: {
            bot.addCommandAddr(2);
            return 0.3;
          }
          case WorldCellType.bot: {
            bot.addCommandAddr(3);
            return 0.3;
          }
          case WorldCellType.empty: {
            this.map[bot.y][bot.x].type = WorldCellType.empty;
            this.map[bot.y][bot.x].bot = null;
            bot.x = x;
            bot.y = y;
            cell.type = WorldCellType.bot;
            cell.bot = bot;
            bot.addCommandAddr(4);
            return 0.8;
          }
          default:
            throw new Error();
        }
      });
    }

    if (settings.commandSee) {

      this.addCommand(8 * settings.commandSeeMult, (bot, cmd) => {
        // see
        let x, y, xy;
        xy = this.getXYByAngle(bot, cmd % settings.commandSeeMult * 45);
        if (xy == null) {
          bot.addCommandAddr(1);
          return 0.1;
        }
        [x, y] = xy;
        var cell = this.map[y][x];
        switch (cell.type) {
          case WorldCellType.wall: {
            bot.addCommandAddr(2);
            break;
          }
          case WorldCellType.bot: {
            bot.addCommandAddr(3);
            break;
          }
          case WorldCellType.empty: {
            bot.addCommandAddr(4);
            break;
          }
        }
        return 0.1;
      });

    }

    if (settings.commandRotate) {
      this.addCommand(8 * settings.commandRotateMult, (bot, cmd) => {
        // rotate
        bot.angle = (bot.angle + cmd % settings.commandRotateMult * 45) % 360;
        bot.addCommandAddr(1);
        return 0.2;
      });
    }

    if (settings.commandMemoryJump) {
      this.addCommand(settings.botMemoryLength, (bot, cmd) => {
        // jump
        bot.addCommandAddr(cmd);
        return 0.05;
      });
    }
  }


  stepIndex: number;


  prepare(gens: WorldGenom[]) {
    this.stepIndex = 0;
    this.clear();
    this.createWall();
    this.createBots(gens);
  }

  step() {

    var liveBots: WorldBotState[] = [];
    this.stepIndex++;


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
      // bot.health -= Math.ceil(bot.age / 100);
      bot.health -= 1;
      if (bot.health <= 0) {
        bot.isDead = true;
        bot.health = 20;
        if (!this.settings.enableDeadBots) {
          let cell = this.map[bot.y][bot.x];
          cell.type = WorldCellType.empty;
          cell.bot = null;
        }
      }
      else {
        bot.age++;

        bot.health = Math.min(bot.health, this.settings.botMaxEnergy);

        liveBots.push(bot);


        if (bot.health > this.settings.botMaxEnergy * 0.9) {
          // if (bot.age - bot.lastGiveBirth > 50 && bot.health > this.settings.botMaxEnergy * 0.9) {
          var freeXY = this.getFreePlace(bot);
          if (freeXY != null) {
            // debugger;
            bot.lastGiveBirth = bot.age;
            var genom2: WorldGenom = bot.genom.createChild(this);
            var bot2 = new WorldBotState(genom2);
            bot2.x = freeXY[0];
            bot2.y = freeXY[1];
            bot2.angle = bot.angle;
            bot2.health = bot.health / 2;
            bot.health = bot.health / 2;
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

    for (var angle = 0; angle < 360; angle += 45) {
      var xy = this.getXYByAngle(bot, angle + 180);
      if (xy != null) {
        if (this.map[xy[1]][xy[0]].type == WorldCellType.empty) {
          return xy;
        }
      }
    }
    return null;
  }


  getXYByDxDy(bot: WorldBotState, dx: number, dy: number): number[] {
    var x = bot.x + dx;
    var y = bot.y + dy;

    if (x >= this.settings.width || x < 0) {
      return null;
    }
    if (y >= this.settings.height || y < 0) {
      return null;
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

  createWall(): void {
    var currentWall = 0;
    while (currentWall / (this.settings.height * this.settings.width) < this.settings.wallPercent / 100) {
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

    var mapCreationType = this.settings.mapCreationType;

    var perlin: Perlin2D = null;
    if (mapCreationType == MapCreationType.World) {
      perlin = new Perlin2D();
    }

    this.map = [];
    for (var y = 0; y < this.settings.height; y++) {
      var row: WorldCellModel[] = [];
      for (var x = 0; x < this.settings.width; x++) {
        var cell = new WorldCellModel();

        switch (mapCreationType) {
          case MapCreationType.Gradient: {
            cell.height = (this.settings.height - y) / this.settings.height;
            break;
          }
          case MapCreationType.Same: {
            cell.height = 1;
            break;
          }
          case MapCreationType.World: {
            let f = 160;
            let value = perlin.getNoise4(x / f, y / f, 8, 0.45);        // вычисляем точку ландшафта
            cell.height = (Math.floor(value * 255 + 128) & 255) / 255;
            break;
          }

        }

        row.push(cell);


      }
      this.map.push(row);
    }
  }
}




