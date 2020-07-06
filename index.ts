// Import stylesheets
import "./style.css";
import { Evt, StatefulReadonlyEvt } from "evt";
/*
GAME RULES:

- The game has 2 players, playing in rounds
- In each turn, a player rolls a dice as many times as he whishes. Each result get added to his ROUND score
- BUT, if the player rolls a 1, all his ROUND score gets lost. After that, it's the next player's turn
- The player can choose to 'Hold', which means that his ROUND score gets added to his GL0BAL score. After that, it's the next player's turn
- The first player to reach 100 points on GLOBAL score wins the game

*/

type Dice = 1 | 2 | 3 | 4 | 5 | 6;

namespace Dice {
  export function generateRandom(): Dice {
    return (~~(Math.random() * 5) + 1) as any;
  }

  export function getImageUrl(diceNumber: Dice) {
    return `//thieryw.github.io/oop-js-dice-game/docs/dice-${diceNumber}.png`;
  }
}

class Player {

  //private currentScore = 0;
  private readonly _evtCurrentScore= Evt.create<number>(0);
  
  //private globalScore = 0;
  private readonly _evtGlobalScore= Evt.create<number>(0);

  
  public get evtCurrentScore(): StatefulReadonlyEvt<number>{
    return this._evtCurrentScore;
  }

  //This is equivalent to the above function.
  public get evtGlobalScore() {
    return Evt.asNonPostable(this._evtGlobalScore);;
  }
  

  constructor(public readonly name: string) {}

  public resetScores() {
    this._evtCurrentScore.state = 0;
    this._evtGlobalScore.state = 0;
  }

  public rollDice(): Dice {
    const dice = Dice.generateRandom();

    if (dice === 1) {
      this._evtCurrentScore.state = 0;

      return dice;
    }

    this._evtCurrentScore.state += dice;

    return dice;
  }

  public hold(): void {
    this._evtGlobalScore.state += this.evtCurrentScore.state;
    this._evtCurrentScore.state = 0;
  }
}

namespace Game {
  export type PlayerId = 0 | 1;
}

class Game {

  private static readonly scoreToWin = 40;

  private static playerIds: Game.PlayerId[] = [0, 1];
  private readonly player0= new Player("Player 1");
  private readonly player1= new Player("Player 2");

  private readonly evtPlayerPlayingId = Evt.create<Game.PlayerId>(0);

  private get playerNotPlayingId(): Game.PlayerId{
    switch(this.evtPlayerPlayingId.state){
      case 0: return 1;
      case 1: return 0;
    }
  }

  private readonly evtLastRolledDice= Evt.create<Dice>(1);

  private getPlayerFromId(id: Game.PlayerId) {
    switch (id) {
      case 0: return this.player0;
      case 1: return this.player1;
    }
  }

  private evtWinner = Evt.asNonPostable(
    Evt.merge(
      Game.playerIds
        .map(
          playerId=> this.getPlayerFromId(playerId)
            .evtGlobalScore.evtChange
        )
    )
    .toStateful()
    .pipe(()=> [ 
      Game.playerIds.find(
        playerId => 
          this.getPlayerFromId(playerId).evtGlobalScore.state >= Game.scoreToWin 
      ) 
    ])
  )
  ;

  constructor(
    htmlElement: HTMLElement
  ) {

    this.setupUserInputHandlers({ htmlElement });
    this.setupReactiveRendering({ htmlElement });

  }

  private setupUserInputHandlers(
    params: { htmlElement: HTMLElement; }
  ){

    const { htmlElement }= params;

    Evt.from(
      htmlElement.querySelector(".btn-new"),
      "click"
    )
      .attach(()=> {

        for( const playerId of Game.playerIds){
          this.getPlayerFromId(playerId).resetScores();
        }

        this.evtPlayerPlayingId.state = 0;

      });
    
    Evt.from(
      htmlElement.querySelector(".btn-roll"),
      "click"
    )
      .pipe(()=> this.evtWinner.state === undefined)
      .attach(()=> {

        this.evtLastRolledDice.state = this.getPlayerFromId(this.evtPlayerPlayingId.state)
          .rollDice();
          
        if (this.evtLastRolledDice.state === 1) {
          this.evtPlayerPlayingId.state = this.playerNotPlayingId;
        }

      });

    Evt.from(
      htmlElement.querySelector(".btn-hold"),
      "click"
    )
      .pipe(()=> this.evtWinner.state === undefined)
      .attach(()=> {

        this.getPlayerFromId(this.evtPlayerPlayingId.state).hold();

        if(this.evtWinner.state === undefined){
          this.evtPlayerPlayingId.state = this.playerNotPlayingId;
        }

      });

  }

  private setupReactiveRendering(
    params: { htmlElement: HTMLElement; }
  ): void{

    const { htmlElement }= params;

    const getPlayerPanel = (playerId: Game.PlayerId) =>
      htmlElement.querySelector(`.player-${playerId}-panel`);

    for (const playerId of Game.playerIds) {

        const player= this.getPlayerFromId(playerId);

        for (const key of ["current", "score"] as const) {

          const evtScore = player[
            key === "current" ? 
              "evtCurrentScore": 
              "evtGlobalScore" 
          ];

          Evt.useEffect(
            () =>  {

              getPlayerPanel(playerId)
                .classList
                .remove("winner");

              document
                .getElementById(`name-${playerId}`)
                .innerText = player.name;

            },
            this.evtWinner
              .evtChange
              .toStateless()
              .pipe(winnerPlayerId => winnerPlayerId === undefined)
          );

          Evt.useEffect(
            ()=> document
                  .getElementById(`${key}-${playerId}`)
                  .innerText = evtScore.state.toString(),
            evtScore
          );

        }

        
    }

    Evt.useEffect(
      ()=> htmlElement
        .querySelector(".dice")
        .setAttribute("src", `${Dice.getImageUrl( this.evtLastRolledDice.state )}`),
      this.evtLastRolledDice
    );

    Evt.useEffect(
      ()=>{

        getPlayerPanel(this.playerNotPlayingId).classList.remove("active");
        getPlayerPanel(this.evtPlayerPlayingId.state).classList.add("active");

      },
      this.evtPlayerPlayingId
        .evtChange
        .toStateless()
        .pipe(()=> this.evtWinner.state === undefined)
    );

    this.evtWinner
        .evtChange
        .toStateless()
        .pipe(
          playerId=> playerId === undefined ? 
            null : [ playerId ]
        )
        .attach(winnerPlayerId=>{

          document.getElementById(`name-${winnerPlayerId}`).innerText = "Winner";

          getPlayerPanel(winnerPlayerId).classList.add("winner");

        })
        ;


  }

}

const game = new Game(document.querySelector(".wrapper"));

