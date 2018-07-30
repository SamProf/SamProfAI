import {ApplicationRef, ChangeDetectorRef, Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MapMode, WorldSimSettings} from './core/world-sim-settings';
import {WorldSym} from './core/world-sym';
import {CanvasComponent} from '../canvas/canvas.component';
import {WorldCellType} from './core/world-cell-type';
import {TimerTask} from '../../helpers/timer-task';
import {setZeroTimeout} from '../../helpers/setZeroTimeout';


var cellSize = 1;


@Component({
  selector: 'app-world3',
  templateUrl: './world3.component.html',
  styleUrls: ['./world3.component.css'],
})
export class World3Component implements OnInit {

  constructor(private route: ActivatedRoute,
              private zone: NgZone) {

    this.settings = new WorldSimSettings();
    this.sim = new WorldSym(this.settings, () => {
      // console.log('paintFn');
      this.repaint();
      // this.zone.run(() => {
      //
      // });

    });
  }

  mapModeEnum = MapMode;

  public settings: WorldSimSettings;
  public sim: WorldSym;


  // get eatingPercent(): number {
  //   return Math.floor(this.settings.eatingPercent * 100);
  // }
  //
  // set eatingPercent(v: number) {
  //   this.settings.eatingPercent = v / 100;
  // }
  //
  // get poisonPercent(): number {
  //   return Math.floor(this.settings.poisonPercent * 100);
  // }
  //
  // set poisonPercent(v: number) {
  //   this.settings.poisonPercent = v / 100;
  // }

  get wallPercent(): number {
    return Math.floor(this.settings.wallPercent * 100);
  }

  set wallPercent(v: number) {
    this.settings.wallPercent = v / 100;
  }


  @ViewChild('canvas')
  canvas: CanvasComponent;

  repaint() {
    var ctx = this.canvas.getContext();
    if (this.settings.showMap) {


      var word = this.sim.world;
      if (word != null) {

        var rectInfo = this.canvas.getClientRectInfo();

        var x1 = Math.max(0, Math.floor(rectInfo.x / cellSize));
        var x2 = Math.min(Math.ceil((rectInfo.x + rectInfo.width) / cellSize), word.map[0].length);

        var y1 = Math.max(0, Math.floor(rectInfo.y / cellSize));
        var y2 = Math.min(Math.ceil((rectInfo.y + rectInfo.height) / cellSize), word.map.length);


        for (var y = y1; y < y2; y++) {
          var col = word.map[y];
          for (var x = x1; x < x2; x++) {
            var cell = col[x];


            if (this.settings.mapMode == MapMode.default) {

              switch (cell.type) {
                case WorldCellType.empty:
                  ctx.fillStyle = `white`;
                  break;
                case WorldCellType.bot:
                  if (cell.bot.isDead) {
                    ctx.fillStyle = `gray`;
                  }
                  else {
                    var r = cell.bot.energyKill * 255 / (cell.bot.energyKill + cell.bot.energyEat);
                    var g = cell.bot.energyEat * 255 / (cell.bot.energyKill + cell.bot.energyEat);
                    ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
                  }

                  break;
                case WorldCellType.wall:
                  ctx.fillStyle = 'black';
                  break;
              }

              ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);


              // if (cell.type == WorldCellType.bot && !cell.bot.isDead) {
              //   ctx.fillStyle = 'white';
              //   ctx.textBaseline = 'top';
              //   ctx.fillText(Math.round(cell.bot.health).toString(), x * cellSize, y * cellSize);
              // }
            }
            else if (this.settings.mapMode == MapMode.energy) {
              switch (cell.type) {
                case WorldCellType.empty:
                  ctx.fillStyle = `white`;
                  break;
                case WorldCellType.bot:
                  if (cell.bot.isDead) {
                    ctx.fillStyle = `white`;
                  }
                  else {
                    var r = cell.bot.health * 255 / (this.settings.botMaxEnergy);
                    ctx.fillStyle = `rgb(255, ${255 - r}, ${255 - r})`;
                  }

                  break;
                case WorldCellType.wall:
                  ctx.fillStyle = 'white';
                  break;
              }

              ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);


              if (cell.type == WorldCellType.bot && !cell.bot.isDead) {
                ctx.fillStyle = 'white';
                ctx.textBaseline = 'top';
                ctx.fillText(Math.round(cell.bot.health).toString(), x * cellSize, y * cellSize);
              }
            }
            else if (this.settings.mapMode == MapMode.map) {

              var sealevel = 123;
              if (cell.height <= sealevel) {
                ctx.fillStyle = `blue`;
              }
              else {
                ctx.fillStyle = `green`;

              }
              // var r = cell.height * 255 / (255);
              // ctx.fillStyle = `rgb(255, ${255 - r}, ${255-r})`;
              ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }

          }
        }
      }
    }
  }


  ngOnInit() {
    if (this.route.snapshot.queryParams.settingsShowMap) {
      this.settings.showMap = JSON.parse(this.route.snapshot.queryParams.settingsShowMap);
    }

    if (this.route.snapshot.queryParams.autoStart) {
      this.startSim();
    }
  }


  test1: number = 0;

  startSim() {
    this.zone.runOutsideAngular(() => {
      this.sim.startSim();
    });

  }

  showBestBot() {
    var bot = this.sim.world.bots.reduce((prev, i) => {
      if (prev == null || prev.health < i.health) {
        return i;
      }
      return prev;
    }, null);

    this.canvas.moveToCenter((bot.x - 0.5) * cellSize, (bot.y - 0.5) * cellSize);
  }

  displaySidebar: boolean = true;


}





