import {WorldBotState} from './world-bot-state';
import {WorldCellType} from './world-cell-type';

export class WorldCellModel {
  public type: WorldCellType;
  public bot: WorldBotState;
  public height: number = 0;


  constructor() {
    this.type = WorldCellType.empty;
  }

}
