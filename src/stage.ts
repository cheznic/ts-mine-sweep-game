import { Coordinate } from './coordinate';
import { Tile } from './tile';

export class Stage {
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
