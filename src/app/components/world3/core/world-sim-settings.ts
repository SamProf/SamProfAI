export class WorldSimSettings {

  constructor(config: Partial<WorldSimSettings> = {}) {
    Object.apply(this, config);
  }

  maxSetpCount: number = Number.MAX_SAFE_INTEGER;

  botMemoryLength: number = 64;
  botMaxEnergy: number = 100;
  initBotCount: number = 25;

  width: number = 1000;
  height: number = 1000;


  wallPercent: number = 0.0;

  mutantPercent: number = 0.5;
  mutantCellPercent: number = 0.1;

  showMap: boolean = true;
  mapMode: MapMode = MapMode.map;

  energyCellMax: number = 20;
  energyCellGrow: number = 0.03;
  energyCellInit: number = 5;
}


export enum MapMode {
  default,
  energy,
  map,
}
