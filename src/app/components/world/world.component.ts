import {ApplicationRef, ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {WorldBotState, WorldModel, WorldSimSettings} from './core/world-model';
import {WorldGenom} from './core/world-genom';
import {MathHelper} from '../../helpers/math-helper';
import {b} from '@angular/core/src/render3';
import {ActivatedRoute} from '@angular/router';
import {workerAsync, WorkerState, workerStateAsync} from '../../helpers/worker-async';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements OnInit {

  constructor(private route: ActivatedRoute, private app: ApplicationRef, private chd: ChangeDetectorRef, private zone: NgZone) {
  }

  settings: WorldSimSettings = new WorldSimSettings();


  world: WorldModel;
  iGeneration: number = 0;
  iStep: number;

  info: string = '';

  stepCountHistory: number[] = [];

  curSimWorker: WorkerState = new WorkerState();

  bestGen: WorldGenom;

  get eatingPercent(): number {
    return Math.floor(this.settings.eatingPercent * 100);
  }

  set eatingPercent(v: number) {
    this.settings.eatingPercent = v / 100;
  }

  get poisonPercent(): number {
    return Math.floor(this.settings.poisonPercent * 100);
  }

  set poisonPercent(v: number) {
    this.settings.poisonPercent = v / 100;
  }

  get wallPercent(): number {
    return Math.floor(this.settings.wallPercent * 100);
  }

  set wallPercent(v: number) {
    this.settings.wallPercent = v / 100;
  }


  _speed: number = 1;

  get stepCountHistoryMid(): number {
    return this.stepCountHistory.reduce((s, i) => s + i, 0) / this.stepCountHistory.length;
  }

  get speed(): number {
    return this._speed;
  }

  set speed(v: number) {
    this._speed = v;
  }


  startSim() {

    this.curSimWorker.terminate();
    this.curSimWorker.result.then(() => {
      this.curSimWorker = workerStateAsync(async (state) => {
        this.stepCountHistory = [];
        this.world = new WorldModel(this.settings);
        var generation = this.createFirstGeneration();


        var d1: Date = null;

        for (var iGeneration = 0; true; iGeneration++) {

          if (state.terminated) {
            return;
          }
          await workerAsync(async () => {

            this.iGeneration = iGeneration;
            this.world.prepare(generation);


            for (var iStep = 0; (iStep < this.settings.stepCount) && (this.world.liveBotsCount > 0); iStep++) {
              if (state.terminated) {
                return;
              }
              await workerAsync(async () => {
                this.iStep = iStep;
                this.world.step();

              }, this.iStep % this._speed != 0);
            }

            this.stepCountHistory.push(Math.floor(iStep * 100 / this.settings.stepCount));
            if (this.stepCountHistory.length > 50) {
              this.stepCountHistory.shift();
            }


            this.info = '';

            var bots: WorldBotState[] = [...this.world.bots];
            bots.sort((a: WorldBotState, b: WorldBotState) => {
              return b.health - a.health;
            });

            this.bestGen = bots[0].genom;

            this.info += `Bots:`;
            for (var b = 0; b < Math.min(10, bots.length); b++) {
              var s = bots[b].health.toString();
              while (s.length < 6) s = ' ' + s;
              this.info += ' ' + s;
            }


            this.info += '\nGenom:\n' + bots[0].genom.commands.map(i => {
              var s = i.toString();
              while (s.length < 4) {
                s = '0' + s;
              }
              return s;
            }).join(' ');


            generation = this.createNewGeneration(bots);

            var d2 = new Date();
            if (d1) {
              this.info += '\nGenTime: ' + (((d2.getTime()) - d1.getTime())).toString();
            }
            d1 = d2;

            this.info += '\nLiveBots: ' + this.world.liveBotsCount;

            // console.log(this.info);
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


  ngOnInit() {

    if (this.route.snapshot.queryParams.speed) {
      this.speed = this.route.snapshot.queryParams.speed;
    }
    if (this.route.snapshot.queryParams.autoStart) {
      this.startSim();
    }


  }


  createNewGeneration(bots: WorldBotState[]): WorldGenom[] {
    var generation2: WorldGenom[] = [];

    // for (var i = 0; i < bots.length; i++) {
    //   var g1 = bots[i % 16].genom;
    //
    //   var rnd = Math.random();
    //
    //   var g2 = bots[MathHelper.getRandomInt(0, Math.floor(i * rnd * rnd))].genom;
    //
    //
    //   generation2.push(this.sex(g1, g2));
    // }

    var top = Math.ceil(bots.length * this.settings.newGenerationTopPercent);
    for (var i = 0; i < bots.length; i++) {
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


