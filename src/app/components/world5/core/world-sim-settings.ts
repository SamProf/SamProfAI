export class WorldSimSettings {

  constructor(config: Partial<WorldSimSettings> = {}) {
    Object.apply(this, config);
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
  notSoFast: boolean = false;
  speed: number = 1;
  simToLast: boolean = true;
  eatingCellMax: number = 100;
  eatingCellGrow: number = 0.1;
}


