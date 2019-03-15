/*
 * Author: Charles Nicoletti
 * Version: 0.0.1
 * Date: January 18, 2019 
 * Product: Mine Sweep Game
 * 
 * Copyright 2019 Charles Nicoletti
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference path="./timer.ts"/>

class Tile {
   public static WIDTH: number = 22;
   public static HEIGHT: number = 22;
   public x: number = -1;
   public y: number = -1;
   public row: number = -1;
   public col: number = -1;
   public hasBomb: boolean = false;
   public isClicked: boolean = false;
   public isFlagged: boolean = false;
   public adjacentBombs: number = -1;

   private static readonly images = {
      tile: { image: Tile.initImage(Tile.WIDTH, Tile.HEIGHT, './img/tile.png') },
      flag: { image: Tile.initImage(Tile.WIDTH, Tile.HEIGHT, './img/flag.png') },
      number: { image: Tile.initImage(Tile.WIDTH, Tile.HEIGHT, './img/number.png') },
      bomb: { image: Tile.initImage(Tile.WIDTH, Tile.HEIGHT, './img/bomb.png') },
      zero: { image: Tile.initImage(Tile.WIDTH, Tile.HEIGHT, './img/zero.png') }
   }

   constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
   }
   // display the correct image
   public getImage(): HTMLImageElement {
      if (game.over && this.hasBomb) {
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

class MineField {
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
      let total = Game.COLS * Game.ROWS;
      Loop1:
      for (let i = 0; i < bombCount; i++) {
         let bombIndex = Math.floor(Math.random() * total);
         let xyIndex = 0;
         for (let x = 0; x < Game.COLS; x++) {
            for (let y = 0; y < Game.ROWS; y++) {
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
      for (let x = 0; x < Game.COLS; x++) {
         for (let y = 0; y < Game.ROWS; y++) {
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
            if (col >= 0 && col < Game.COLS && row >= 0 && row < Game.ROWS) {
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

class Stage {
   private canvas: HTMLCanvasElement;
   public readonly context: CanvasRenderingContext2D | null;

   constructor(canvasName: string) {
      this.canvas = <HTMLCanvasElement>document.getElementById(canvasName);
      this.canvas.focus();
      this.context = this.canvas.getContext('2d');
      if (this.context == null) {
         console.log(`Error: Canvas failed to initialize`);
         return;
      }

      this.canvas.addEventListener('click', e => {
         this.handleClick(e);
      });

      this.canvas.addEventListener('contextmenu', e => {
         this.handleRightClick(e);
      });
   }

   public size(width: number, height: number) {
      this.canvas.setAttribute('width', width.toString())
      this.canvas.setAttribute('height', height.toString())
   }

   public set bgColor(bgColor: string) {
      this.canvas.style.backgroundColor = bgColor;
   }

   private handleClick(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();
      let point = new Coordinate(event.offsetX || event.layerX, event.offsetY || event.layerY);
      let coordinate = new Coordinate(Math.floor(point.x / Tile.WIDTH), Math.floor(point.y / Tile.HEIGHT));
      let custEvent = new CustomEvent('tileClickedEvent', { detail: { tile: { 'x': coordinate.x, 'y': coordinate.y } } });
      window.dispatchEvent(custEvent);
   }

   private handleRightClick(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();
      let point = new Coordinate(event.offsetX || event.layerX, event.offsetY || event.layerY);
      let coordinate = new Coordinate(Math.floor(point.x / Tile.WIDTH), Math.floor(point.y / Tile.HEIGHT));
      let custEvent = new CustomEvent('tileRightClickedEvent', { detail: { tile: { 'x': coordinate.x, 'y': coordinate.y } } });
      window.dispatchEvent(custEvent);
   }
}

class Coordinate {
   public x: number;
   public y: number;

   constructor(x: number, y: number) { this.x = x; this.y = y; }
}

class ScoreBoard {
   private static INSTANCE: ScoreBoard;
   private div: HTMLDivElement;
   private _score: number = 0;

   private constructor(divName: string) {
      this.div = <HTMLDivElement>document.getElementById(divName);
      this.div.innerHTML = "000";
   }

   static getInstance(divName: string): ScoreBoard {
      if (!ScoreBoard.INSTANCE) { ScoreBoard.INSTANCE = new ScoreBoard(divName); }
      return ScoreBoard.INSTANCE;
   }

   set score(score: number) {
      this._score = score;
      this.div.innerHTML = 'Score: ' + ('000' + score).slice(-3);
   }

   get score(): number {
      return this._score;
   }
}

class Game {
   public static readonly ROWS = 30;
   public static readonly COLS = 30;
   public static readonly BOMB_COUNT = 110;
   public static readonly HEIGHT = (Game.ROWS * Tile.HEIGHT);
   public static readonly WIDTH = (Game.COLS * Tile.WIDTH);
   public static readonly BG_COLOR = '#335577';

   private readonly stage = new Stage('minefield');
   private readonly mineField = new MineField();
   private readonly timer = timer.Timer.getInstance('timerDiv');
   private readonly scoreBoard = ScoreBoard.getInstance('scoreBoardDiv');
   public over: boolean = true;
   public score: number = 0;

   constructor() {
      // init stage
      this.stage.bgColor = Game.BG_COLOR;
      this.stage.size(Game.WIDTH, Game.HEIGHT);

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
      this.mineField.makeGrid(Game.ROWS, Game.COLS);
      this.mineField.scatterBombs(Game.BOMB_COUNT);
      window.addEventListener('tileClickedEvent', this.handleTileClick, false);
      window.addEventListener('tileRightClickedEvent', this.handleTileRightClick, false);
   }

   public show = () => {

      if (this.stage.context == null) {
         console.log('Error: canvas context is null, exiting');
         return;
      }
      this.stage.context.clearRect(0, 0, Game.WIDTH, Game.HEIGHT);

      for (let x = 0; x < Game.COLS; x++) {
         for (let y = 0; y < Game.ROWS; y++) {
            let tile = this.mineField.getTile(x, y);
            let image = tile.getImage();
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
         if (this.score >= (Game.COLS * Game.ROWS) - Game.BOMB_COUNT) {
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
      this.stage.context.fillText('You Win!', (Tile.WIDTH * Game.COLS / 2), (Tile.WIDTH * Game.ROWS / 2 + 22));
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
         if (this.score >= (Game.COLS * Game.ROWS) - Game.BOMB_COUNT) {
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
            if (col >= 0 && col < Game.COLS && row >= 0 && row < Game.ROWS) {
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
      this.mineField.makeGrid(Game.ROWS, Game.COLS);
      this.mineField.scatterBombs(Game.BOMB_COUNT);
      this.show();
      this.timer.start();
   }
}

// Load the game after the page is fully loaded
var game: Game;

window.addEventListener('load', function () {
   game = new Game();
   game.start();
});
