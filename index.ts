// Import stylesheets
import './style.css';
/*
GAME RULES:

- The game has 2 players, playing in rounds
- In each turn, a player rolls a dice as many times as he whishes. Each result get added to his ROUND score
- BUT, if the player rolls a 1, all his ROUND score gets lost. After that, it's the next player's turn
- The player can choose to 'Hold', which means that his ROUND score gets added to his GL0BAL score. After that, it's the next player's turn
- The first player to reach 100 points on GLOBAL score wins the game

*/

type Dice= 1 | 2 | 3 | 4 | 5 | 6;

namespace Dice {

  export function generateRandom(): Dice{
    return ~~(Math.random()*5) + 1 as any;
  }

}


function getDiceImageUrl(diceNumber: Dice ){
  return `//garronej.github.io/js-dice-game/dice-${diceNumber}.png`;
}


class Player {

  private static playerCount = 0

  private currentScore= 0;
  private globalScore= 0;

  public getCurrentScore(){
    return this.currentScore;
  }

  public getGlobalScore(){
    return this.globalScore;
  }

  constructor(
    public readonly playerName= `Player ${++Player.playerCount}`,
  ){}


    public resetScores(){
        this.currentScore = 0;
        this.globalScore = 0;
    }


  public rollDice(): Dice {

    const dice = Dice.generateRandom();

    if( dice === 1 ){

      this.currentScore = 0;

      return dice;


    }

    this.currentScore+= dice;

    return dice;

  }

  public hold(): void{

    this.globalScore+= this.currentScore;
    this.currentScore=0;

  }

}

class Game {

  private static readonly scoreToWin= 10;

    private isGamePlaying : boolean = false;

  private readonly player1: Player;
  private readonly player2: Player;
  private readonly wrapper : HTMLElement;

  private playerPlaying: 1 | 2 | undefined;


  constructor(htmlElement: HTMLElement){

    this.player1 = new Player("Player 1");
    this.player2 = new Player("Player 2");
    this.wrapper = htmlElement;

  }

  private getWinner() : 1 | 2 | undefined{
      if(this.player1.getGlobalScore() >= Game.scoreToWin){
          return 1;
      }else if(this.player2.getGlobalScore() >= Game.scoreToWin){
          return 2;
      }else{
          return undefined;
      }
  }



  private render(dice, winner : 1 | 2 | undefined){


    for(const i of [0, 1]){
        document.getElementById(`current-${i}`).innerText = i === 0 ?
        `${this.player1.getCurrentScore()}` : `${this.player2.getCurrentScore()}`;

        document.getElementById(`score-${i}`).innerText = i === 0 ?
        `${this.player1.getGlobalScore()}` : `${this.player2.getGlobalScore()}`;
    }
        
    this.wrapper.querySelector(".dice").setAttribute("src", `docs/dice-${dice}.png`);



    changeActivePanel : {
        const panel0 = this.wrapper.querySelector(".player-0-panel");
        const panel1 = this.wrapper.querySelector(".player-1-panel");

        if(winner != undefined){

            for(const panel of [panel0, panel1]){
                panel.classList.remove("active");
            }

            document.getElementById(`name-${winner - 1}`).innerText = "Winner";
            
            winner === 1 ? panel0.classList.add("winner") : panel1.classList.add("winner");

            return;

        }

        if(this.playerPlaying === 1){
            panel1.classList.remove("active");
            panel0.classList.add("active");

            break changeActivePanel;
        }

        panel1.classList.add("active");
        panel0.classList.remove("active");

    }

  }

    public gameInit(){
        this.wrapper.querySelector(".btn-new").addEventListener("click", ()=>{

            for(const player of [this.player1, this.player2]){
                player.resetScores();
            }

            this.playerPlaying = 1;


            for(const panel of [0, 1]){
                this.wrapper.querySelector(`.player-${panel}-panel`).classList.remove("winner");
                document.getElementById(`name-${panel}`).innerText = `Player ${panel + 1}`;
            }


            this.render(1, undefined);
            


            if(!this.isGamePlaying){
                this.play();
            }

            

        });
    }

    private play(){

        this.playerPlaying = 1;

        let dice;

        console.log(this.getWinner());

        this.isGamePlaying = true;



        for(const selector of [".btn-roll", ".btn-hold"]){

            this.wrapper.querySelector(`${selector}`).addEventListener("click", ()=>{
        
                if(this.getWinner() != undefined){
                    return;
                }

                rollAndHold : {

                    if(selector === ".btn-roll"){
                        dice = this.playerPlaying === 1 ? this.player1.rollDice() : 
                        this.player2.rollDice();
                        break rollAndHold;
                    }

                    this.playerPlaying === 1 ? this.player1.hold() : this.player2.hold();
                    this.playerPlaying = this.playerPlaying === 1 ? 2 : 1;
                }


                if(dice === 1){
                    this.playerPlaying = this.playerPlaying === 1 ? 2 : 1;
                }

                


                this.render(dice, this.getWinner());





            });

        }




    }





}

document.addEventListener("DOMContentLoaded", ()=>{

    const game = new Game(document.querySelector(".wrapper"));

    game.gameInit();




}, false);