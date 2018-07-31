import {WorldModel} from './world-model';
import {threadSleepAsync, workerAsync, WorkerState, workerStateAsync} from '../../../helpers/worker-async';
import {WorldBotState} from './world-bot-state';
import {MathHelper} from '../../../helpers/math-helper';
import {WorldGenom} from './world-genom';
import {WorldSimSettings} from './world-sim-settings';

export class WorldSym {


  public world: WorldModel;


  constructor(public settings: WorldSimSettings, private paintFn: () => void) {
  }

  public lastStepCounts: number[] = [];
  public iGeneration: number = -1;
  public iStep: number = -1;

  currentSym: WorkerState = new WorkerState();

  info: string = '';

  stopSim() {
    this.currentSym.terminate();
  }


  startSim() {

    this.currentSym.terminate();
    this.currentSym.result.then(() => {
      this.currentSym = workerStateAsync(async (state) => {
        this.lastStepCounts = [];
        this.world = new WorldModel(this.settings);
        var generation = this.createFirstGeneration();

        var d1: Date = new Date();

        for (var iGeneration = 0; true; iGeneration++) {

          if (state.terminated) {
            return;
          }
          await workerAsync(async () => {

            this.iGeneration = iGeneration;
            this.world.prepare(generation);

            if (this.settings.showMap) {
              this.paintFn();
            }

            for (var iStep = 0; (iStep < this.settings.stepCount) && (this.world.liveBotsCount > (this.settings.simToLast ? 0 : this.settings.newGenerationTopPercent * generation.length)); iStep++) {
              if (state.terminated) {
                return;
              }
              // var stepDate1 = new Date();
              await workerAsync(async () => {
                this.iStep = iStep;
                this.world.step();
              }, this.settings.notSoFast ? 100 : 0);

              if (this.settings.showMap) {
                this.paintFn();
                // var stepTimeMs = 100 - (new Date().getTime() - stepDate1.getTime());
                // if (stepTimeMs >= 0) {
                //   await threadSleepAsync(stepTimeMs);
                // }


              }
            }


            var bots: WorldBotState[] = [...this.world.bots];
            bots.sort((a: WorldBotState, b: WorldBotState) => {
              return b.health - a.health;
            });


            generation = this.createNewGeneration(bots);


            this.lastStepCounts.push(iStep);
            while (this.lastStepCounts.length > 50) {
              this.lastStepCounts.shift();
            }


            this.info = 'Last Generation: ' + iGeneration;
            this.info += '\nStep count: ' + iStep;
            this.info += '\nStep count mid: ' + (this.lastStepCounts.reduce((s, i) => s + i, 0) / this.lastStepCounts.length).toFixed(0);
            this.info += '\nLive bots: ' + this.world.liveBotsCount.toString().padStart(8);
            this.info += '\nBest Health:' + bots.slice(0, Math.min(13, bots.length)).map(i => i.health.toString().padStart(7, ' ')).join(' ');
            this.info += '\nBest Bot Genom: \n' + bots[0].genom.commands.map(i => i.toString().padStart(4, '0')).join(' ');


            var d2 = new Date();
            this.info += '\nGen time: ' + (d2.getTime() - d1.getTime()).toString().padStart(10) + ' ms';
            d1 = d2;


            console.log(this.info);
            this.paintFn();

          });
        }
      });
    });


  }


  createFirstGeneration(): WorldGenom[] {
    var generation: WorldGenom[] = [];
    for (var i = 0; i < this.settings.botCount; i++) {
      var g = new WorldGenom();
      for (var о = 0; о < this.settings.botMemoryLength; о++) {
        g.commands.push(MathHelper.getRandomInt(0, this.world.commands[this.world.commands.length - 1].index));
      }
      generation.push(g);
    }
    return generation;
  }


  createNewGeneration(bots: WorldBotState[]): WorldGenom[] {
    var generation2: WorldGenom[] = [];
    var top = Math.ceil(bots.length * this.settings.newGenerationTopPercent);
    for (var i = 0; i < this.settings.botCount; i++) {
      var gen = new WorldGenom();
      gen.commands = [...(bots[i % top].genom.commands)];
      generation2.push(gen);
    }

    this.mutation(generation2);

    return generation2;
  }


  mutation(generation: WorldGenom[]) {
    for (var i = Math.ceil(generation.length * this.settings.mutantPercent); i < generation.length; i++) {
      var gen = generation[i];
      var cellCount = MathHelper.getRandomInt(0, gen.commands.length * this.settings.mutantCellPercent);
      for (var j = 0; j < cellCount; j++) {
        var cmdIndex = MathHelper.getRandomInt(0, gen.commands.length);
        gen.commands[cmdIndex] = MathHelper.getRandomInt(0, this.world.commands[this.world.commands.length - 1].index);
      }
    }
  }


  sex(g1: WorldGenom, g2: WorldGenom): WorldGenom {
    var rnd = Math.random();
    var a: WorldGenom[] = [g1, g2];

    var genom: WorldGenom = new WorldGenom();

    var ai = 0;
    for (var i = 0; i < a[ai].commands.length; i++) {
      genom.commands.push(a[ai].commands[i]);
      if (i % 8 == 0) {
        ai++;
        ai %= a.length;
      }
    }

    return genom;
  }
}
