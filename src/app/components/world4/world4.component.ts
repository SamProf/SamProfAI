import {ApplicationRef, ChangeDetectorRef, Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MapMode, WorldSimSettings} from './core/world-sim-settings';
import {WorldSym} from './core/world-sym';
import {CanvasComponent} from '../canvas/canvas.component';
import {WorldCellType} from './core/world-cell-type';


@Component({
  selector: 'app-world4',
  templateUrl: './world4.component.html',
  styleUrls: ['./world4.component.css'],
})
export class World4Component implements OnInit {

  constructor(private route: ActivatedRoute, private app: ApplicationRef, private chd: ChangeDetectorRef, private zone: NgZone) {
    this.settings = new WorldSimSettings();
    this.sim = new WorldSym(this.settings, () => {
      this.repaint();
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


    this.zone.run(() => {
    });


    var ctx = this.canvas.getContext();
    if (this.settings.showMap) {


      var word = this.sim.world;
      if (word != null) {

        var rectInfo = this.canvas.getClientRectInfo();


        // ctx.beginPath();
        // ctx.arc(100, 100, this.settings.botRadius, 0, 2 * Math.PI);
        // ctx.stroke();
        //
        //
        // ctx.beginPath();
        // ctx.arc(200, 100, this.settings.botRadius, 0, 2 * Math.PI);
        // ctx.stroke();
        //
        // ctx.beginPath();
        // ctx.arc(100, 200, this.settings.botRadius, 0, 2 * Math.PI);
        // ctx.stroke();
        //
        // ctx.beginPath();
        // ctx.arc(200, 200, this.settings.botRadius, 0, 2 * Math.PI);
        // ctx.stroke();

        if (this.settings.mapMode == MapMode.default) {

          for (var i = 0; i < word.bots.length; i++) {
            var bot = word.bots[i];

            ctx.beginPath();
            ctx.moveTo(bot.x, bot.y);
            ctx.arc(bot.x, bot.y, this.settings.botRadius, bot.angle * Math.PI / 180, (bot.angle + 360) * Math.PI / 180);
            var sum = bot.colorR + bot.colorG + bot.colorB;
            // debugger;
            var r = bot.colorR * 255 / sum;
            var g = bot.colorG * 255 / sum;
            var b = bot.colorB * 255 / sum;
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fill();
            ctx.stroke();


            // ctx.

            // ctx.fillStyle = "black";
            // ctx.textBaseline = "middle";
            // ctx.textAlign = "center";
            // ctx.fillText(bot.health.toFixed(0).toString(), bot.x, bot.y);

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

  startSim() {
    this.sim.startSim();
  }

  showBestBot() {
    var bot = this.sim.world.bots.reduce((prev, i) => {
      if (prev == null || prev.health < i.health) {
        return i;
      }
      return prev;
    }, null);

    //this.canvas.moveToCenter((bot.x - 0.5) * cellSize, (bot.y - 0.5) * cellSize);
  }

  displaySidebar: boolean = true;

  test1() {
    this.displaySidebar = true;

  }
}





