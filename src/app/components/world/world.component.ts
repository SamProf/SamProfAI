import {Component, OnInit} from '@angular/core';
import {BotWorldCell, WorldModel, WorldSimSettings} from './core/world-model';
import {WorldGenom} from './core/world-genom';
import {MathHelper} from '../../helpers/math-helper';
import {b} from '@angular/core/src/render3';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements OnInit {

  constructor(private route: ActivatedRoute) {
  }

  settings: WorldSimSettings;
  newSettings: WorldSimSettings = new WorldSimSettings();

  world: WorldModel;
  iGeneration: number = 0;
  iStep: number;

  info: string = '';

  stepCountHistory: number[] = [];

  curSimAsync: Promise<void> = Promise.resolve();
  curSimStop: boolean = false;


  get eatingPercent(): number {
    return Math.floor(this.newSettings.eatingPercent * 100);
  }

  set eatingPercent(v: number) {
    this.newSettings.eatingPercent = v / 100;
  }

  get poisonPercent(): number {
    return Math.floor(this.newSettings.poisonPercent * 100);
  }

  set poisonPercent(v: number) {
    this.newSettings.poisonPercent = v / 100;
  }

  get wallPercent(): number {
    return Math.floor(this.newSettings.wallPercent * 100);
  }

  set wallPercent(v: number) {
    this.newSettings.wallPercent = v / 100;
  }


  _speed: number = 1;

  get speed(): number {
    return this._speed;
  }

  set speed(v: number) {
    this._speed = v;
  }


  startSim() {

    this.curSimStop = true;
    this.curSimAsync.then(() => {
      this.curSimAsync = this.setTimeoutAsync(async () => {
        this.curSimStop = false;
        this.stepCountHistory = [];
        this.settings = new WorldSimSettings(this.newSettings);
        this.world = new WorldModel(this.settings);
        var generation = this.createFirstGeneration();

        var d1: Date = null;

        for (var iGeneration = 0; true; iGeneration++) {
          if (this.curSimStop) {
            return;
          }

          this.iGeneration = iGeneration;
          this.world.prepare(generation);

          await this.setTimeoutAsync(async () => {
            if (this.curSimStop) {
              return;
            }

            for (var iStep = 0; (iStep < this.settings.stepCount) && (this.world.liveBotCount > 0);) {
              if (this.curSimStop) {
                return;
              }

              await this.setTimeoutAsync(async () => {
                if (this.curSimStop) {
                  return;
                }
                for (var iStep2 = 0; (iStep < this.settings.stepCount) && (iStep2 < this.speed) && (this.world.liveBotCount > 0); iStep++, iStep2++) {
                  this.iStep = iStep;
                  this.world.step();
                }
              });
            }

            this.stepCountHistory.push(Math.floor(iStep * 100 / this.settings.stepCount));
            if (this.stepCountHistory.length > 50) {
              this.stepCountHistory.shift();
            }


            this.info = '';
            this.info += ` Generation: ${iGeneration}`;


            var bots: BotWorldCell[] = [...this.world.bots];
            bots.sort((a: BotWorldCell, b: BotWorldCell) => {
              return b.health - a.health;
            });

            this.info += ` Bots:`;
            for (var b = 0; b < Math.min(10, bots.length); b++) {
              var s = bots[b].health.toString();
              while (s.length < 7) s = ' ' + s;
              this.info += ' ' + s;
            }


            generation = this.createNewGeneration(bots);

            var d2 = new Date();
            if (d1) {
              this.info += ' GenTime: ' + (((d2.getTime()) - d1.getTime())).toString();
            }
            d1 = d2;

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
        g.commands.push(MathHelper.getRandomInt(0, 64));
      }
      generation.push(g);
    }
    return generation;
  }


  ngOnInit() {

    if (this.route.snapshot.queryParams.autoStart) {
      this.startSim();
    }
  }


  createNewGeneration(bots: BotWorldCell[]): WorldGenom[] {
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

    var firstBest = 8;
    for (var i = 0; i < bots.length; i++) {
      var gen = new WorldGenom();
      gen.commands = [...(bots[i % firstBest].genom.commands)];
      generation2.push(gen);
    }


    this.mutation(generation2);

    return generation2;
  }


  mutation(generation: WorldGenom[]) {
    for (var i = 0; i < 8; i++) {
      var index = MathHelper.getRandomInt(0, generation.length);
      var cellCount = MathHelper.getRandomInt(0, 5);
      for (var j = 0; j < cellCount; j++) {
        var cmdIndex = MathHelper.getRandomInt(0, generation[index].commands.length);
        generation[index].commands[cmdIndex] = MathHelper.getRandomInt(0, 64);
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


  setTimeoutAsync(func: () => Promise<void>): Promise<void> {
    return new Promise<void>((resolve => {
      setTimeout(() => {
        func().then(resolve);
      }, 0);

    }));
  }


  startAsync(func: () => Promise<void>) {
    func().then(() => {

    });
  }



}


