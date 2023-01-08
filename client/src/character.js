export const CharacterDirection = {
  UP: 'CHARACTER_DIRECTION_UP',
  DOWN: 'CHARACTER_DIRECTION_DOWN',
  LEFT: 'CHARACTER_DIRECTION_LEFT',
  RIGHT: 'CHARACTER_DIRECTION_RIGHT',
}

export class Character {
  constructor({ id, name, position, direction, tileset }) {
    this.id = id
    this.name = name
    this.position = position
    this.direction = direction
    this.tileset = tileset
  }

  render(renderer) {
    const tilesByDirection = {
      [CharacterDirection.UP]: this.tileset.tiles[34],
      [CharacterDirection.DOWN]: this.tileset.tiles[0],
      [CharacterDirection.LEFT]: this.tileset.tiles[51],
      [CharacterDirection.RIGHT]: this.tileset.tiles[17],
    }

    // renderer.context.fillStyle = 'rgba(0, 0, 0, 1)'
    // renderer.context.fillRect(50, 76, 90, 20);
    //
    // renderer.context.font = '14px serif'
    // renderer.context.fillStyle = '#fff'
    // renderer.context.textAlign = 'center'
    // renderer.context.fillText("Hello world", 0, 90)

    renderer.renderTile({
      tile: tilesByDirection[this.direction],
      x: this.position.x,
      y: this.position.y,
      height: 2,
    })
  }
}
