import {distanceLength, distanceLengthPow2, MathHelper} from '../../../helpers/math-helper';
import {WorldGenom} from './world-genom';
import {WorldCellModel} from './world-cell-model';
import {WorldCellType} from './world-cell-type';
import {WorldBotState} from './world-bot-state';
import {WorldCommand} from './world-command';
import {WorldSimSettings} from './world-sim-settings';


export class WorldModel {
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
    this.addCommand(10, (bot, cmd) => {
      var possibleCmd = true;
      if (possibleCmd) {
        var canEat = Math.min(settings.botMaxEnergy - bot.health, 2 * (this.settings.height - bot.y) / this.settings.height);

        bot.health += canEat;
        bot.colorG += canEat;
        bot.addCommandAddr(1);
        return 1;
      }
      else {
        bot.addCommandAddr(1);
        return 0.1;
      }
    });

    this.addCommand(10, (bot, cmd) => {
      var possibleCmd = true;
      if (possibleCmd) {
        var angle = 0;
        let xy = this.getXYByAngle(bot, angle, 2 * this.settings.botRadius);
        if (xy == null) {
          bot.addCommandAddr(1);
          return 0.2;
        }

        var bot2 = this.findBot(xy.x, xy.y);
        if (bot2 == null) {
          bot.addCommandAddr(1);
          return 0.5;
        }

        // if (bot.genom.compare(bot2.genom) < 0.1) {
        //   bot.addCommandAddr(1);
        //   return 0.5;
        // }

        var canEat = Math.min(settings.botMaxEnergy - bot.health, bot2.health);
        bot.health += canEat;
        bot.colorR += canEat;
        bot2.health = 0;

        bot.addCommandAddr(2);
        return 1;
      }
      else {
        bot.addCommandAddr(1);
        return 0.5;
      }

    });


    // this.addCommand(11, (bot, cmd) => {
    //   // speed
    //   bot.speedX += (cmd - 6) * Math.cos(bot.angle * Math.PI / 180);
    //   bot.speedY += (cmd - 6) * Math.sin(bot.angle * Math.PI / 180);
    //   bot.addCommandAddr(1);
    //   return 0.5;
    // });

    // this.addCommand(8, (bot, cmd) => {
    //   // see
    //   let x, y, xy;
    //   xy = this.getXYByAngle(bot, cmd * 45);
    //   if (xy == null) {
    //     bot.addCommandAddr(1);
    //     return 0.1;
    //   }
    //   [x, y] = xy;
    //   var cell = this.map[y][x];
    //   switch (cell.type) {
    //     case WorldCellType.wall: {
    //       bot.addCommandAddr(2);
    //       break;
    //     }
    //     case WorldCellType.bot: {
    //       bot.addCommandAddr(3);
    //       break;
    //     }
    //     case WorldCellType.empty: {
    //       bot.addCommandAddr(4);
    //       break;
    //     }
    //   }
    //   return 0.1;
    // });

    this.addCommand(11, (bot, cmd) => {
      // rotate
      bot.angle = (bot.angle + cmd - 5);
      bot.addCommandAddr(1);
      return 0.1;
    });

    this.addCommand(settings.botMemoryLength, (bot, cmd) => {
      // jump
      bot.addCommandAddr(cmd);
      return 0.1;
    });
  }


  stepIndex: number;


  prepare(gens: WorldGenom[]) {
    this.stepIndex = 0;
    this.clear();
    this.createBots(gens);
  }

  step() {

    this.stepIndex++;


    for (var iBot = 0; iBot < this.bots.length; iBot++) {

      var bot = this.bots[iBot];

      if (bot.health <= 0) {
        continue;
      }

      var currentStepEnergy = 0;
      while (currentStepEnergy < 1) {
        var command = bot.getCommand();
        var cmd = this.commands[command];
        currentStepEnergy += cmd.func(bot, command - cmd.firstIndex);
      }


      bot.speedX += 1 * Math.cos(bot.angle * Math.PI / 180);
      bot.speedY += 1 * Math.sin(bot.angle * Math.PI / 180);


      var speedX = Math.sign(bot.speedX) * Math.min(Math.abs(bot.speedX), 5);
      var speedY = Math.sign(bot.speedY) * Math.min(Math.abs(bot.speedY), 5);


      var x = bot.x + speedX;
      var y = bot.y + speedY;
      if (x < 0) {
        x = -x;
        speedX = -speedX;
      }

      if (x > this.settings.width) {
        x = 2 * this.settings.width - x;
        speedX = -speedX;
      }

      if (y < 0) {
        y = -y;
        speedY = -speedY;
      }

      if (y > this.settings.height) {
        y = 2 * this.settings.height - y;
        speedY = -speedY;
      }


      if (!this.isCellIsEmpty(x, y, bot)) {
        speedX = -speedX;
        speedY = -speedY;
        x = bot.x;
        y = bot.y;
      }


      bot.x = x;
      bot.y = y;
      bot.speedX = speedX;
      bot.speedY = speedY;


      // bot.health -= Math.ceil(bot.age / 200);
      bot.health -= 1;
      // bot.health -= 1;
      bot.age++;


      if (this.bots.length < 10000 && bot.age > 50 && bot.health > this.settings.botMaxEnergy * 0.9) {
        // debugger;
        var freeXY = this.getFreePlace(bot);
        if (freeXY != null) {
          var genom2: WorldGenom = bot.genom.createChild(this);
          var bot2 = new WorldBotState(genom2);
          bot2.x = freeXY.x;
          bot2.y = freeXY.y;
          bot2.angle = MathHelper.getRandomInt(0, 360);
          bot2.health = bot.health;
          bot.health /= 2;
          this.bots.push(bot2);
        }
        else {
          bot.health = 0;
        }
      }


      // if (bot.health <= 0) {
      //   bot.isDead = true;
      //   bot.health = 20;
      // }
      // else {
      //   bot.age++;
      //
      //   bot.health = Math.min(bot.health, this.settings.botMaxEnergy);
      //
      //   liveBots.push(bot);
      //
      //   if (bot.age > 50 && bot.health > this.settings.botMaxEnergy * 0.9) {
      //     var freeXY = this.getFreePlace(bot);
      //     if (freeXY != null) {
      //       // debugger;
      //       var genom2: WorldGenom = bot.genom.createChild(this);
      //       var bot2 = new WorldBotState(genom2);
      //       bot2.x = freeXY[0];
      //       bot2.y = freeXY[1];
      //       bot2.angle = bot.angle;
      //       bot2.health = bot.health;
      //       bot.health /= 2;
      //       this.map[bot2.y][bot2.x].type = WorldCellType.bot;
      //       this.map[bot2.y][bot2.x].bot = bot2;
      //       liveBots.push(bot2);
      //     }
      //   }
      // }
    }

    this.bots = this.bots.filter(i => i.health > 0);

  }


  getXYByAngle(bot: WorldBotState, angle: number, distance: number): XYInfo {
    angle = (angle + bot.angle);
    var x = bot.x + distance * Math.cos(angle * Math.PI / 180);
    var y = bot.y + distance * Math.sin(angle * Math.PI / 180);
    if (x < 0 || x >= this.settings.width || y < 0 || y >= this.settings.height) {
      return null;
    }
    return {
      x: x,
      y: y,
    };
  }

  getFreePlace(bot: WorldBotState): XYInfo {
    // var startAngle = MathHelper.getRandomInt(0, 360);
    for (var angle = 0; angle < 360; angle += 1) {
      var xy = this.getXYByAngle(bot, 90+angle, this.settings.botRadius * 2);
      if (xy != null) {
        if (this.isCellIsEmpty(xy.x, xy.y)) {
          return xy;
        }
      }
    }
    return null;
  }


  createBots(gens: WorldGenom[]) {
    // debugger;

    this.bots = [];
    for (var i = 0; i < gens.length; i++) {
      var xy = this.getEmptyCellForBot();
      if (xy == null) {
        continue;
      }
      var bot = new WorldBotState(gens[i]);
      bot.x = xy.x;
      bot.y = xy.y;
      bot.angle = MathHelper.getRandomInt(0, 360);
      bot.speedX = 0;
      bot.speedY = 0;
      this.bots.push(bot);
    }

  }


  private isCellIsEmpty(x: number, y: number, botExcept: WorldBotState = null) {
    for (var i = 0; i < this.bots.length; i++) {
      var b = this.bots[i];
      if (b == botExcept) {
        continue;
      }

      if (distanceLengthPow2(x, y, b.x, b.y) < 4 * this.settings.botRadius * this.settings.botRadius) {
        return false;
      }
    }
    return true;
  }

  private findBot(x: number, y: number): WorldBotState {
    for (var i = 0; i < this.bots.length; i++) {
      var b = this.bots[i];
      if (distanceLengthPow2(x, y, b.x, b.y) < 4 * this.settings.botRadius * this.settings.botRadius) {
        return b;
      }
    }
    return null;
  }

  private getEmptyCellForBot(tryCount: number = 1000): XYInfo {

    while (tryCount != 0) {
      var x = MathHelper.getRandomArbitrary(0, this.settings.width);
      var y = MathHelper.getRandomArbitrary(0, this.settings.height);
      if (this.isCellIsEmpty(x, y)) {
        return {
          x: x,
          y: y
        };
      }
      tryCount--;
    }
    return null;
  }


  clear() {
  }
}


export interface XYInfo {
  x: number;
  y: number;
}




