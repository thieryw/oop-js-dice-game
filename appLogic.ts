

export type Dice = 1 | 2 | 3 | 4 | 5 | 6;

export type PlayerId= 0 | 1;

export namespace PlayerId {
  
  export function otherPlayer(playerId: PlayerId): PlayerId{
    switch(this.playerPlayingId){
      case 0: return 1;
      case 1: return 0;
    }
  }

  export const every: PlayerId[] = [0, 1];

};


export type AppApi = {
  newGame(): void; 
  rollDice(): void;
  hold(): void;
};

export type AppEventHandlers = {
  onScoreChange: (
    params: {
      playerId: PlayerId,
      scoreType: "GLOBAL" | "CURRENT";
    }
  )=> void;
  onDiceChange: (newDice: Dice)=> void;
  onPlayerPlayingChange: (playerId: PlayerId)=> void;
  onPlayerWin: (playerId: PlayerId | undefined)=> void;
};

export function getAppApi(
  params: {
    appEventHandlers: AppEventHandlers;
  }
): AppApi {

  return null as any;

}

