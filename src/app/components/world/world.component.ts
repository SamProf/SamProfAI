import {Component, OnInit} from '@angular/core';
import {BotWorldCell, WorldModel} from './core/world-model';
import {WorldGenom} from './core/world-genom';
import {MathHelper} from '../../helpers/math-helper';
import {b} from '@angular/core/src/render3';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements OnInit {

  constructor() {
  }

  world: WorldModel;
  iGeneration: number = 0;
  iStep: number;

  info: string = '';

  showMap: boolean = true;
  showMapStep: number = 1;

  stepCountHistory: number[] = [];

  startSimylation() {


    this.setTimeoutAsync(async () => {
      var generation = this.createFirstGeneration(64, 64);

      var d1: Date = null;

      for (var iGeneration = 0; true; iGeneration++) {

        this.iGeneration = iGeneration;
        await this.setTimeoutAsync(async () => {
          this.world = new WorldModel(generation, 50, 30);

          var stepCount = 10000;
          for (var iStep = 0; (iStep < stepCount) && (this.world.liveBotCount > 0);) {
            //this.world.step();
            await this.setTimeoutAsync(async () => {
              for (var iStep2 = 0; (iStep < stepCount) && (iStep2 < this.showMapStep) && (this.world.liveBotCount > 0); iStep++, iStep2++) {
                this.iStep = iStep;
                this.world.step();
              }
            });
          }

          this.stepCountHistory.push(Math.floor(iStep *100 / stepCount));
          if (this.stepCountHistory.length > 50)
          {
            this.stepCountHistory.shift();
          }


          this.info = '';
          this.info += ` Generation: ${iGeneration}`;

          var bots: BotWorldCell[] = [...this.world.bots];
          bots.sort((a: BotWorldCell, b: BotWorldCell) => {
            return b.health - a.health;
          });

          this.info += ` Bests:`;
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


  }

  createFirstGeneration(count: number, commandCount: number): WorldGenom[] {
    var generation: WorldGenom[] = [];
    for (var i = 0; i < count; i++) {
      var gemom = new WorldGenom();
      gemom.init(commandCount);
      generation.push(gemom);
    }
    return generation;
  }


  ngOnInit() {
    this.startSimylation();
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


  async runAsync(generation: WorldGenom[]) {
    this.world = new WorldModel(generation);
    await this.world.run(1000, 2);
    console.log('Complete generation');
  }

  fastModeClick() {
    this.showMap = false;
    this.showMapStep = 10000;
  }

  stepModeClick() {
    this.showMap = true;
    this.showMapStep = 1;
  }
}
