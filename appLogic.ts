

export namespace types {

  export type Dice = 1 | 2 | 3 | 4 | 5 | 6;

  export namespace Dice {
    export function getImageUrl(diceNumber: Dice) {
      return `//thieryw.github.io/oop-js-dice-game/docs/dice-${diceNumber}.png`;
    }
  }

  export type PlayerId= 0 | 1;

}


export type AppApi = {
  newGame(): void; 
  rollDice(): void;
  hold(): void;
};

export type AppEventHandler = {
  onScoreChange(
    params: {
      playerId: types.PlayerId,
      scoreType: "GLOBAL" | "CURRENT";
    }
  ): void;
  onDiceChange(newDice: types.Dice): void;
  onPlayerPlayingChange(playerId: types.PlayerId): void;
  onPlayerWin(playerId: types.PlayerId): void;
};

export function getAppApi(
  params: {
    eventHandlers: AppEventHandler;
  }
): AppApi {

  return null as any;

}

