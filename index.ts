// Import stylesheets
import "./style.css";
import { getAppApi, AppEventHandlers, PlayerId } from "./appLogic";

const rootElement= document.querySelector(".wrapper");

const  { appEventHandlers } =(()=>{
  
  const getPlayerPanel = (playerId: PlayerId) =>
        document.querySelector(`.player-${playerId}-panel`);

  const appEventHandlers: AppEventHandlers ={
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
            getPlayerPanel(playerId).querySelector(".player-name").innerHTML = `Player ${playerId +1}`;
            getPlayerPanel(playerId).classList.remove("winner");
          });

          return;

      }

      rootElement.querySelector(`#name-${playerId}`).innerHTML = "Winner";

      getPlayerPanel(playerId).classList.add("winner");

    },
    "onScoreChange": ({ playerId, scoreType, value}) => {
     
      getPlayerPanel(playerId).querySelector(
        `#${scoreType.toLowerCase()}-${playerId}`).innerHTML = `${value}`;
      
    }

  };

  return { appEventHandlers };

})();

const appApi= getAppApi({ appEventHandlers });

rootElement
  .querySelector(".btn-new")
  .addEventListener("click", ()=> appApi.newGame());

rootElement
  .querySelector(".btn-roll")
  .addEventListener("click", ()=> appApi.rollDice());

rootElement
  .querySelector(".btn-hold")
  .addEventListener("click", ()=> appApi.hold());







