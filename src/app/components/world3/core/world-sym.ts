import {WorldModel} from './world-model';
import {threadSleepAsync, workerAsync, WorkerState, workerStateAsync} from '../../../helpers/worker-async';
import {WorldBotState} from './world-bot-state';
import {MathHelper} from '../../../helpers/math-helper';
import {WorldGenom} from './world-genom';
import {WorldSimSettings} from './world-sim-settings';
import {TimerTask} from '../../../helpers/timer-task';

export class WorldSym {


  public world: WorldModel;


  constructor(public settings: WorldSimSettings, private paintFn: () => void) {
  }

  public iStep: number = -1;

  currentSym: TimerTask = new TimerTask();

  // info: string = '';

  stopSim() {
    this.currentSym.stop();
  }


  startSim() {
    if (this.currentSym.isBusy) {
      this.currentSym.stop();
    }

    this.world = new WorldModel(this.settings);
    var generation = this.createFirstGeneration();
    this.world.prepare(generation);
    if (this.settings.showMap) {
      this.paintFn();
    }

    this.iStep = 0;
    this.currentSym.start(() => {
      this.iStep++;
      var row = this.world.map[MathHelper.getRandomInt(0, this.world.map.length - 1)];
      var cell = row[MathHelper.getRandomInt(0, row.length - 1)];
      // cell.height = MathHelper.getRandomInt(0, 200);

      // this.world.step();

      if (this.settings.showMap) {
        this.paintFn();
      }
    });
  }


  createFirstGeneration(): WorldGenom[] {
    var generation: WorldGenom[] = [];
    for (var i = 0; i < this.settings.initBotCount; i++) {
      var g = new WorldGenom();
      for (var о = 0; о < this.settings.botMemoryLength; о++) {
        g.commands.push(MathHelper.getRandomInt(0, this.world.commands[this.world.commands.length - 1].index));
        // g.commands.push(0);
      }
      generation.push(g);
    }
    return generation;
  }


  // createNewGeneration(bots: WorldBotState[]): WorldGenom[] {
  //   var generation2: WorldGenom[] = [];
  //   var top = Math.ceil(bots.length * this.settings.newGenerationTopPercent);
  //   for (var i = 0; i < this.settings.botCount; i++) {
  //     var gen = new WorldGenom();
  //     gen.commands = [...(bots[i % top].genom.commands)];
  //     generation2.push(gen);
  //   }
  //
  //   this.mutation(generation2);
  //
  //   return generation2;
  // }
  //
  //
  // mutation(generation: WorldGenom[]) {
  //   for (var i = Math.ceil(generation.length * this.settings.mutantPercent); i < generation.length; i++) {
  //     var gen = generation[i];
  //     var cellCount = MathHelper.getRandomInt(0, gen.commands.length * this.settings.mutantCellPercent);
  //     for (var j = 0; j < cellCount; j++) {
  //       var cmdIndex = MathHelper.getRandomInt(0, gen.commands.length);
  //       gen.commands[cmdIndex] = MathHelper.getRandomInt(0, this.world.commands[this.world.commands.length - 1].index);
  //     }
  //   }
  // }
  //
  //
  // sex(g1: WorldGenom, g2: WorldGenom): WorldGenom {
  //   var rnd = Math.random();
  //   var a: WorldGenom[] = [g1, g2];
  //
  //   var genom: WorldGenom = new WorldGenom();
  //
  //   var ai = 0;
  //   for (var i = 0; i < a[ai].commands.length; i++) {
  //     genom.commands.push(a[ai].commands[i]);
  //     if (i % 8 == 0) {
  //       ai++;
  //       ai %= a.length;
  //     }
  //   }
  //
  //   return genom;
  // }
}
