// Import stylesheets
import "./style.css";


import { getAppApi, AppEventHandler } from "./appLogic";


const appApi= getAppApi({
  "eventHandlers": null as any
});


const appEventHandler: AppEventHandler = {
  "onDiceChange": dice => {

  }
  
};



const rootElement= document.querySelector(".wrapper");

rootElement
  .querySelector(".btn-new")
  .addEventListener("click", ()=> appApi.newGame());

rootElement
  .querySelector(".btn-roll")
  .addEventListener("click", ()=> appApi.rollDice());

rootElement
  .querySelector(".btn-hold")
  .addEventListener("click", ()=> appApi.hold());


