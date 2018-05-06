import {WorldModel, WorldSimSettings} from '../src/app/components/world/core/world-model';

console.log('Worker starts');



onmessage = function (e) {
  console.log('Message received from main script');
  console.log(e.data);

  var model: WorldModel = new WorldModel(new WorldSimSettings());

  for (var i=0; i<10000000000;i++)
  {
    //do something
  }









  var workerResult = 'Result: ' + (e.data);
  console.log('Posting message back to main script');

};
