import { Config } from './config';

export class Tile {
   public x: number = -1;
   public y: number = -1;
   public row: number = -1;
   public col: number = -1;
   public hasBomb: boolean = false;
   public isClicked: boolean = false;
   public isFlagged: boolean = false;
   public adjacentBombs: number = -1;

   private static readonly images = {
      tile: { image: Tile.initImage(Config.TILE_WIDTH, Config.TILE_HEIGHT, './img/tile.png') },
      flag: { image: Tile.initImage(Config.TILE_WIDTH, Config.TILE_HEIGHT, './img/flag.png') },
      number: { image: Tile.initImage(Config.TILE_WIDTH, Config.TILE_HEIGHT, './img/number.png') },
      bomb: { image: Tile.initImage(Config.TILE_WIDTH, Config.TILE_HEIGHT, './img/bomb.png') },
      zero: { image: Tile.initImage(Config.TILE_WIDTH, Config.TILE_HEIGHT, './img/zero.png') }
   }

   constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
   }
   // display the correct image
   public getImage(gameOver: boolean): HTMLImageElement {
      if (gameOver && this.hasBomb) {
         return Tile.images.bomb.image;
      }
      else if (this.isClicked && this.adjacentBombs == 0) {
         return Tile.images.zero.image;
      }
      else if (this.isClicked && this.adjacentBombs > 0) {
         return Tile.images.number.image;
      }
      else if (this.isFlagged) {
         return Tile.images.flag.image;
      }
      return Tile.images.tile.image;
   }

   private static initImage(width: number, height: number, file: string): HTMLImageElement {
      var img = new Image(width, height);
      img.src = file;
      return img;
   }
}
