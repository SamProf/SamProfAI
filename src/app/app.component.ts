import {Component} from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SamProf AI Experiments';

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
