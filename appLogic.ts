import { asPostable } from "evt/lib/Evt.asPostable";


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

      for(const scoreType of ["CURRENT", "GLOBAL"]){
        appEventHandlers.onScoreChange({
          "playerId": gameState.playerPlaying,
          "scoreType": scoreType as any
        });

        appEventHandlers.onScoreChange({
          "playerId": PlayerId.otherPlayer(gameState.playerPlaying),
          "scoreType": scoreType as any
        });
      }

      appEventHandlers.onDiceChange(gameState.lastRolledDice);

      appEventHandlers.onPlayerPlayingChange(gameState.playerPlaying);

      appEventHandlers.onPlayerWin(undefined);

      

    },


    "hold": ()=>{

      let newGlobaleScore = gameState[`player${gameState.playerPlaying}GlobalScore`] +
                          gameState[`player${gameState.playerPlaying}CurrentScore`];
      
      let playerHasWon = newGlobaleScore >= 20 ? true : false;

      let newPlayerPlaying = playerHasWon === true ? 
      gameState.playerPlaying : PlayerId.otherPlayer(gameState.playerPlaying);

    
      let newGameState = {
        "player0GlobalScore": newPlayerPlaying === 0 ? 
                              gameState.player0GlobalScore : newGlobaleScore
                              ,

        "player1GlobalScore": newPlayerPlaying === 0 ?
                              newGlobaleScore : gameState.player1GlobalScore
                              ,
        
        "player0CurrentScore": 0,
        "player1CurrentScore": 0,
        "lastRolledDice": gameState.lastRolledDice,
        "playerPlaying": newPlayerPlaying,
        "hasPlayerWon": playerHasWon

      }

      gameState = newGameState;
      
      

      for(const scoreType of ["CURRENT", "GLOBAL"]){
        appEventHandlers.onScoreChange({
          "playerId": gameState.playerPlaying,
          "scoreType": `${scoreType}` as any
        })
      }

      if(gameState[`player${gameState.playerPlaying}GlobalScore`] >= 20){
        appEventHandlers.onPlayerWin(gameState.playerPlaying);
        return;
      }

      appEventHandlers.onPlayerPlayingChange(gameState.playerPlaying);

      
    },


    "rollDice": ()=>{
      
      let newDice = ~~(Math.random() * 5 + 1) as Dice;
      
      let newCurrentScore = gameState.lastRolledDice === 1 ? 
                            0 : gameState[`player${gameState.playerPlaying}CurrentScore`] + newDice;
      
      let newPlayerPlaying = gameState.lastRolledDice === 1 ?
                             PlayerId.otherPlayer(gameState.playerPlaying) : 
                             gameState.playerPlaying;

      

     

      let newGameState = {
        "player0GlobalScore": gameState.player0GlobalScore,
        "player1GlobalScore": gameState.player1GlobalScore,
        "player0CurrentScore": newPlayerPlaying === 0 ?
                               0 : newCurrentScore
                              ,
        
        "player1CurrentScore": newPlayerPlaying === 0 ?
                               newCurrentScore : 0,
        
        "lastRolledDice": newDice,
        "playerPlaying": newPlayerPlaying,
        "hasPlayerWon": false

      }

      gameState = newGameState;



      appEventHandlers.onDiceChange(gameState.lastRolledDice);

      if(gameState.lastRolledDice === 1){
        appEventHandlers.onScoreChange({
          "playerId": gameState.playerPlaying,
          "scoreType": "CURRENT"
        })
        appEventHandlers.onPlayerPlayingChange(gameState.playerPlaying);

        return;
      }

      appEventHandlers.onScoreChange({
        "playerId": gameState.playerPlaying,
        "scoreType": "CURRENT"
      })



    }
  }

}

