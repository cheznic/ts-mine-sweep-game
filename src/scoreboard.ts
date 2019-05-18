export class ScoreBoard {
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
