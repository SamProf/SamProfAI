import {WorldBotState} from './world-bot-state';
import {WorldCellType} from './world-cell-type';

export class WorldCellModel {
  public get text(): string {
    if (this.type == WorldCellType.bot) {
      return this.bot.health.toString();
    }
  }

  public type: WorldCellType;

  public bot: WorldBotState;

  public get cls(): string {
    return WorldCellType[this.type];
  }

  constructor() {
    this.type = WorldCellType.empty;
  }

}
