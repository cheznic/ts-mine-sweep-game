// Setup the timer
export class Timer {
   private static INSTANCE: Timer;

   private div: HTMLDivElement;
   private time: number = 0;
   private intervalId: number = 0;

   private constructor(divName: string) {
      this.div = <HTMLDivElement>document.getElementById(divName);
      this.div.innerHTML = "00:00:00";
   }

   static getInstance(divName: string): Timer {
      if (!Timer.INSTANCE) { Timer.INSTANCE = new Timer(divName); }
      return Timer.INSTANCE;
   }

   public start() {
      Timer.INSTANCE.stop();
      Timer.INSTANCE.time = 0;
      Timer.INSTANCE.div.innerHTML = formatTime(Timer.INSTANCE.time);
      Timer.INSTANCE.intervalId = setInterval(() => {
         Timer.INSTANCE.time++;
         Timer.INSTANCE.div.innerHTML = formatTime(Timer.INSTANCE.time);
      }, 1000);
   }

   public stop() {
      clearInterval(Timer.INSTANCE.intervalId);
   }
}

function formatTime(seconds: number): string {
   let sec = Math.floor(seconds);

   let hours = Math.floor(sec / 3600);
   sec -= hours * 3600;

   let minutes = Math.floor(sec / 60);
   sec -= minutes * 60;

   return "Time: " + ("00" + hours).slice(-2) + ':' +
      ("00" + minutes).slice(-2) + ':' +
      ("00" + sec).slice(-2);
}
