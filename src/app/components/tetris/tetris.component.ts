import {ApplicationRef, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Canvas2Component} from '../canvas2/canvas2.component';
import {Simulation} from './core/simulation';
import {Settings} from './core/settings';
import {tetrisHeight, tetrisWidth} from './core/constants';


var cellSize = 20;

@Component({
  selector: 'app-tetris',
  templateUrl: './tetris.component.html',
  styleUrls: ['./tetris.component.css'],
})
export class TetrisComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private app: ApplicationRef, private chd: ChangeDetectorRef, private zone: NgZone) {
    this.settings = new Settings();
    this.sim = new Simulation(() => {
      this.repaint();
      this.zone.run(() => {
      });
    });
  }


  public settings: Settings;
  public sim: Simulation;

  @ViewChild('canvas')
  canvas: Canvas2Component;

  repaint() {

    // debugger;

    var cellSize = 10;
    var stateStep = 3;
    var statePerLine = 10;
    var ctx = this.canvas.getContext();


    var settings = this.sim.settings;
    for (var iState = 0; iState < this.sim.states.length; iState++) {
      ctx.save();
      var state = this.sim.states[iState];
      ctx.translate((iState % statePerLine) * (cellSize * tetrisWidth + stateStep), (~~(iState / statePerLine)) * (cellSize * tetrisHeight + stateStep));

      ctx.fillStyle = 'lightgray';
      ctx.fillRect(0, 0, cellSize * tetrisWidth, cellSize * tetrisHeight);


      // debugger;
      ctx.fillStyle = 'black';
      for (var y = 0; y < tetrisHeight; y++) {
        var val = state.map[y];
        for (var x = 0; x < tetrisWidth; x++) {
          if ((val & (1<< x)) != 0) {
            ctx.fillRect(cellSize * x, cellSize * y, cellSize, cellSize);
          }
        }
      }

      if (!state.isDead) {



        // debugger;
        ctx.fillStyle = 'blue';
        for (var fy = 0; fy < state.figureState.h; fy++) {
          var line = state.figureState.data[fy];
          for (var fx = 0; fx < state.figureState.w; fx++) {
            if (((1 << fx) & line) !== 0) {
              ctx.fillRect(cellSize * (state.figureX + fx), cellSize * (state.figureY + fy), cellSize, cellSize);
            }
          }
        }
      }

      ctx.textBaseline = 'top';
      ctx.fillStyle = 'green';
      ctx.fillText(state.score.toLocaleString(), 0, 0);


      ctx.restore();
    }


  }

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.sim.startSim();
    });
  }


  startSim() {
    this.zone.runOutsideAngular(() => {
      this.sim.startSim();
    });
  }

  stopSim() {
    this.sim.stopSim();
  }

  ngOnDestroy(): void {
    this.sim.stopSim();
  }
}





