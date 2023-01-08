import {v4 as uuid} from "uuid";

export class Context {
  constructor(socket) {
    this.socket = socket
    this.character = {
      id: uuid(),
      position: { x: 25, y: 23 },
      direction: 'CHARACTER_DIRECTION_DOWN',
    }
  }
}
