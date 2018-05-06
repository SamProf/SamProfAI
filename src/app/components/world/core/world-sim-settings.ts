export class WorldSimSettings implements IWorldSimSettings {

  constructor(config: Partial<WorldSimSettings> = {}) {
    Object.assign(this, config);
  }

  botMemoryLength: number = 64;
  botCount: number = 64;

  width: number = 64;
  height: number = 48;

  eatingPercent: number = 0.05;
  poisonPercent: number = 0.05;
  wallPercent: number = 0.1;

  stepCount: number = 10000;

  longSee: boolean = true;

  mutantPercent: number = 0.5;
  mutantCellPercent: number = 0.1;
  newGenerationTopPercent: number = 0.2;
  showMap: boolean = true;
  speed: number = 1;
  simToLast: boolean = true;

}


export interface IWorldSimSettings {
  botMemoryLength: number;
  botCount: number;

  width: number;
  height: number;

  eatingPercent: number;
  poisonPercent: number;
  wallPercent: number;

  stepCount: number;

  longSee: boolean;

  mutantPercent: number;
  mutantCellPercent: number;
  newGenerationTopPercent: number;

  simToLast: boolean;

  showMap: boolean;
  speed: number;
}
