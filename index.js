const http = require("http");
const ws = require("ws");
const express = require("express");
const app = express();
const server = http.createServer(app);
const wss = new ws.Server({server});

const chats = [];
let count = 0;

/**
 * @param {0 | 1} key 
 * @param {string} val 
 */
function sendAll(key, val) {
    wss.clients.forEach((client) => {
        if(client.readyState === 1) {
            client.send(`[${key},"${val}"]`);
        }
    });
}

wss.on("connection", (socket) => {
    count++;

    socket.on("message", (data) => {
        const message = data.toString();
        sendAll(0, message);

        if(chats.length >= 50) {
            chats.shift();
        }

        chats.push(message);
    });

    socket.on("close", () => {
        count--;
        sendAll(1, count);
    })

    sendAll(1, count);
})

app.get("/chats", (req, res) => {
    res.json(chats);
})

app.use(express.static(__dirname+"/client"));

app.all("*", (req, res) => {
    res.sendStatus(404);
})

server.listen(80, ()=>{
    console.log("app live at: http://localhost:80\nLet's Chat 😎");
})