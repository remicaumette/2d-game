export class Renderer {
  static COLS = 21
  static ROWS = 15

  constructor({ element, width, height }) {
    this.canvas = element
    this.canvas.width = width
    this.canvas.height = height
    this.context = this.canvas.getContext('2d')
    this.objects = []
  }

  setMap(map) {
    this.map = map
  }

  setCameraPosition(position) {
    this.cameraPosition = position
  }

  addObject(object) {
    this.objects.push(object)
  }

  get cellSize() {
    return Math.min(this.canvas.width / Renderer.COLS, this.canvas.height / Renderer.ROWS)
  }

  get leftMargin() {
    return (this.canvas.width - (Renderer.COLS * this.cellSize)) / 2
  }

  get topMargin() {
    return (this.canvas.height - (Renderer.ROWS * this.cellSize)) / 2
  }

  render() {
    this.renderMap()
    for (const object of this.objects) {
      object.render(this)
    }
  }

  renderMap() {
    this.context.fillStyle = '#000'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    for (const layer of this.map.layers) {
      if (layer.type === 'tilelayer') {
        for (let i = 0; i < layer.data.length; i++) {
          const tileId = layer.data[i]
          const tile = this.map.tiles[tileId]
          if (!tile || tileId === 0) {
            continue
          }

          const x = i % this.map.width
          const y = Math.floor(i / this.map.width)
          this.renderTile({ tile, x, y })
        }
      }
    }
  }

  renderTile({ tile, x, y, height = 1 }) {
    const relativeX = x - this.cameraPosition.x
    const relativeY = y - this.cameraPosition.y

    if (
      Math.abs(relativeX) > ((Renderer.COLS - 1) / 2) ||
      Math.abs(relativeY) > ((Renderer.ROWS - 1) / 2)
    ) {
      return
    }

    this.context.drawImage(
      tile.image, tile.x, tile.y, tile.width, tile.height,
      this.leftMargin + (relativeX + ((Renderer.COLS - 1) / 2)) * this.cellSize,
      this.topMargin + ((relativeY + ((Renderer.ROWS - 1) / 2)) - (height - 1)) * this.cellSize,
      this.cellSize, this.cellSize * height
    )
  }
}
