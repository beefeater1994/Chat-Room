const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const faker = require('faker');
server.listen(80);

let users = new Map();
users.set("Lobby1", []);
let rooms = ["Lobby1"];


io.on('connection', (socket) => {
    socket.on("LOGIN", () => {
        let newUser = faker.name.findName();
        users.get("Lobby1").push(newUser);
        socket.emit("LOGIN_SUCCESS", {
            user: newUser,
            rooms: rooms,
            room: "Lobby1"
        });
        socket.join("Lobby1");
        socket.emit("SERVER_MESSAGE", "You have entered Lobby1.");
        socket.broadcast.to("Lobby1").emit("SERVER_MESSAGE_OTHER'S_OPERATION", `${newUser} enter in to Lobby1.`);
    });
    socket.on('CHANGE_NAME',(oldName, newName, room) => {
        delete users[oldName];
        let roomUsers = users.get(room);
        let index = roomUsers.indexOf(oldName);
        roomUsers.splice(index, 1, newName);
        users.set(room, roomUsers);
        socket.emit("SERVER_MESSAGE", `You have changed your name to ${newName}`);
        socket.broadcast.to(room).emit("SERVER_MESSAGE_OTHER'S_OPERATION", `${oldName} has changed his name to ${newName}`);
    });
    socket.on('SEND_MESSAGE', (data)=>{
        const {author, message, id, room} = data;
        socket.emit('RECEIVE_MESSAGE', "You", message, id);
        socket.broadcast.to(room).emit("RECEIVE_MESSAGE", author, message, id);
    });

    socket.on('CHANGE_ROOM', (oldRoom, newRoom, user, rooms) => {
        if (oldRoom === newRoom) {
            socket.emit("ALERT", `You have already in the room!`);
            return;
        }
        if (!rooms.includes(newRoom)) {
            rooms.push(newRoom);
        }
        if (!users.has(newRoom)) {
            users.set(newRoom, []);
        }
        socket.leave(oldRoom);
        socket.join(newRoom);
        let oldRoomUsers = users.get(oldRoom);
        oldRoomUsers.splice(oldRoomUsers.indexOf(user), 1);
        users.set(oldRoom, oldRoomUsers);
        users.set(newRoom, [...users.get(newRoom), user]);
        socket.emit("SERVER_MESSAGE", `You have moved to ${newRoom}`);
        socket.broadcast.to(oldRoom).emit("SERVER_MESSAGE_OTHER'S_OPERATION", `${user} has left!`);
        socket.broadcast.to(newRoom).emit("SERVER_MESSAGE_OTHER'S_OPERATION", `${user} has joined!`);
        io.local.emit("UPDATE_ROOMS", rooms);
    });
});
