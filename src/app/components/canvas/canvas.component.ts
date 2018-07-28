import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import * as panZoom from 'pan-zoom/index.js';


export const scalePowFactor = 1.2;


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

  @ViewChild('canvas')
  canvas: ElementRef;


  @Output()
  public repaint: EventEmitter<void> = new EventEmitter<void>();


  constructor(private el: ElementRef) {
  }


  @Input()
  public scaleFactor: number = 0;

  private _dx: number = 0;
  private _dy: number = 0;

  ngOnInit() {
    panZoom(this.el.nativeElement, (e: PanZoomEvent) => {
      console.log(e);
      if (e.dz) {
        var s1 = Math.pow(scalePowFactor, this.scaleFactor);
        this.scaleFactor += -e.dz / 100;
        var s2 = Math.pow(scalePowFactor, this.scaleFactor);
        this._dx = -s2 * (e.x - this._dx) / s1 + e.x;
        this._dy = -s2 * (e.y - this._dy) / s1 + e.y;
      }

      if (e.dx) {
        this._dx += e.dx;
      }

      if (e.dy) {
        this._dy += e.dy;
      }

      this.repaint.emit();
    });
  }


  public getContext(): CanvasRenderingContext2D {
    var ctx = this.canvas.nativeElement.getContext('2d');
    ctx.restore();
    ctx.save();
    ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    ctx.translate(this._dx, this._dy);
    var scale = Math.pow(scalePowFactor, this.scaleFactor);
    ctx.scale(scale, scale);
    return ctx;
  }


  resizedDiv(e: any) {
    this.setCanvasSize();
  }


  private setCanvasSize() {
    // debugger;
    var positionInfo = this.el.nativeElement.getBoundingClientRect();
    this.canvas.nativeElement.style.top = positionInfo.top + 'px';
    this.canvas.nativeElement.style.bottom = positionInfo.bottom + 'px';
    this.canvas.nativeElement.style.height = positionInfo.height + 'px';
    this.canvas.nativeElement.style.width = positionInfo.width + 'px';
    this.canvas.nativeElement.width = positionInfo.width;
    this.canvas.nativeElement.height = positionInfo.height;

    this.repaint.emit();
  }


  public getClientRectInfo(): ClientRectInfo {
    var s = Math.pow(scalePowFactor, this.scaleFactor);
    var r: ClientRectInfo = <ClientRectInfo>{
      x: -this._dx / s,
      y: -this._dy / s,
      width: this.canvas.nativeElement.width / s,
      height: this.canvas.nativeElement.height / s,
    };
    return r;
  }


  public moveToCenter(x: number, y: number) {
    // debugger;
    var s = Math.pow(scalePowFactor, this.scaleFactor);
    this._dx = -s * (x) + this.canvas.nativeElement.width / 2;
    this._dy = -s * (y) + this.canvas.nativeElement.height / 2;
    this.repaint.emit();
  }


}


export interface ClientRectInfo {
  x: number;
  y: number;
  width: number;
  height: number;
}


export interface PanZoomEvent {
  dx: number;
  dy: number;
  dz: number;
  x: number;
  y: number;
}
