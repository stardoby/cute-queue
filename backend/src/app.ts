import * as dotenv from "dotenv"
if (process.env.NODE_ENV !== 'production') {
    // Load in environment variables in development mode
    dotenv.config({ path: ".env.local" });
}

import { Server } from "socket.io";
import { json } from 'body-parser';
import express from 'express';
import cors from 'cors';
import http from 'http';

import coursesHandler from "./handlers/courses";
import socketHandler from "./handlers/sockets";

import type { ClientToServerEvents, ServerToClientEvents,  ServerToServerEvents, SocketData } from "./types";
import { socketMiddleware } from "./middleware/requireSocket";

const app = express();
const server = http.createServer(app);
const port = 3001;

const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    ServerToServerEvents,
    SocketData
>(server, {
    cors: {
        origin: [ "http://localhost:3000", "https://cutequeue.com"],
        maxAge: 24 * 60 * 60 // 24 hours
    }
});
io.on("connection", socketHandler);

app.use(cors({
    origin: ["http://localhost:3000", "https://cutequeue.com"],
    maxAge: 24 * 60 * 60 // 24 hours
}));

app.use(json());
app.use(socketMiddleware(io));

// Status check route
app.get('/ping', (_, res) => {
    res.send('pong');
});

app.use('/courses', coursesHandler);

server.listen(port, () => {
    console.log(`Ready to listen on port ${port}`);
});
