import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

let users = {};

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('userJoin', (username) => {
        users[socket.id] = username;
        socket.broadcast.emit('userJoined', username);
        io.emit('updateUsers', Object.values(users));
        console.log(`${username} joined the chat`);
    });

    socket.on('chatMessage', (message) => {
        io.emit('message', {
            username: users[socket.id],
            text: message,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('typing', () => {
        socket.broadcast.emit('userTyping', users[socket.id]);
    });

    socket.on('stopTyping', () => {
        socket.broadcast.emit('userStoppedTyping');
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            delete users[socket.id];
            socket.broadcast.emit('userLeft', username);
            io.emit('updateUsers', Object.values(users));
            console.log(`${username} left the chat`);
        }
    });
});

// Start server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
