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
    });
});

// io.on('connection', (socket) => {
//     socket.on('SEND_MESSAGE', function(data){
//         io.emit('RECEIVE_MESSAGE', data);
//     })
//     socket.on('ROOM_CHANGE', (data) => {
//         // console.log(data);
//         io.emit("ROOM_CHANGE_RECEIVE", data);
//     })
// });