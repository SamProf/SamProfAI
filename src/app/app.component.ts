import {Component} from '@angular/core';
import {MenuItem} from 'primeng/api';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SamProf AI Experiments 3.0';


  // items: MenuItem[];


  counterUrl: string;


  ngOnInit() {
    // this.items = [
    //   {
    //     label: this.title,
    //     routerLink: ['/'],
    //   },
    //   {
    //     label: 'World 1 - Genetic',
    //     routerLink: ['/bots'],
    //   },
    //   {
    //     label: 'World 2 - SuperGenesis',
    //     routerLink: ['/genesis'],
    //   },
    // ];
  }


  constructor() {
    var escape = window['escape'];
    this.counterUrl = '//counter.yadro.ru/hit?t38.6;r' + escape(document.referrer) + ((typeof(screen) == 'undefined') ? '' :
      ';s' + screen.width + '*' + screen.height + '*' + (screen.colorDepth ?
      screen.colorDepth : screen.pixelDepth)) + ';u' + escape(document.URL) +
      ';h' + escape(document.title.substring(0, 150)) + ';' + Math.random() +
      ';';
    // var myWorker = new Worker('webworker.bundle.js');
    //
    // myWorker.onmessage = function (e) {
    //   console.log('Message received from worker ' + e.data);    };
    //
    //
    // myWorker.postMessage([12, 23]);
  }
}
