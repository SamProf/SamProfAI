import {ApplicationRef, ChangeDetectorRef, Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MapMode, WorldSimSettings} from './core/world-sim-settings';
import {WorldSym} from './core/world-sym';
import {CanvasComponent} from '../canvas/canvas.component';
import {WorldCellType} from './core/world-cell-type';
import {TimerTask} from '../../helpers/timer-task';
import {setZeroTimeout} from '../../helpers/setZeroTimeout';
import {MathHelper} from '../../helpers/math-helper';
import {Canvas2Component} from '../canvas2/canvas2.component';


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
  canvas: Canvas2Component;


  imageData: ImageData = null;


  repaint_() {
    var ctx = this.canvas.getContext();
    // return;
    if (this.settings.showMap) {


      var word = this.sim.world;
      if (word != null) {

        var rectInfo = this.canvas.getClientRectInfo();

        // var x1 = Math.max(0, Math.floor(rectInfo.x / cellSize));
        // var x2 = Math.min(Math.ceil((rectInfo.x + rectInfo.width) / cellSize), word.map[0].length);
        //
        // var y1 = Math.max(0, Math.floor(rectInfo.y / cellSize));
        // var y2 = Math.min(Math.ceil((rectInfo.y + rectInfo.height) / cellSize), word.map.length);
        //


        if (this.imageData == null) {
          this.imageData = ctx.createImageData(word.map[0].length, word.map.length);
        }

        var x1 = 0;
        var x2 = word.map[0].length;
        //
        var y1 = 0;
        var y2 = word.map.length;


        // var imageData = ctx.getImageData(0, 0, x2, y2);
        // var imageData = ctx.getImageData(0, 0, x2, y2);
        // debugger;
        var pixels = this.imageData.data;

        // var start = MathHelper.getRandomInt(0, 256);


        // var len = pixels.length;
        // for(var i=0; i<x2*y2*4; i++)
        // {
        //   pixels[i] = (start + i) % 256;
        // }


        for (var y = y1; y < y2; ++y) {
          var row = this.sim.world.map[y];
          for (var x = x1; x < x2; ++x) {
            var off0 = (y * x2 + x) * 4;
            var cell = row[x];
            if (cell.height < 140) {
              pixels[off0 + 0] = 0;
              pixels[off0 + 1] = 0;
              pixels[off0 + 2] = 200;
              pixels[off0 + 3] = 255;
            } else {
              pixels[off0 + 0] = 200;
              pixels[off0 + 1] = 0;
              pixels[off0 + 2] = 0;
              pixels[off0 + 3] = 255;
            }


          }
        }
        ctx.putImageData(this.imageData, this.canvas._dx, this.canvas._dy);


        // for (var y = y1; y < y2; y++) {
        //   var col = word.map[y];
        //   for (var x = x1; x < x2; x++) {
        //     var cell = col[x];
        //
        //
        //     if (this.settings.mapMode == MapMode.default) {
        //
        //       switch (cell.type) {
        //         case WorldCellType.empty:
        //           ctx.fillStyle = `white`;
        //           break;
        //         case WorldCellType.bot:
        //           if (cell.bot.isDead) {
        //             ctx.fillStyle = `gray`;
        //           }
        //           else {
        //             var r = cell.bot.energyKill * 255 / (cell.bot.energyKill + cell.bot.energyEat);
        //             var g = cell.bot.energyEat * 255 / (cell.bot.energyKill + cell.bot.energyEat);
        //             ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
        //           }
        //
        //           break;
        //         case WorldCellType.wall:
        //           ctx.fillStyle = 'black';
        //           break;
        //       }
        //
        //       ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        //
        //
        //       // if (cell.type == WorldCellType.bot && !cell.bot.isDead) {
        //       //   ctx.fillStyle = 'white';
        //       //   ctx.textBaseline = 'top';
        //       //   ctx.fillText(Math.round(cell.bot.health).toString(), x * cellSize, y * cellSize);
        //       // }
        //     }
        //     else if (this.settings.mapMode == MapMode.energy) {
        //       switch (cell.type) {
        //         case WorldCellType.empty:
        //           ctx.fillStyle = `white`;
        //           break;
        //         case WorldCellType.bot:
        //           if (cell.bot.isDead) {
        //             ctx.fillStyle = `white`;
        //           }
        //           else {
        //             var r = cell.bot.health * 255 / (this.settings.botMaxEnergy);
        //             ctx.fillStyle = `rgb(255, ${255 - r}, ${255 - r})`;
        //           }
        //
        //           break;
        //         case WorldCellType.wall:
        //           ctx.fillStyle = 'white';
        //           break;
        //       }
        //
        //       ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        //
        //
        //       if (cell.type == WorldCellType.bot && !cell.bot.isDead) {
        //         ctx.fillStyle = 'white';
        //         ctx.textBaseline = 'top';
        //         ctx.fillText(Math.round(cell.bot.health).toString(), x * cellSize, y * cellSize);
        //       }
        //     }
        //     else if (this.settings.mapMode == MapMode.map) {
        //
        //       // debugger;
        //
        //       var sealevel = 123;
        //       if (cell.height <= sealevel) {
        //         ctx.fillStyle = `blue`;
        //       }
        //       else {
        //         ctx.fillStyle = `green`;
        //       }
        //
        //       ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        //     }
        //
        //   }
        // }
      }
    }
  }


  repaint() {
    var ctx = this.canvas.getContext();


    // return;
    if (this.settings.showMap) {


      var word = this.sim.world;
      if (word != null) {

        var rectInfo = this.canvas.getClientRectInfo();

        // var x1 = Math.max(0, Math.floor(rectInfo.x / cellSize));
        // var x2 = Math.min(Math.ceil((rectInfo.x + rectInfo.width) / cellSize), word.map[0].length);
        //
        // var y1 = Math.max(0, Math.floor(rectInfo.y / cellSize));
        // var y2 = Math.min(Math.ceil((rectInfo.y + rectInfo.height) / cellSize), word.map.length);
        //


        var x1 = 0;
        var x2 = word.map[0].length;
        //
        var y1 = 0;
        var y2 = word.map.length;
        var ctx2 = this.canvas.canvas2.nativeElement.getContext("2d");
        this.canvas.canvas2.nativeElement.width = x2;
        this.canvas.canvas2.nativeElement.height = y2;
        if (this.imageData == null) {
          this.imageData = ctx2.createImageData(word.map[0].length, word.map.length);
        }

        var pixels = this.imageData.data;


        var minHeight = Number.MAX_SAFE_INTEGER;
        var maxHeight = Number.MIN_SAFE_INTEGER;


        for (var y = y1; y < y2; ++y) {
          var row = this.sim.world.map[y];
          for (var x = x1; x < x2; ++x) {
            var off0 = (y * x2 + x) * 4;
            var cell = row[x];

            minHeight = Math.min(minHeight, cell.height);
            maxHeight = Math.max(maxHeight, cell.height);

            if (cell.height < this.settings.seaLevel) {
              pixels[off0 + 0] = 0;
              pixels[off0 + 1] = 0;
              pixels[off0 + 2] = 200;
              pixels[off0 + 3] = 255;
            } else {
              pixels[off0 + 0] = 200;
              pixels[off0 + 1] = 0;
              pixels[off0 + 2] = 0;
              pixels[off0 + 3] = 255;
            }


          }
        }


        console.log(minHeight, maxHeight);
        ctx2.putImageData(this.imageData, 0, 0);
        ctx.drawImage(this.canvas.canvas2.nativeElement, 0, 0);


        // for (var y = y1; y < y2; y++) {
        //   var col = word.map[y];
        //   for (var x = x1; x < x2; x++) {
        //     var cell = col[x];
        //
        //
        //     if (this.settings.mapMode == MapMode.default) {
        //
        //       switch (cell.type) {
        //         case WorldCellType.empty:
        //           ctx.fillStyle = `white`;
        //           break;
        //         case WorldCellType.bot:
        //           if (cell.bot.isDead) {
        //             ctx.fillStyle = `gray`;
        //           }
        //           else {
        //             var r = cell.bot.energyKill * 255 / (cell.bot.energyKill + cell.bot.energyEat);
        //             var g = cell.bot.energyEat * 255 / (cell.bot.energyKill + cell.bot.energyEat);
        //             ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
        //           }
        //
        //           break;
        //         case WorldCellType.wall:
        //           ctx.fillStyle = 'black';
        //           break;
        //       }
        //
        //       ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        //
        //
        //       // if (cell.type == WorldCellType.bot && !cell.bot.isDead) {
        //       //   ctx.fillStyle = 'white';
        //       //   ctx.textBaseline = 'top';
        //       //   ctx.fillText(Math.round(cell.bot.health).toString(), x * cellSize, y * cellSize);
        //       // }
        //     }
        //     else if (this.settings.mapMode == MapMode.energy) {
        //       switch (cell.type) {
        //         case WorldCellType.empty:
        //           ctx.fillStyle = `white`;
        //           break;
        //         case WorldCellType.bot:
        //           if (cell.bot.isDead) {
        //             ctx.fillStyle = `white`;
        //           }
        //           else {
        //             var r = cell.bot.health * 255 / (this.settings.botMaxEnergy);
        //             ctx.fillStyle = `rgb(255, ${255 - r}, ${255 - r})`;
        //           }
        //
        //           break;
        //         case WorldCellType.wall:
        //           ctx.fillStyle = 'white';
        //           break;
        //       }
        //
        //       ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        //
        //
        //       if (cell.type == WorldCellType.bot && !cell.bot.isDead) {
        //         ctx.fillStyle = 'white';
        //         ctx.textBaseline = 'top';
        //         ctx.fillText(Math.round(cell.bot.health).toString(), x * cellSize, y * cellSize);
        //       }
        //     }
        //     else if (this.settings.mapMode == MapMode.map) {
        //
        //       // debugger;
        //
        //       var sealevel = 123;
        //       if (cell.height <= sealevel) {
        //         ctx.fillStyle = `blue`;
        //       }
        //       else {
        //         ctx.fillStyle = `green`;
        //       }
        //
        //       ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        //     }
        //
        //   }
        // }
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





