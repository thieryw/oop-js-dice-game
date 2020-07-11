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
      value: number;
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

      

      PlayerId.every.forEach(
        playerId=> (["CURRENT", "GLOBAL"] as const).forEach(
          scoreType=> 
            appEventHandlers.onScoreChange({
              playerId,
              scoreType,
              "value": 0

            })
        )
      );

      
      appEventHandlers.onDiceChange(gameState.lastRolledDice);

      appEventHandlers.onPlayerPlayingChange(gameState.playerPlaying);

      appEventHandlers.onPlayerWin(undefined);


    },


    "hold": ()=>{

      if(gameState === null){
        return;
      }

      if( gameState.hasPlayerWon ){
        return;
      }

      const { newGameState } = (()=>{

        const newGlobalScore = (()=>{
          switch(gameState.playerPlaying){
            case 0: return gameState.player0GlobalScore + gameState.player0CurrentScore;
            case 1: return gameState.player1GlobalScore + gameState.player1CurrentScore
          }
        })();

        const hasPlayerWon = newGlobalScore >= 20;

        const newGameState: GameState = {
          ...gameState,
          [(()=>{
            switch(gameState.playerPlaying){
              case 0: return "player0GlobalScore";
              case 1: return "player1GlobalScore";
            }
          })()]: newGlobalScore,
          [(()=>{
            switch(gameState.playerPlaying){
              case 0: return "player0CurrentScore";
              case 1: return "player1CurrentScore";
            }
          })()]: 0,
          ...(hasPlayerWon?{}:{ "playerPlaying": PlayerId.otherPlayer(gameState.playerPlaying) }),
          hasPlayerWon
        };

        return { newGameState };

      })();

      
      for(const scoreType of ["CURRENT", "GLOBAL"] as const){
        appEventHandlers.onScoreChange({
          "playerId": newGameState.playerPlaying,
          "scoreType": scoreType,
          "value": (()=>{
            switch(scoreType){
              case "CURRENT": return (()=>{
                switch(newGameState.playerPlaying){
                  case 0: return newGameState.player0CurrentScore;
                  case 1: return newGameState.player1CurrentScore;
                }
              })();

              case "GLOBAL": return (()=>{
                switch(newGameState.playerPlaying){
                  case 0: return newGameState.player0GlobalScore;
                  case 0: return newGameState.player1GlobalScore;
                }
              })();
            }
          })()
        })
      }

      block: {
        if(newGameState.hasPlayerWon){
          appEventHandlers.onPlayerWin(newGameState.playerPlaying);
          break block;
        }

        appEventHandlers.onPlayerPlayingChange(gameState.playerPlaying);
      }

      gameState = newGameState
      
      },


    "rollDice": ()=>{

      if(gameState === null){
        return;
      }

      const lastRolledDice = ~~(Math.random() * 5 + 1) as Dice;
      
      const { newGameState } = (()=>{

        

        const newCurrentScore = (()=>{
          if(lastRolledDice === 1){
            return 0;
          }

          switch(gameState.playerPlaying){
            case 0: return gameState.player0CurrentScore + lastRolledDice;
            case 1: return gameState.player1CurrentScore + lastRolledDice;
          }
        })()
        
        const newGameState: GameState = {
          ...gameState,
          lastRolledDice,
          "playerPlaying": (()=>{
            if(lastRolledDice === 1){
              return PlayerId.otherPlayer(gameState.playerPlaying);
            }

            return gameState.playerPlaying;
          })(),

          [(()=>{
            switch(gameState.playerPlaying){
              case 0: return "player0CurrentScore";
              case 1: return "player1CurrentScore";
            }
          })()]: newCurrentScore
        };

        return { newGameState }
      })();
      
      appEventHandlers.onDiceChange(lastRolledDice);

      block: {
        if(gameState.lastRolledDice === 1){
          appEventHandlers.onScoreChange({
            "playerId": newGameState.playerPlaying,
            "scoreType": "CURRENT",
            "value": (()=>{
              switch(newGameState.playerPlaying){
                case 0: return 0;
                case 1: return 0;
              }
            })()
          })
          appEventHandlers.onPlayerPlayingChange(gameState.playerPlaying);

          break block;
        }

      }


      appEventHandlers.onScoreChange({
        "playerId": gameState.playerPlaying,
        "scoreType": "CURRENT",
        "value": (()=>{
          switch(gameState.playerPlaying){
            case 0: return newGameState.player0CurrentScore;
            case 1: return newGameState.player1CurrentScore;
          }
        })()
      })

      gameState = newGameState;


    }
  }

}

