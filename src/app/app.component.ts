import { Component } from '@angular/core';
import {WorkerMessage1} from './core/worker/worker-message';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SamProf AI Experiments';

  constructor()
  {
    var w = new Worker("/assets/worker.js");
    // w.onmessage = function(e) {
    //   console.log('Message received from worker');
    // }
    w.postMessage(new WorkerMessage1("Sam"));

    setTimeout(()=>{
      w.terminate();
      w = new Worker("/assets/worker.js");
      w.postMessage(new WorkerMessage1("Sam2"));
    }, 2000);
  }
}
