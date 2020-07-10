// Import stylesheets
import "./style.css";



import { getAppApi, AppEventHandler, PlayerId } from "./appLogic";


const appApi= getAppApi({
  "eventHandlers": null as any
});

  const rootElement= document.querySelector(".wrapper");


const  { appEventHandler } =(()=>{

  const getPlayerPanel = (playerId: PlayerId) =>
        this.htmlElement.querySelector(`.player-${playerId}-panel`);

  const appEventHandler: AppEventHandler ={
    "onDiceChange": dice => 
        rootElement
          .querySelector(".dice")
          .setAttribute("src", `//thieryw.github.io/oop-js-dice-game/docs/dice-${dice}.png`),
    "onPlayerPlayingChange": playerId => {
            getPlayerPanel(playerId).classList.add("active");
            getPlayerPanel(PlayerId.otherPlayer(playerId)).classList.remove("active");
    },
    "onPlayerWin": playerId => {

      if( playerId === undefined ){

          PlayerId.every.forEach(playerId=>{
            getPlayerPanel(playerId).innerHTML = `Player ${playerId +1}`;
            getPlayerPanel(playerId).classList.remove("winner");
          });

          return;

      }

      rootElement.querySelector(`#name-${playerId}`).innerHTML = "Winner";

      getPlayerPanel(playerId).classList.add("winner");

    },
    "onScoreChange": ({playerId, scoreType})=> {}

  };

  return { appEventHandler };

})();




rootElement
  .querySelector(".btn-new")
  .addEventListener("click", ()=> appApi.newGame());

rootElement
  .querySelector(".btn-roll")
  .addEventListener("click", ()=> appApi.rollDice());

rootElement
  .querySelector(".btn-hold")
  .addEventListener("click", ()=> appApi.hold());


