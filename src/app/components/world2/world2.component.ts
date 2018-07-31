import {ApplicationRef, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {defaultScale, MapCreationType, MapMode, WorldSimSettings} from './core/world-sim-settings';
import {WorldSym} from './core/world-sym';
import {WorldCellType} from './core/world-cell-type';
import {Canvas2Component} from '../canvas2/canvas2.component';
import {SelectItem} from 'primeng/api';


var cellSize = 20;

@Component({
  selector: 'app-world2',
  templateUrl: './world2.component.html',
  styleUrls: ['./world2.component.css'],
})
export class World2Component implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private app: ApplicationRef, private chd: ChangeDetectorRef, private zone: NgZone) {
    this.settings = new WorldSimSettings();
    this.sim = new WorldSym(this.settings, () => {
      this.repaint();
    });
  }


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
  //
  // get wallPercent(): number {
  //   return Math.floor(this.settings.wallPercent * 100);
  // }
  //
  // set wallPercent(v: number) {
  //   this.settings.wallPercent = v / 100;
  // }


  @ViewChild('canvas')
  canvas: Canvas2Component;

  repaint() {


    this.zone.run(() => {
    });


    if (this.settings.mapMode != MapMode.none) {


      var ctx = this.canvas.getContext();

      var word = this.sim.world;
      if (word != null) {

        if (this.settings.mapMode == MapMode.world) {

          var rectInfo = this.canvas.getClientRectInfo();

          var x1 = Math.max(0, Math.floor(rectInfo.x / cellSize));
          var x2 = Math.min(Math.ceil((rectInfo.x + rectInfo.width) / cellSize), word.map[0].length);

          var y1 = Math.max(0, Math.floor(rectInfo.y / cellSize));
          var y2 = Math.min(Math.ceil((rectInfo.y + rectInfo.height) / cellSize), word.map.length);


          for (var y = y1; y < y2; y++) {
            var col = word.map[y];
            for (var x = x1; x < x2; x++) {
              var cell = col[x];


              switch (cell.type) {
                case WorldCellType.empty:
                  ctx.fillStyle = `white`;
                  break;
                case WorldCellType.bot:
                  if (cell.bot.isDead) {
                    ctx.fillStyle = `gray`;
                  }
                  else {
                    var sum = cell.bot.colorR + cell.bot.colorG + cell.bot.colorB;
                    var r = cell.bot.colorR * 255 / sum;
                    var g = cell.bot.colorG * 255 / sum;
                    var b = cell.bot.colorB * 255 / sum;
                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                  }

                  break;
                case WorldCellType.wall:
                  ctx.fillStyle = 'black';
                  break;
              }

              ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);


              if (cell.type == WorldCellType.bot && !cell.bot.isDead) {
                ctx.fillStyle = 'white';
                ctx.textBaseline = 'top';
                ctx.fillText(Math.round(cell.bot.health).toString(), x * cellSize, y * cellSize);
              }
            }
          }


        }
        else if (this.settings.mapMode == MapMode.energy) {

          var rectInfo = this.canvas.getClientRectInfo();

          var x1 = Math.max(0, Math.floor(rectInfo.x / cellSize));
          var x2 = Math.min(Math.ceil((rectInfo.x + rectInfo.width) / cellSize), word.map[0].length);

          var y1 = Math.max(0, Math.floor(rectInfo.y / cellSize));
          var y2 = Math.min(Math.ceil((rectInfo.y + rectInfo.height) / cellSize), word.map.length);


          for (var y = y1; y < y2; y++) {
            var col = word.map[y];
            for (var x = x1; x < x2; x++) {
              var cell = col[x];


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
          }


        }
        else if (this.settings.mapMode == MapMode.age) {

          var rectInfo = this.canvas.getClientRectInfo();

          var x1 = Math.max(0, Math.floor(rectInfo.x / cellSize));
          var x2 = Math.min(Math.ceil((rectInfo.x + rectInfo.width) / cellSize), word.map[0].length);

          var y1 = Math.max(0, Math.floor(rectInfo.y / cellSize));
          var y2 = Math.min(Math.ceil((rectInfo.y + rectInfo.height) / cellSize), word.map.length);


          var maxAge = 0;

          for (var y = y1; y < y2; y++) {
            var row = word.map[y];
            for (var x = x1; x < x2; x++) {
              var cell = row[x];
              if (cell.type == WorldCellType.bot && !cell.bot.isDead) {
                maxAge = Math.max(maxAge, cell.bot.age);
              }
            }
          }


          for (var y = y1; y < y2; y++) {
            var row = word.map[y];
            for (var x = x1; x < x2; x++) {
              var cell = row[x];

              if (cell.type == WorldCellType.bot && !cell.bot.isDead) {
                var r = cell.bot.age * 255 / maxAge;
                ctx.fillStyle = `rgb(255, ${255 - r}, ${255 - r})`;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
              }

            }
          }


        }
        else if (this.settings.mapMode == MapMode.pixels) {

          var imageData = this.canvas.createImageData(this.settings.width, this.settings.height);
          var data = imageData.data;

          for (var y = 0; y < this.settings.height; y++) {
            var col = word.map[y];
            for (var x = 0; x < this.settings.width; x++) {
              var cell = col[x];

              var off = (y * this.settings.width + x) * 4;

              switch (cell.type) {
                case WorldCellType.empty: {
                  data[off + 0] = 255;
                  data[off + 1] = 255;
                  data[off + 2] = 255;
                  data[off + 3] = 255;
                }
                  break;

                case WorldCellType.bot: {

                  if (cell.bot.isDead) {
                    data[off + 0] = 128;
                    data[off + 1] = 128;
                    data[off + 2] = 128;
                    data[off + 3] = 255;
                  }
                  else {
                    var sum = cell.bot.colorR + cell.bot.colorG + cell.bot.colorB;
                    var r = (cell.bot.colorR * 255 / sum);
                    var g = (cell.bot.colorG * 255 / sum);
                    var b = (cell.bot.colorB * 255 / sum);
                    data[off + 0] = ~~r;
                    data[off + 1] = ~~g;
                    data[off + 2] = ~~b;
                    data[off + 3] = 255;

                  }


                  // case WorldCellType.wall:
                  //   ctx.fillStyle = 'black';
                }
                  break;
              }
            }
          }

          this.canvas.drawImageData(ctx, imageData);

        }
        else if (this.settings.mapMode == MapMode.pixelsEnergy) {

          var imageData = this.canvas.createImageData(this.settings.width, this.settings.height);
          var data = imageData.data;

          for (var y = 0; y < this.settings.height; y++) {
            var col = word.map[y];
            for (var x = 0; x < this.settings.width; x++) {
              var cell = col[x];


              var off = (y * this.settings.width + x) * 4;


              switch (cell.type) {
                case WorldCellType.empty: {
                  data[off + 0] = 255;
                  data[off + 1] = 255;
                  data[off + 2] = 255;
                  data[off + 3] = 255;
                }
                  break;

                case WorldCellType.bot: {

                  if (cell.bot.isDead) {
                    data[off + 0] = 0;
                    data[off + 1] = 0;
                    data[off + 2] = 0;
                    data[off + 3] = 0;
                  }
                  else {
                    var r = ~~(cell.bot.health * 255 / this.settings.botMaxEnergy);
                    data[off + 0] = 255;
                    data[off + 1] = 255 - r;
                    data[off + 2] = 255 - r;
                    data[off + 3] = 255;

                  }


                  // case WorldCellType.wall:
                  //   ctx.fillStyle = 'black';
                }
                  break;
              }
            }
          }

          this.canvas.drawImageData(ctx, imageData);
        }
        else if (this.settings.mapMode == MapMode.pixelsMap) {

          var imageData = this.canvas.createImageData(this.settings.width, this.settings.height);
          var data = imageData.data;

          for (var y = 0; y < this.settings.height; y++) {
            var col = word.map[y];
            for (var x = 0; x < this.settings.width; x++) {
              var cell = col[x];


              var off = (y * this.settings.width + x) * 4;


              var sealLevel = 0.4;

              if (cell.height > sealLevel) {

                var r = ~~(cell.height * 255);
                data[off + 0] = 255;
                data[off + 1] = 255 - r;
                data[off + 2] = 255 - r;
                data[off + 3] = 255;
              }
              else {
                //var r = ~~(cell.height * 255);
                data[off + 0] = 0;
                data[off + 1] = 0;
                data[off + 2] = 255;
                data[off + 3] = 255;
              }


            }
          }

          this.canvas.drawImageData(ctx, imageData);
        }


      }
    }
  }


  get imageScale(): number {
    return defaultScale(this.settings.mapMode);
  }


  mapModes: SelectItem[];
  mapCreationTypes: SelectItem[];


  ngOnInit() {
    this.mapModes = [
      {
        label: 'None (super fast)',
        value: MapMode.none
      },
      {
        label: 'World',
        value: MapMode.world
      },
      {
        label: 'Energy',
        value: MapMode.energy
      },
      {
        label: 'Age',
        value: MapMode.age
      },
      {
        label: 'Pixels (fast)',
        value: MapMode.pixels
      },
      {
        label: 'Pixels Energy (fast)',
        value: MapMode.pixelsEnergy
      },
      {
        label: 'Pixels Map (fast)',
        value: MapMode.pixelsMap
      },
    ];

    this.mapCreationTypes = [
      {
        label: 'Same',
        value: MapCreationType.Same,
      },
      {
        label: 'Gradient',
        value: MapCreationType.Gradient,
      },
      {
        label: 'World',
        value: MapCreationType.World,
      },

    ];

    if (this.route.snapshot.queryParams.autoStart) {
      this.startSim();
    }
  }


  testCounter: number = 0;

  get testCounter2(): number {
    console.log('testCounter2', this.testCounter);
    return this.testCounter;
  }


  startSim() {
    this.zone.runOutsideAngular(() => {
      this.sim.startSim();
    });
  }

  stopSim() {
    this.sim.stopSim();
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

  test1() {
    this.displaySidebar = true;

  }

  ngOnDestroy(): void {
    this.sim.stopSim();
  }
}





