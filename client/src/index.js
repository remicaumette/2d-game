import {io} from "socket.io-client"
import {GameScene} from "./game-scene.js";

const socket = io("ws://localhost:3000")

const characterName = localStorage.getItem('character-name') || prompt('Nom de votre personnage ? ')
localStorage.setItem('character-name', characterName)

const scene = await GameScene.load({
  socket,
  helloOptions: { name: characterName }
})
scene.start()
