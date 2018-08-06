import {Settings} from './settings';
import {TimerTask} from '../../../helpers/timer-task';
import {RuntimeState} from './runtime-state';
import {Genom} from './genom';
import {argMax, getRandomInt, indexOfMax} from '../../../helpers/math-helper';
import {NNet} from './n-net';
import {tetrisHeight, tetrisNNDimensions, tetrisWidth} from './constants';

export class Simulation {
  settings: Settings = new Settings();


  stepIndex: number = 0;
  generationIndex: number = 0;

  task: TimerTask = new TimerTask();

  states: RuntimeState[] = [];
  calculateVector: number[][];


  init() {
    this.stepIndex = 0;
    this.generationIndex = 0;
    this.states = [];
    this.calculateVector = NNet.createCalculateVector(tetrisNNDimensions);
    for (var i = 0; i < this.settings.count; i++) {
      var genom = new Genom(this.settings);
      genom.init();
      var state = new RuntimeState(genom, this.settings);
      state.init();
      this.states.push(state);
    }
  }

  step() {
    if ((this.stepIndex >= this.settings.maxAge) || (this.states.filter(i => !i.isDead).length == 0)) {
      this.repaintFn();
      // debugger;
      this.generationIndex++;
      this.stepIndex = 0;
      var oldStates = this.states;
      var newGenerationCount = Math.ceil(this.settings.newGenerationPercent * oldStates.length / 100);
      var mutatantsCount = Math.ceil(this.settings.mutatantsPercent * this.settings.count / 100);

      // debugger;

      oldStates.sort((a, b) => {
        if (a.score > b.score) {
          return -1;
        }
        else if (a.score < b.score) {
          return 1;
        }


        if (a.age > b.age) {
          return -1;
        }
        else if (a.age < b.age) {
          return 1;
        }

        return 0;

      });


      var best = oldStates[0];
      console.log('best', best.score, best.age);

      this.states = [];
      for (var i = 0; i < this.settings.count; i++) {
        var genom = new Genom(this.settings);
        genom.copyFrom(oldStates[i % newGenerationCount].genom);

        if (i > this.settings.count - mutatantsCount) {
          genom.mutation();
        }


        var state = new RuntimeState(genom, this.settings);
        state.init();
        this.states.push(state);
      }
    }

    this.stepIndex++;


    for (var iState = 0; iState < this.states.length; iState++) {
      var state = this.states[iState];
      if (state.isDead) {
        continue;
      }


      state.age++;

      for (var iCmd = 0; iCmd < 3; iCmd++) {
        var inputVector = this.calculateVector[0];
        var inputIndex = 0;

        for (var y = 0; y < tetrisHeight; y++) {
          var row = state.map[y];
          for (var x = 0; x < tetrisWidth; x++) {
            inputVector[inputIndex++] = (row & (1 << x)) !== 0 ? 1 : 0;
          }
        }

        for (var y = 0; y < tetrisHeight; y++) {
          if (y >= state.figureY && y < state.figureY + state.figureState.h) {
            var fy = y - state.figureY;
            var fr = state.figureState.data[fy];
            for (var x = 0; x < tetrisWidth; x++) {
              inputVector[inputIndex++] = (fr & (1 << x)) !== 0 ? 1 : 0;
            }

          }
          else {
            for (var x = 0; x < tetrisWidth; x++) {
              inputVector[inputIndex++] = 0;
            }
          }


        }

        state.genom.net.calculate(this.calculateVector);
        // console.log(this.calculateVector);
        var cmdScoreLine = this.calculateVector[this.calculateVector.length - 1];
        var cmd = argMax(cmdScoreLine);

        if (cmd == 1) {
          state.goLeft();
        }

        if (cmd == 2) {
          state.goRight();
        }
      }


      state.goDown();
    }

    if (this.settings.showMap) {
      this.repaintFn();
    }
  }


  constructor(private repaintFn: () => void) {


  }


  startSim() {

    if (this.task.isBusy) {
      this.task.stop();
    }

    this.init();

    this.repaintFn();

    this.task.start(() => {
      this.step();
    });
  }

  stopSim() {
    this.task.stop();

  }
}
