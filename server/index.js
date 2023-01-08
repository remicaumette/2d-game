import { Server } from "socket.io";
import map from '../client/map/main.json' assert { type: 'json' }
import {Context} from "./context.js";

const port = parseInt(process.env.PORT || '3000', 10)
const io = new Server(port, {
  cors: {
    origin: '*'
  }
})

let contexts = []

const movableLayer = map.layers.find(
  (layer) => layer.properties?.find((prop) => prop.name === 'movable' && prop.value === true)
)

io.on("connection", (socket) => {
  let context = new Context(socket)

  socket.on("hello", (args) => {
    context.character.name = args.name

    console.log(`${context.character.name} joined the game! (ID: ${context.character.id})`)
    socket.emit('hello', { id: context.character.id, name: context.character.name })

    io.emit('character-added', context.character)
    io.emit('chat', { message: `<b style="color: green">${context.character.name} joined the game!</b>` })
    contexts.forEach((context) => {
      socket.emit('character-added', context.character)
    })

    contexts.push(context)
  })

  socket.on("request-character-move", (args) => {
    const tileId = movableLayer.data[args.position.x + args.position.y * movableLayer.width]
    if (tileId) {
      context.character.position = args.position
    }

    context.character.direction = args.direction
    io.emit("character-moved", {
      characterId: context.character.id,
      position: context.character.position,
      direction: context.character.direction,
    })
  })

  socket.on("disconnect", (reason) => {
    console.log(`${context.character.name} left the game! (ID: ${context.character.id}, Reason: ${reason})`)
    io.emit('character-removed', { id: context.character.id })
    io.emit('chat', { message: `<b style="color: red">${context.character.name} left the game!</b>` })
    contexts = contexts.filter((value) => value !== context)
  })

  socket.on("chat", ({ message }) => {
    console.log(`${context.character.name}: ${message}`)
    io.emit('chat', { message: `<b>${context.character.name} : </b> ${message}` })
  })
})
