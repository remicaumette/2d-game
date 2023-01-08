export class TileSet {
  constructor(tiles) {
    this.tiles = tiles
  }

  static async load(src, { initialId = 1 } = {}) {
    const tileset = await import(src)
    const image = await this.#loadImage(`/map/${tileset.image}`)
    const tiles = []

    let id = initialId
    for (let y = 0; y * tileset.tileheight < tileset.imageheight; y++) {
      for (let x = 0; x * tileset.tilewidth < tileset.imagewidth; x++) {
        tiles.push({
          id: id++,
          x: x * tileset.tilewidth,
          y: y * tileset.tileheight,
          width: tileset.tilewidth,
          height: tileset.tileheight,
          image,
        })
      }
    }

    return new TileSet(tiles)
  }

  static #loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.src = src
      image.onload = () => resolve(image)
      image.onerror = (error) => reject(error)
    })
  }
}
