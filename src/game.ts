import { Timer } from './timer';
import { Tile } from './tile';
import { MineField } from './minefield';
import { ScoreBoard } from './scoreboard';
import { Stage } from './stage';
import { Config } from './config';

export class Game {

   private readonly stage = new Stage('minefield');
   private readonly mineField = new MineField();
   private readonly timer = Timer.getInstance('timerDiv');
   private readonly scoreBoard = ScoreBoard.getInstance('scoreBoardDiv');
   public over: boolean = true;
   public score: number = 0;

   constructor() {
      // init stage
      this.stage.bgColor = Config.BG_COLOR;
      this.stage.size(Config.WIDTH, Config.HEIGHT);

      // init scoreboard
      this.scoreBoard.score = 0;

      // init start button
      let startButton = <HTMLButtonElement>document.getElementById('startButton');
      if (startButton == null) {
         console.log("Error: start button didn't initialize");
         return;
      }
      window.addEventListener('startButtonClickedEvent', this.start, false);
      startButton.onclick = function () { dispatchEvent(new Event('startButtonClickedEvent')) };

      // init minefield
      this.mineField.makeGrid(Config.ROWS, Config.COLS);
      this.mineField.scatterBombs(Config.BOMB_COUNT);
      window.addEventListener('tileClickedEvent', this.handleTileClick, false);
      window.addEventListener('tileRightClickedEvent', this.handleTileRightClick, false);
   }

   public show = () => {

      if (this.stage.context == null) {
         console.log('Error: canvas context is null, exiting');
         return;
      }
      this.stage.context.clearRect(0, 0, Config.WIDTH, Config.HEIGHT);

      for (let x = 0; x < Config.COLS; x++) {
         for (let y = 0; y < Config.ROWS; y++) {
            let tile = this.mineField.getTile(x, y);
            let image = tile.getImage(this.over);
            this.stage.context.drawImage(image, (x * Tile.WIDTH), y * Tile.HEIGHT, Tile.WIDTH, Tile.HEIGHT);

            if (tile.adjacentBombs > 0 && tile.isClicked) {
               switch (tile.adjacentBombs) {
                  case 1: { this.stage.context.fillStyle = '#229954'; break; }
                  case 2: { this.stage.context.fillStyle = '#8E44AD'; break; }
                  case 3: { this.stage.context.fillStyle = '#2980B9'; break; }
                  case 4: { this.stage.context.fillStyle = '#E74C3C'; break; }
                  case 5: { this.stage.context.fillStyle = '#D35400'; break; }
                  case 6: { this.stage.context.fillStyle = '#2BAEAA'; break; }
                  case 7: { this.stage.context.fillStyle = '#C0392B'; break; }
                  case 8: { this.stage.context.fillStyle = '#2E86C1'; break; }
               }
               this.stage.context.font = 'bold 13px Arial';
               this.stage.context.textAlign = 'center';
               this.stage.context.fillText(tile.adjacentBombs.toString(), tile.x + (Tile.WIDTH / 2), tile.y + (Tile.WIDTH / 2 + 5));
            }
         }
         if (this.score >= (Config.COLS * Config.ROWS) - Config.BOMB_COUNT) {
            this.win();
            // this.end();
         }
      }
   }

   private win = () => {
      if (this.stage.context == null) {
         console.log('Error: canvas context is null, exiting');
         return;
      }
      this.stage.context.font = '100px Righteous';
      this.stage.context.fillStyle = this.getRandomColor();
      this.stage.context.textAlign = 'center';
      this.stage.context.shadowColor = '#7f7f7f';
      this.stage.context.shadowOffsetX = 1;
      this.stage.context.shadowOffsetY = 1;
      this.stage.context.shadowBlur = 3;
      this.stage.context.fillText('You Win!', (Tile.WIDTH * Config.COLS / 2), (Tile.WIDTH * Config.ROWS / 2 + 22));
   }

   private getRandomColor = () => {
      let hue = Math.floor(Math.random() * 360);
      let color = 'hsla(' + hue + ', 100%, 75%, 1)';
      return color;
   }

   private handleTileClick = (event: Event) => {
      if (this.over) { return; }
      let e = event as CustomEvent;
      let tile = this.mineField.getTile(e.detail.tile.x, e.detail.tile.y);
      if (tile.isFlagged) { return; }
      if (tile.isClicked) { return; }
      tile.isClicked = true;
      if (tile.hasBomb) {
         this.end();
      } else {
         this.score++;
         this.scoreBoard.score = this.score;
         if (this.score >= (Config.COLS * Config.ROWS) - Config.BOMB_COUNT) {
            this.end();
         }
      }
      //this.mineField.setTile(e.detail.tile.x, e.detail.tile.y, tile);
      if (tile.adjacentBombs == 0) { this.clearOpenTiles(tile); }
      this.show();
   }

   private clearOpenTiles = (tile: Tile) => {
      for (let x = -1; x < 2; x++) {
         for (let y = -1; y < 2; y++) {
            let col = tile.col + x;
            let row = tile.row + y;
            // keep it within the boundary
            if (col >= 0 && col < Config.COLS && row >= 0 && row < Config.ROWS) {
               // skip over self
               if (x == 0 && y == 0) { continue; }
               let t = this.mineField.getTile(col, row);
               if (t.hasBomb) { continue; }
               if (t.isClicked) { continue; }
               t.isClicked = true;
               this.score++
               this.scoreBoard.score = this.score;
               if (t.adjacentBombs == 0) { this.clearOpenTiles(t); }

            }
         }
      }
   }

   private handleTileRightClick = (event: Event) => {
      let e = event as CustomEvent;
      let tile = this.mineField.getTile(e.detail.tile.x, e.detail.tile.y);
      tile.isFlagged = (tile.isFlagged) ? false : true;
      // this.mineField.setTile(e.detail.tile.x, e.detail.tile.y, tile);
      this.show();
   }

   public end = () => {
      this.over = true;
      this.timer.stop();
   }

   public start = () => {
      this.over = false;
      this.score = 0;
      this.scoreBoard.score = this.score;
      this.mineField.makeGrid(Config.ROWS, Config.COLS);
      this.mineField.scatterBombs(Config.BOMB_COUNT);
      this.show();
      this.timer.start();
   }
}