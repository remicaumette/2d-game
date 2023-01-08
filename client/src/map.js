import {TileSet} from "./tile";

export class Map {
  constructor(layers, width, height, tiles, tileWidth, tileHeight) {
    this.layers = layers
    this.width = width
    this.height = height
    this.tiles = tiles
    this.tileWidth = tileWidth
    this.tileHeight = tileHeight
  }

  static async load(url) {
    const map = await import(url)
    const tilesets = await Promise.all(
      map.tilesets.flatMap(
        (mapTileset) => TileSet
          .load(`/map/${mapTileset.source}`, { initialId: mapTileset.firstgid })
          .then((tileset) => tileset.tiles)
      )
    )
    const tilesById = Object.fromEntries(
      tilesets.flatMap(
        (tileset) => tileset.map((tile) => [tile.id, tile])
      )
    )
    return new Map(map.layers, map.width, map.height, tilesById, map.tilewidth, map.tileheight)
  }
}
