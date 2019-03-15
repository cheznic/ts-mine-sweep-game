"use strict";
// Setup the timer
var timer;
(function (timer) {
    var Timer = /** @class */ (function () {
        function Timer(divName) {
            this.time = 0;
            this.intervalId = 0;
            this.div = document.getElementById(divName);
            this.div.innerHTML = "00:00:00";
        }
        Timer.getInstance = function (divName) {
            if (!Timer.INSTANCE) {
                Timer.INSTANCE = new Timer(divName);
            }
            return Timer.INSTANCE;
        };
        Timer.prototype.start = function () {
            Timer.INSTANCE.stop();
            Timer.INSTANCE.time = 0;
            Timer.INSTANCE.div.innerHTML = formatTime(Timer.INSTANCE.time);
            Timer.INSTANCE.intervalId = setInterval(function () {
                Timer.INSTANCE.time++;
                Timer.INSTANCE.div.innerHTML = formatTime(Timer.INSTANCE.time);
            }, 1000);
        };
        Timer.prototype.stop = function () {
            clearInterval(Timer.INSTANCE.intervalId);
        };
        return Timer;
    }());
    timer.Timer = Timer;
    function formatTime(seconds) {
        var sec = Math.floor(seconds);
        var hours = Math.floor(sec / 3600);
        sec -= hours * 3600;
        var minutes = Math.floor(sec / 60);
        sec -= minutes * 60;
        return "Time: " + ("00" + hours).slice(-2) + ':' +
            ("00" + minutes).slice(-2) + ':' +
            ("00" + sec).slice(-2);
    }
})(timer || (timer = {}));
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
var Tile = /** @class */ (function () {
    function Tile(x, y) {
        this.x = -1;
        this.y = -1;
        this.row = -1;
        this.col = -1;
        this.hasBomb = false;
        this.isClicked = false;
        this.isFlagged = false;
        this.adjacentBombs = -1;
        this.x = x;
        this.y = y;
    }
    // display the correct image
    Tile.prototype.getImage = function () {
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
    };
    Tile.initImage = function (width, height, file) {
        var img = new Image(width, height);
        img.src = file;
        return img;
    };
    Tile.WIDTH = 22;
    Tile.HEIGHT = 22;
    Tile.images = {
        tile: { image: Tile.initImage(Tile.WIDTH, Tile.HEIGHT, './img/tile.png') },
        flag: { image: Tile.initImage(Tile.WIDTH, Tile.HEIGHT, './img/flag.png') },
        number: { image: Tile.initImage(Tile.WIDTH, Tile.HEIGHT, './img/number.png') },
        bomb: { image: Tile.initImage(Tile.WIDTH, Tile.HEIGHT, './img/bomb.png') },
        zero: { image: Tile.initImage(Tile.WIDTH, Tile.HEIGHT, './img/zero.png') }
    };
    return Tile;
}());
var MineField = /** @class */ (function () {
    function MineField() {
        var _this = this;
        // layout the tiles on the grid
        this.makeGrid = function (rows, cols) {
            for (var x = 0; x < cols; x++) {
                _this.tiles[x] = [];
                for (var y = 0; y < rows; y++) {
                    _this.tiles[x][y] = new Tile(x, y);
                    _this.tiles[x][y].x = x * Tile.WIDTH;
                    _this.tiles[x][y].y = y * Tile.HEIGHT;
                    _this.tiles[x][y].row = y;
                    _this.tiles[x][y].col = x;
                }
            }
        };
        // randomly scatter the bombs
        this.scatterBombs = function (bombCount) {
            var total = Game.COLS * Game.ROWS;
            Loop1: for (var i = 0; i < bombCount; i++) {
                var bombIndex = Math.floor(Math.random() * total);
                var xyIndex = 0;
                for (var x = 0; x < Game.COLS; x++) {
                    for (var y = 0; y < Game.ROWS; y++) {
                        if (xyIndex == bombIndex) {
                            // check if there's already a bomb here
                            if (_this.tiles[x][y].hasBomb) {
                                // try again
                                i--;
                                continue Loop1;
                            }
                            _this.tiles[x][y].hasBomb = true;
                        }
                        xyIndex++;
                    }
                }
            }
            // set adjacent bomb count
            for (var x = 0; x < Game.COLS; x++) {
                for (var y = 0; y < Game.ROWS; y++) {
                    if (!_this.tiles[x][y].hasBomb) {
                        _this.tiles[x][y].adjacentBombs = _this.countAdjacentBombs(_this.tiles[x][y]);
                    }
                }
            }
        };
        this.countAdjacentBombs = function (tile) {
            var bombCount = 0;
            for (var x = -1; x < 2; x++) {
                for (var y = -1; y < 2; y++) {
                    var col = tile.col + x;
                    var row = tile.row + y;
                    if (col >= 0 && col < Game.COLS && row >= 0 && row < Game.ROWS) {
                        if (_this.tiles[col][row].hasBomb) {
                            bombCount++;
                        }
                    }
                }
            }
            return bombCount;
        };
        this.getTile = function (x, y) {
            return _this.tiles[x][y];
        };
        this.setTile = function (x, y, tile) {
            _this.tiles[x][y] = tile;
        };
        this.tiles = [];
    }
    return MineField;
}());
var Stage = /** @class */ (function () {
    function Stage(canvasName) {
        var _this = this;
        this.canvas = document.getElementById(canvasName);
        this.canvas.focus();
        this.context = this.canvas.getContext('2d');
        if (this.context == null) {
            console.log("Error: Canvas failed to initialize");
            return;
        }
        this.canvas.addEventListener('click', function (e) {
            _this.handleClick(e);
        });
        this.canvas.addEventListener('contextmenu', function (e) {
            _this.handleRightClick(e);
        });
    }
    Stage.prototype.size = function (width, height) {
        this.canvas.setAttribute('width', width.toString());
        this.canvas.setAttribute('height', height.toString());
    };
    Object.defineProperty(Stage.prototype, "bgColor", {
        set: function (bgColor) {
            this.canvas.style.backgroundColor = bgColor;
        },
        enumerable: true,
        configurable: true
    });
    Stage.prototype.handleClick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        var point = new Coordinate(event.offsetX || event.layerX, event.offsetY || event.layerY);
        var coordinate = new Coordinate(Math.floor(point.x / Tile.WIDTH), Math.floor(point.y / Tile.HEIGHT));
        var custEvent = new CustomEvent('tileClickedEvent', { detail: { tile: { 'x': coordinate.x, 'y': coordinate.y } } });
        window.dispatchEvent(custEvent);
    };
    Stage.prototype.handleRightClick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        var point = new Coordinate(event.offsetX || event.layerX, event.offsetY || event.layerY);
        var coordinate = new Coordinate(Math.floor(point.x / Tile.WIDTH), Math.floor(point.y / Tile.HEIGHT));
        var custEvent = new CustomEvent('tileRightClickedEvent', { detail: { tile: { 'x': coordinate.x, 'y': coordinate.y } } });
        window.dispatchEvent(custEvent);
    };
    return Stage;
}());
var Coordinate = /** @class */ (function () {
    function Coordinate(x, y) {
        this.x = x;
        this.y = y;
    }
    return Coordinate;
}());
var ScoreBoard = /** @class */ (function () {
    function ScoreBoard(divName) {
        this._score = 0;
        this.div = document.getElementById(divName);
        this.div.innerHTML = "000";
    }
    ScoreBoard.getInstance = function (divName) {
        if (!ScoreBoard.INSTANCE) {
            ScoreBoard.INSTANCE = new ScoreBoard(divName);
        }
        return ScoreBoard.INSTANCE;
    };
    Object.defineProperty(ScoreBoard.prototype, "score", {
        get: function () {
            return this._score;
        },
        set: function (score) {
            this._score = score;
            this.div.innerHTML = 'Score: ' + ('000' + score).slice(-3);
        },
        enumerable: true,
        configurable: true
    });
    return ScoreBoard;
}());
var Game = /** @class */ (function () {
    function Game() {
        var _this = this;
        this.stage = new Stage('minefield');
        this.mineField = new MineField();
        this.timer = timer.Timer.getInstance('timerDiv');
        this.scoreBoard = ScoreBoard.getInstance('scoreBoardDiv');
        this.over = true;
        this.score = 0;
        this.show = function () {
            if (_this.stage.context == null) {
                console.log('Error: canvas context is null, exiting');
                return;
            }
            _this.stage.context.clearRect(0, 0, Game.WIDTH, Game.HEIGHT);
            for (var x = 0; x < Game.COLS; x++) {
                for (var y = 0; y < Game.ROWS; y++) {
                    var tile = _this.mineField.getTile(x, y);
                    var image = tile.getImage();
                    _this.stage.context.drawImage(image, (x * Tile.WIDTH), y * Tile.HEIGHT, Tile.WIDTH, Tile.HEIGHT);
                    if (tile.adjacentBombs > 0 && tile.isClicked) {
                        switch (tile.adjacentBombs) {
                            case 1: {
                                _this.stage.context.fillStyle = '#229954';
                                break;
                            }
                            case 2: {
                                _this.stage.context.fillStyle = '#8E44AD';
                                break;
                            }
                            case 3: {
                                _this.stage.context.fillStyle = '#2980B9';
                                break;
                            }
                            case 4: {
                                _this.stage.context.fillStyle = '#E74C3C';
                                break;
                            }
                            case 5: {
                                _this.stage.context.fillStyle = '#D35400';
                                break;
                            }
                            case 6: {
                                _this.stage.context.fillStyle = '#2BAEAA';
                                break;
                            }
                            case 7: {
                                _this.stage.context.fillStyle = '#C0392B';
                                break;
                            }
                            case 8: {
                                _this.stage.context.fillStyle = '#2E86C1';
                                break;
                            }
                        }
                        _this.stage.context.font = 'bold 13px Arial';
                        _this.stage.context.textAlign = 'center';
                        _this.stage.context.fillText(tile.adjacentBombs.toString(), tile.x + (Tile.WIDTH / 2), tile.y + (Tile.WIDTH / 2 + 5));
                    }
                }
                if (_this.score >= (Game.COLS * Game.ROWS) - Game.BOMB_COUNT) {
                    _this.win();
                    // this.end();
                }
            }
        };
        this.win = function () {
            if (_this.stage.context == null) {
                console.log('Error: canvas context is null, exiting');
                return;
            }
            _this.stage.context.font = '100px Righteous';
            _this.stage.context.fillStyle = _this.getRandomColor();
            _this.stage.context.textAlign = 'center';
            _this.stage.context.shadowColor = '#7f7f7f';
            _this.stage.context.shadowOffsetX = 1;
            _this.stage.context.shadowOffsetY = 1;
            _this.stage.context.shadowBlur = 3;
            _this.stage.context.fillText('You Win!', (Tile.WIDTH * Game.COLS / 2), (Tile.WIDTH * Game.ROWS / 2 + 22));
        };
        this.getRandomColor = function () {
            var hue = Math.floor(Math.random() * 360);
            var color = 'hsla(' + hue + ', 100%, 75%, 1)';
            return color;
        };
        this.handleTileClick = function (event) {
            if (_this.over) {
                return;
            }
            var e = event;
            var tile = _this.mineField.getTile(e.detail.tile.x, e.detail.tile.y);
            if (tile.isFlagged) {
                return;
            }
            if (tile.isClicked) {
                return;
            }
            tile.isClicked = true;
            if (tile.hasBomb) {
                _this.end();
            }
            else {
                _this.score++;
                _this.scoreBoard.score = _this.score;
                if (_this.score >= (Game.COLS * Game.ROWS) - Game.BOMB_COUNT) {
                    _this.end();
                }
            }
            //this.mineField.setTile(e.detail.tile.x, e.detail.tile.y, tile);
            if (tile.adjacentBombs == 0) {
                _this.clearOpenTiles(tile);
            }
            _this.show();
        };
        this.clearOpenTiles = function (tile) {
            for (var x = -1; x < 2; x++) {
                for (var y = -1; y < 2; y++) {
                    var col = tile.col + x;
                    var row = tile.row + y;
                    // keep it within the boundary
                    if (col >= 0 && col < Game.COLS && row >= 0 && row < Game.ROWS) {
                        // skip over self
                        if (x == 0 && y == 0) {
                            continue;
                        }
                        var t = _this.mineField.getTile(col, row);
                        if (t.hasBomb) {
                            continue;
                        }
                        if (t.isClicked) {
                            continue;
                        }
                        t.isClicked = true;
                        _this.score++;
                        _this.scoreBoard.score = _this.score;
                        if (t.adjacentBombs == 0) {
                            _this.clearOpenTiles(t);
                        }
                    }
                }
            }
        };
        this.handleTileRightClick = function (event) {
            var e = event;
            var tile = _this.mineField.getTile(e.detail.tile.x, e.detail.tile.y);
            tile.isFlagged = (tile.isFlagged) ? false : true;
            // this.mineField.setTile(e.detail.tile.x, e.detail.tile.y, tile);
            _this.show();
        };
        this.end = function () {
            _this.over = true;
            _this.timer.stop();
        };
        this.start = function () {
            _this.over = false;
            _this.score = 0;
            _this.scoreBoard.score = _this.score;
            _this.mineField.makeGrid(Game.ROWS, Game.COLS);
            _this.mineField.scatterBombs(Game.BOMB_COUNT);
            _this.show();
            _this.timer.start();
        };
        // init stage
        this.stage.bgColor = Game.BG_COLOR;
        this.stage.size(Game.WIDTH, Game.HEIGHT);
        // init scoreboard
        this.scoreBoard.score = 0;
        // init start button
        var startButton = document.getElementById('startButton');
        if (startButton == null) {
            console.log("Error: start button didn't initialize");
            return;
        }
        window.addEventListener('startButtonClickedEvent', this.start, false);
        startButton.onclick = function () { dispatchEvent(new Event('startButtonClickedEvent')); };
        // init minefield
        this.mineField.makeGrid(Game.ROWS, Game.COLS);
        this.mineField.scatterBombs(Game.BOMB_COUNT);
        window.addEventListener('tileClickedEvent', this.handleTileClick, false);
        window.addEventListener('tileRightClickedEvent', this.handleTileRightClick, false);
    }
    Game.ROWS = 30;
    Game.COLS = 30;
    Game.BOMB_COUNT = 110;
    Game.HEIGHT = (Game.ROWS * Tile.HEIGHT);
    Game.WIDTH = (Game.COLS * Tile.WIDTH);
    Game.BG_COLOR = '#335577';
    return Game;
}());
// Load the game after the page is fully loaded
var game;
window.addEventListener('load', function () {
    game = new Game();
    game.start();
});
