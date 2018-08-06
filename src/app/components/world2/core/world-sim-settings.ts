export class WorldSimSettings {

  constructor(config: Partial<WorldSimSettings> = {}) {
    Object.apply(this, config);
  }

  botMemoryLength: number = 64;
  botMaxEnergy: number = 100;
  initBotCount: number = 5;

  width: number = 100;
  height: number = 100;


  wallPercent: number = 0;

  mutantPercent: number = 20;
  mutantCellPercent: number = 3;

  enableDeadBots: boolean = true;
  oldBotsNeedsMoreEnergy: boolean = false;
  botGenomType: boolean = true;

  commandPhotosynthesis: boolean = true;
  commandPhotosynthesisMult: number = 1;
  commandPhotosynthesisEnergy: number = 10;

  commandKill: boolean = true;
  commandKillMult: number = 5;
  commandKillEnergyPercent: number = 50;
  commandKillDontSimilar: boolean = true;

  commandMove: boolean = true;
  commandMoveMult: number = 1;

  commandSee: boolean = true;
  commandSeeMult: number = 1;

  commandRotate: boolean = true;
  commandRotateMult: number = 1;

  commandMemoryJump: boolean = true;


  mapMode: MapMode = MapMode.pixels;

  mapCreationType: MapCreationType = MapCreationType.Gradient;


  seaLevelPercent: number = 10;
}


export function defaultScale(mapMode: MapMode) {
  switch (mapMode) {

    case MapMode.world:
    case MapMode.energy:
    case MapMode.age:
      return -1;
    case MapMode.pixels:
    case MapMode.pixelsEnergy:
    case MapMode.pixelsMap:
    case MapMode.pixelsAge:
      return 13;
    case MapMode.none:
    default:
      return 0;
  }
}


export enum MapCreationType {
  Same,
  Gradient,
  World,
}


export enum MapMode {
  none,
  world,
  energy,
  age,
  pixels,
  pixelsEnergy,
  pixelsMap,
  pixelsAge,
}
