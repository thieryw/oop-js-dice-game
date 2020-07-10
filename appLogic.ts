

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

type GameState = Readonly<{
  player0GlobalScore: number;
  player1GlobalScore: number;
  player0CurrentScore: number;
  player1CurrentScore: number;
  lastRolledDice: Dice;
  playerPlaying: PlayerId;
  hasPlayerWon: boolean;
}>;

export function getAppApi(
  params: {
    appEventHandlers: AppEventHandlers;
  }
): AppApi {

  const { appEventHandlers } = params;

  let gameState: GameState= null as any;

  return {
    "newGame": ()=>{

      gameState= {
        "player0GlobalScore": 0,
        "player1GlobalScore": 0,
        "player0CurrentScore": 0,
        "player1CurrentScore": 0,
        "lastRolledDice": 1,
        "playerPlaying": 0,
        "hasPlayerWon": false

      };

      appEventHandlers.onScoreChange({
        "playerId" :gameState.playerPlaying,
        "scoreType" :"CURRENT"
      })

      appEventHandlers.onScoreChange({
        "playerId": 
      })


    },
    "hold": null as any,
    "rollDice": null as any
  }

}

