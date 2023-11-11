const box = document.getElementById("box");
const countEl = document.getElementById("count");
const message = document.querySelector("input");
const form = document.getElementById("form");
let ws, loading;

const addmsg = (data) => {
    const newNode = document.createElement("p");
    newNode.textContent = data;
    box.appendChild(newNode);
    box.scrollTop = box.scrollHeight;
    // console.log(data);
}

const updateLiveCoount = (count) => {
    countEl.textContent = count;
    // console.log(count);
}

form.onsubmit = (e) => {
    e.preventDefault();
    const data = message.value;
    message.value = "";
    if(ws) {
        loading = document.createElement("p");
        loading.textContent = "Sending...";
        box.appendChild(loading);
        ws.send(data);
    } else {
        addmsg("not connected to websocket!");
    }
}

function init() {
    if(ws) {
        ws.onmessage = ws.onopen = ws.onerror = null;
        ws.close()
    }
    ws = new WebSocket("ws://"+document.location.host);
    ws.onopen = () => {
        console.log("connection open");
    }
    ws.onmessage = ({data}) => {
        // console.log(data);
        if(loading) {
            loading.remove();
        }
        const [key, val] = JSON.parse(data);
        switch (key) {
            case 0:
                addmsg(val);
                break;
            case 1:
                updateLiveCoount(val);
                break;
            default:
                console.log("invalid data", [key, val]);
                break;
        }
    }
    ws.onclose = () => {
        ws = null;
    }
}

init();

(async() => {
    const res = await fetch(document.location.origin+"/chats");
    const chats = await res.json();
    chats?.forEach(addmsg);
})();