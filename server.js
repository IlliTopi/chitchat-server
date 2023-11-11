const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server, {cors: {origin: "*"}})
const mysql = require('mysql2')


const jwt = require('jsonwebtoken')

const dotenv = require('dotenv')
app.use(express.json())

dotenv.config()


require('./endpoints/auth/auth.js')(app)




//routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})



io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('chat message',(msg)=>{
    console.log('message: ' + msg)
    io.emit('chat message',msg)
  })
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})


server.listen(process.env.PORT, () => {
  console.log('listening on *:' + process.env.PORT)
})
