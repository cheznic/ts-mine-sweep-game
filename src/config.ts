import { Tile } from './tile';

export class Config {
   public static readonly ROWS = 30;
   public static readonly COLS = 30;
   public static readonly BOMB_COUNT = 110;
   public static readonly HEIGHT = (Config.ROWS * Tile.HEIGHT);
   public static readonly WIDTH = (Config.COLS * Tile.WIDTH);
   public static readonly BG_COLOR = '#335577';
}