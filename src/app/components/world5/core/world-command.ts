export class WorldCommand {
  firstIndex: number;
  index: number;
  func: (BotWorldCell, number) => void;
}
