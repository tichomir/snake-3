export const GAME_STATE = Object.freeze({
  START:     'start',
  PLAYING:   'playing',
  PAUSED:    'paused',
  GAME_OVER: 'game_over',
});

export class GameStateMachine {
  constructor() {
    this.current = GAME_STATE.START;
  }

  startGame() {
    if (this.current === GAME_STATE.START) {
      this.current = GAME_STATE.PLAYING;
    }
  }

  pause() {
    if (this.current === GAME_STATE.PLAYING) {
      this.current = GAME_STATE.PAUSED;
    }
  }

  resume() {
    if (this.current === GAME_STATE.PAUSED) {
      this.current = GAME_STATE.PLAYING;
    }
  }

  togglePause() {
    if      (this.current === GAME_STATE.PLAYING) this.pause();
    else if (this.current === GAME_STATE.PAUSED)  this.resume();
  }

  gameOver() {
    if (this.current === GAME_STATE.PLAYING) {
      this.current = GAME_STATE.GAME_OVER;
    }
  }

  restart() {
    this.current = GAME_STATE.START;
  }
}
