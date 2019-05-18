import { Tile } from './tile';
import { Config } from './config';

export class MineField {
   private tiles: Tile[][];

   constructor() {
      this.tiles = [];
   }

   // layout the tiles on the grid
   public makeGrid = (rows: number, cols: number) => {
      for (let x = 0; x < cols; x++) {
         this.tiles[x] = [];
         for (let y = 0; y < rows; y++) {
            this.tiles[x][y] = new Tile(x, y);
            this.tiles[x][y].x = x * Tile.WIDTH;
            this.tiles[x][y].y = y * Tile.HEIGHT;
            this.tiles[x][y].row = y;
            this.tiles[x][y].col = x;
         }
      }
   }

   // randomly scatter the bombs
   public scatterBombs = (bombCount: number) => {
      let total = Config.COLS * Config.ROWS;
      Loop1:
      for (let i = 0; i < bombCount; i++) {
         let bombIndex = Math.floor(Math.random() * total);
         let xyIndex = 0;
         for (let x = 0; x < Config.COLS; x++) {
            for (let y = 0; y < Config.ROWS; y++) {
               if (xyIndex == bombIndex) {
                  // check if there's already a bomb here
                  if (this.tiles[x][y].hasBomb) {
                     // try again
                     i--;
                     continue Loop1;
                  }
                  this.tiles[x][y].hasBomb = true;
               }
               xyIndex++;
            }
         }
      }
      // set adjacent bomb count
      for (let x = 0; x < Config.COLS; x++) {
         for (let y = 0; y < Config.ROWS; y++) {
            if (!this.tiles[x][y].hasBomb) {
               this.tiles[x][y].adjacentBombs = this.countAdjacentBombs(this.tiles[x][y]);
            }
         }
      }
   }

   private countAdjacentBombs = (tile: Tile): number => {
      let bombCount = 0;
      for (let x = -1; x < 2; x++) {
         for (let y = -1; y < 2; y++) {
            let col = tile.col + x;
            let row = tile.row + y;
            if (col >= 0 && col < Config.COLS && row >= 0 && row < Config.ROWS) {
               if (this.tiles[col][row].hasBomb) {
                  bombCount++;
               }
            }
         }
      }
      return bombCount;
   }

   public getTile = (x: number, y: number): Tile => {
      return this.tiles[x][y];
   }

   public setTile = (x: number, y: number, tile: Tile) => {
      this.tiles[x][y] = tile;
   }
}
