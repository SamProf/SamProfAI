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
    // var myWorker = new Worker('webworker.bundle.js');
    //
    // myWorker.onmessage = function (e) {
    //   console.log('Message received from worker ' + e.data);    };
    //
    //
    // myWorker.postMessage([12, 23]);
  }
}
