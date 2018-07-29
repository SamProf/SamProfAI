import {ApplicationRef, ChangeDetectorRef, Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {WorldSimSettings} from './core/world-sim-settings';
import {WorldSym} from './core/world-sym';
import {CanvasComponent} from '../canvas/canvas.component';
import {WorldCellType} from './core/world-cell-type';


var cellSize = 20;

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements OnInit {

  constructor(private route: ActivatedRoute, private app: ApplicationRef, private chd: ChangeDetectorRef, private zone: NgZone) {
    this.settings = new WorldSimSettings();
    this.sim = new WorldSym(this.settings, () => {
      this.repaint();
    });
  }

  public settings: WorldSimSettings;
  public sim: WorldSym;


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
                ctx.fillStyle = 'white';
                break;
              case WorldCellType.eating:
                ctx.fillStyle = 'green';
                break;
              case WorldCellType.bot:
                ctx.fillStyle = 'blue';
                break;
              case WorldCellType.wall:
                ctx.fillStyle = 'black';
                break;
              case WorldCellType.poison:
                ctx.fillStyle = 'red';
                break;
            }

            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);


            if (cell.type == WorldCellType.bot) {
              ctx.fillStyle = 'white';
              ctx.textBaseline = 'top';
              ctx.fillText(cell.bot.health.toString(), x * cellSize, y * cellSize);
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

    this.canvas.moveToCenter((bot.x - 0.5) * cellSize, (bot.y - 0.5) * cellSize);
  }

  displaySidebar: boolean = true;

  test1() {
    this.displaySidebar = true;

  }
}





