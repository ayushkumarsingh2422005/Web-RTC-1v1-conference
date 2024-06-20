import express from 'express';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';

const io = new Server({
    cors: true
});
const app = new express();

app.use(bodyParser.json());



const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();
io.on('connection', (socket)=>{
    console.log("new connection")
    socket.on('join-room', (data)=>{
        const {roomId, email} = data;
        console.log(email, roomId);
        emailToSocketMapping.set(email, socket.id);
        socketToEmailMapping.set(socket.id, email);
        socket.join(roomId);
        socket.emit("joined-room", {roomId})
        socket.broadcast.to(roomId).emit("user-joined", {email})
    })

    socket.on('call-user', (data)=>{
        const {email, offer} = data;
        const fromEmail = socketToEmailMapping.get(socket.id);
        const socketId = emailToSocketMapping.get(email);
        socket.to(socketId).emit('incoming-call', {from: fromEmail, offer});
    })

    socket.on('call-accepted', (data)=>{
        const {email, ans} = data;
        const socketId = emailToSocketMapping.get(email);
        socket.to(socketId).emit('call-accepted', {ans})
    });
})


app.listen(8000, ()=>console.log("express server running at port: 8000"));
io.listen(8001);