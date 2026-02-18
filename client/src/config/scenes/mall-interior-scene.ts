import { SCENE_SPRITES } from '../scene-sprites';
import { SPRITES } from '../pixel-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/**
 * Star Mall interior — wide concourse with holographic displays,
 * station lights, and ambient glow. Used as the ambient scene
 * when docked at a Star Mall.
 */
export function buildMallInteriorScene(): SceneDefinition {
  return {
    id: 'mall-interior',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0c0a14',
    initialActors: [
      // Station structure forms the backdrop
      { id: 'station-l', frames: [SCENE_SPRITES.station_frame1, SCENE_SPRITES.station_frame2], frameDuration: 1200, x: 15, y: 45, size: 14, opacity: 0.6 },
      { id: 'station-r', frames: [SCENE_SPRITES.station_frame2, SCENE_SPRITES.station_frame1], frameDuration: 1200, x: 85, y: 45, size: 14, opacity: 0.6 },
      // Holographic displays showing commodities and ships
      { id: 'holo-ship', frames: [SPRITES.ship_corvette, SPRITES.ship_cruiser, SPRITES.ship_battleship], frameDuration: 2000, x: 35, y: 30, size: 6, opacity: 0.35 },
      { id: 'holo-planet', frames: [SPRITES.planet_H, SPRITES.planet_O, SPRITES.planet_D], frameDuration: 2500, x: 65, y: 30, size: 5, opacity: 0.3 },
      // Items on display
      { id: 'display-1', frames: [SPRITES.commodity_cyrillium], frameDuration: 200, x: 30, y: 65, size: 4, opacity: 0.4 },
      { id: 'display-2', frames: [SPRITES.commodity_food], frameDuration: 200, x: 50, y: 65, size: 4, opacity: 0.4 },
      { id: 'display-3', frames: [SPRITES.commodity_tech], frameDuration: 200, x: 70, y: 65, size: 4, opacity: 0.4 },
    ],
    phases: [
      {
        duration: 600000,
        effects: [
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
    ],
  };
}
