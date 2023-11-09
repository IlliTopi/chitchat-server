const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server, {cors: {origin: "*"}})

const jwt = require('jsonwebtoken')

const dotenv = require('dotenv')

dotenv.config()


//routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post('/user/generateToken',(req,res) => {
  let jwtSecretKey = process.env.JWT_SECRET_KEY
  let data = {
    time: Date(),
    userId: 12,
  }
  
  const token = jwt.sign(data,jwtSecretKey)
  res.send(token)

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
  console.log('listening on *:3000')
})
