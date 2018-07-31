import {WorldModel} from './world-model';
import {WorldGenom} from './world-genom';
import {MapMode, WorldSimSettings} from './world-sim-settings';
import {TimerTask} from '../../../helpers/timer-task';

export class WorldSym {


  public world: WorldModel;


  constructor(public settings: WorldSimSettings, private paintFn: () => void) {
  }

  public iStep: number = -1;

  currentSym: TimerTask = new TimerTask();

  simState: SimState = SimState.notStarted;

  public SimState = SimState;

  stopSim() {
    this.currentSym.stop();
    this.simState = SimState.stopped;

  }

  continueSim() {
    this.simState = SimState.started;
    this.currentSym.start(() => {
      this.iStep++;
      this.world.step();
      if (this.settings.mapMode != MapMode.none) {
        this.paintFn();
      }
    });
  }


  startSim() {


    if (this.currentSym.isBusy) {
      this.currentSym.stop();
    }


    this.world = new WorldModel(this.settings);
    var generation = this.createFirstGeneration();

    this.world.prepare(generation);

    if (this.settings.mapMode != MapMode.none) {
      this.paintFn();
    }

    this.iStep = 0;
    this.continueSim();
  }

  createFirstGeneration(): WorldGenom[] {
    var generation: WorldGenom[] = [];
    for (var i = 0; i < this.settings.initBotCount; i++) {
      var g = new WorldGenom();
      for (var о = 0; о < this.settings.botMemoryLength; о++) {
        // g.commands.push(MathHelper.getRandomInt(0, this.world.commands[this.world.commands.length - 1].index));
        g.commands.push(0);
      }
      generation.push(g);
    }
    return generation;
  }
}


export enum SimState {
  notStarted,
  started,
  stopped,
}
