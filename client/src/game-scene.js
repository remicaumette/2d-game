import {Renderer} from "./renderer.js";
import {Map} from "./map.js";
import {Character, CharacterDirection} from "./character.js";
import {Vector2D} from "./vector2d.js";
import {TileSet} from "./tile.js";

export class GameScene {
  constructor({ renderer, map, socket, helloOptions }) {
    this.renderer = renderer
    this.map = map
    this.socket = socket
    this.helloOptions = helloOptions
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleChatFormSubmission = this.handleChatFormSubmission.bind(this)
    this.handleWindowResize = this.handleWindowResize.bind(this)
    this.handleHello = this.handleHello.bind(this)
    this.handleCharacterAdded = this.handleCharacterAdded.bind(this)
    this.handleCharacterRemoved = this.handleCharacterRemoved.bind(this)
    this.handleCharacterMoved = this.handleCharacterMoved.bind(this)
    this.handleChat = this.handleChat.bind(this)
  }

  start() {
    this.running = true
    document.addEventListener('keydown', this.handleKeyDown)
    document.getElementById('chat-form').addEventListener('submit', this.handleChatFormSubmission)
    window.addEventListener('resize', this.handleWindowResize)
    this.socket.addEventListener('hello', this.handleHello)
    this.socket.addEventListener('character-added', this.handleCharacterAdded)
    this.socket.addEventListener('character-removed', this.handleCharacterRemoved)
    this.socket.addEventListener('character-moved', this.handleCharacterMoved)
    this.socket.addEventListener('chat', this.handleChat)

    this.socket.emit('hello', this.helloOptions)
    this.render()
  }

  stop() {
    this.running = false
    document.removeEventListener('keydown', this.handleKeyDown)
    document.getElementById('chat-form').removeEventListener('submit', this.handleChatFormSubmission)
    window.removeEventListener('resize', this.handleWindowResize)
    this.socket.removeEventListener('hello', this.handleHello)
    this.socket.removeEventListener('character-added', this.handleCharacterAdded)
    this.socket.removeEventListener('character-removed', this.handleCharacterRemoved)
    this.socket.removeEventListener('character-moved', this.handleCharacterMoved)
    this.socket.removeEventListener('chat', this.handleChat)
  }

  render() {
    if (!this.character) {
      if (this.running) {
        requestAnimationFrame(this.render.bind(this))
      }
      return
    }

    this.renderer.setCameraPosition(this.character.position)
    this.renderer.render()

    const posText = `X: ${this.renderer.cameraPosition.x} / Y: ${this.renderer.cameraPosition.y}`
    if (posText !== document.getElementById('position').innerText) {
      document.getElementById('position').innerText = posText
    }

    if (this.running) {
      requestAnimationFrame(this.render.bind(this))
    }
  }

  handleKeyDown(event) {
    switch (event.key.toUpperCase()) {
      case 'ARROWUP':
        this.socket.emit('request-character-move', {
          position: this.character.position.add(new Vector2D(0, -1)),
          direction: CharacterDirection.UP,
        })
        break
      case 'ARROWDOWN':
        this.socket.emit('request-character-move', {
          position: this.character.position.add(new Vector2D(0, 1)),
          direction: CharacterDirection.DOWN,
        })
        break
      case 'ARROWLEFT':
        this.socket.emit('request-character-move', {
          position: this.character.position.add(new Vector2D(-1, 0)),
          direction: CharacterDirection.LEFT,
        })
        break
      case 'ARROWRIGHT':
        this.socket.emit('request-character-move', {
          position: this.character.position.add(new Vector2D(1, 0)),
          direction: CharacterDirection.RIGHT,
        })
        break
    }
  }

  handleWindowResize() {
    this.renderer.canvas.width = window.innerWidth
    this.renderer.canvas.height = window.innerHeight - document.getElementById('game-manager').clientHeight
  }

  handleHello(event) {
    console.log(event)
    this.characterDetails = event
  }

  async handleCharacterAdded(event) {
    const character = this.renderer.objects.find(
      (object) => object instanceof Character && object.id === event.id
    )
    if (character) {
      character.position = new Vector2D(event.position.x, event.position.y)
      character.direction = event.direction
      return
    }

    this.renderer.addObject(new Character({
      id: event.id,
      name: event.name,
      position: new Vector2D(event.position.x, event.position.y),
      direction: event.direction,
      tileset: await TileSet.load('/map/character.json'),
    }))
  }

  handleCharacterRemoved(event) {
    this.renderer.objects = this.renderer.objects.filter(
      (object) => !(object instanceof Character && object.id === event.id)
    )
  }

  handleCharacterMoved(event) {
    const character = this.renderer.objects.find(
      (object) => object instanceof Character && object.id === event.characterId
    )
    if (!character) {
      console.warn('Character missing, cannot update')
      return
    }

    character.position = new Vector2D(event.position.x, event.position.y)
    character.direction = event.direction
  }

  handleChat(event) {
    const element = document.createElement('div')
    element.className = 'chat-message'
    element.innerHTML = event.message

    const container = document.getElementById('chat-message-container')
    container.append(element)
    container.scrollTop = container.scrollHeight
  }

  handleChatFormSubmission(event) {
    event.preventDefault()
    const message = event.target.elements.message.value
    this.socket.emit('chat', { message })
    event.target.elements.message.value = ''
  }

  get character() {
    return this.renderer.objects.find(
      (object) => object instanceof Character && object.id === this.characterDetails.id
    )
  }

  static async load({ socket, helloOptions }) {
    const renderer = new Renderer({
      element: document.getElementById('game'),
      width: window.innerWidth,
      height: window.innerHeight - document.getElementById('game-manager').clientHeight
    })
    const map = await Map.load('/map/main.json')
    renderer.setMap(map)
    return new GameScene({ renderer, map, socket, helloOptions })
  }
}
