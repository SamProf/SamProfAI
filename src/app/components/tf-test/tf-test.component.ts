import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import {SimpleChange} from '@angular/core/src/change_detection/change_detection_util';
import {s} from '@angular/core/src/render3';
import {asyncRun} from '../../helpers/asyncRun';
import {getRandomInt} from '../../helpers/math-helper';


@Component({
  selector: 'app-tf-test',
  templateUrl: './tf-test.component.html',
  styleUrls: ['./tf-test.component.css']
})
export class TfTestComponent implements OnInit {

  constructor() {

  }


  @ViewChild('fileEl')
  fileEl: ElementRef;

  ngOnInit() {
  }


  model: tf.Sequential;

  input: string;


  recGenerateData() {

  }


  parseCodesClick() {
    var reader = new FileReader();
    reader.onload = (e) => {
      var content = e.target['result'];
      var lines = content
        .split('\n')
        .map(i => i.trim())
        .filter(i => i)
        .map(i => i.split(';'))
        .filter(i => i.length > 0);

      let res = '';
      var _HDiag: number = 0;
      var _NDiag: number = 0;
      lines.forEach((line: string[], lineIndex: number) => {
        if (lineIndex == 0) {
          _HDiag = line.indexOf('HDiag');
          _NDiag = line.indexOf('NDiag');
          return;
        }


        var resLine = '';
        if (line[_HDiag]) {
          resLine += line[_HDiag];
        }
        if (line[_NDiag]) {
          if (resLine) {
            resLine += ',';
          }
          resLine += line[_NDiag];
        }
        if (resLine) {
          res += resLine + '\r\n';
        }
      });

      this.input = res;
      console.log('Loading complete');

    };

    reader.readAsText(this.fileEl.nativeElement.files[0]);
  }


  trainClick() {


    asyncRun(async () => {
      var inputLines = this.input.match(/[^\r\n]+/g).map(line => line.split(',').filter(s => s != '').filter(s => {
        var ii = s.indexOf(':');

        if (ii >= 0) {
          s = s.substr(0, ii);
        }

        return s;
      })).filter(line => line.length != 0);
      //console.log(inputData);


      var dic: { [code: string]: number } = {};
      var codes: string[] = [];


      inputLines.forEach(line => {
        line.forEach((code,) => {
          if (!dic.hasOwnProperty(code)) {
            dic[code] = codes.length;
            codes.push(code);
          }
        });
      });


      console.log(codes);

      var zeroInput: number[] = [];
      for (var i = 0; i < codes.length; i++) {
        zeroInput.push(0);
      }


      this.model = tf.sequential();
      this.model.add(tf.layers.dense({units: codes.length, activation: 'relu', inputShape: [codes.length]}));
      // this.model.add(tf.layers.dense({units: codes.length, activation: 'relu'}));
      this.model.add(tf.layers.dense({units: codes.length, activation: 'linear'}));
      this.model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});


      for (var i = 0; i < 100; i++) {

        // debugger;


        var dataX = [];
        var dataY = [];

        for (var x = 0; x < 100; x++) {
          var itemX = zeroInput.slice();
          var itemY = zeroInput.slice();
          var index = getRandomInt(0, inputLines.length);
          var xLength = getRandomInt(1, inputLines[index].length);
          inputLines[index].forEach((code, codeIndex) => {
            itemY[dic[code]] = 1;
            if (codeIndex < xLength) {
              itemX[dic[code]] = 1;
            }
          });
          dataX.push(itemX);
          dataY.push(itemY);
        }


        const xs = tf.tensor2d(dataX);
        const ys = tf.tensor2d(dataY);

        // Train the model using the data.
        await this.model.fit(xs, ys, {epochs: 1});
        xs.dispose();
        ys.dispose();
        console.log('test');
      }


    });

  }


}
