﻿class Canvas {
    #pointSet;

    constructor(canvasDOM, canvasSideSize, xyLinesCount) {
        this.canvasDOM = canvasDOM;

        this.canvasDOM.width = canvasSideSize;
        this.canvasDOM.height = canvasSideSize;

        this.context = canvasDOM.getContext("2d");
        this.canvasSideSize = canvasSideSize;

        this.cellSize = canvasSideSize / xyLinesCount;

        this.linesCount = xyLinesCount;

        this.#pointSet = new Set();
    }

    #drawPoint(point) {
        let xAbs = point.x, yAbs = point.y, color = point.color;

        this.context.fillStyle = color.toRGBAString();

        let canvasXPos = Math.trunc((xAbs * this.canvasDOM.width / this.canvasDOM.clientWidth) / this.cellSize);
        let canvasYPos = Math.trunc((yAbs * this.canvasDOM.height / this.canvasDOM.clientHeight) / this.cellSize);


        this.context.fillRect(
            canvasXPos * this.cellSize,
            canvasYPos * this.cellSize,
            this.cellSize,
            this.cellSize
        );

    }

    // #drawAllPoints(points) {
    //     points.forEach((p) => {
    //         this.drawPoint(p);
    //     });
    // }

    addManyPoints(points) {
        points.forEach((p) => {
            if (!this.#pointSet.has(p)) {
                this.#pointSet.add(p);
                this.#drawPoint(p);
            }
        });
    }

    addPoint(point) {
        if (!this.#pointSet.has(point)) {
            this.#pointSet.add(point);
            this.#drawPoint(point);
        }

    }

    canvasLineUp() {
        let step = this.canvasSideSize / this.linesCount;

        for (let x = 0; x < this.canvasSideSize; x += step) {
            this.context.beginPath();
            this.context.moveTo(x, 0);
            this.context.lineTo(x, this.canvasSideSize);
            this.context.stroke();
        }
        for (let y = 0; y < this.canvasSideSize; y += step) {
            this.context.beginPath();
            this.context.moveTo(0, y);
            this.context.lineTo(this.canvasSideSize, y);
            this.context.stroke();
        }
    }

    clear() {
        this.context.clearRect(0, 0, this.canvasDOM.width, this.canvasDOM.height);
        this.canvasLineUp();
    }
}

function Color(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;

    Object.setPrototypeOf(this, toRGBAStringMixin)
}

let toRGBAStringMixin = {
    toRGBAString() {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }
};


function getCanvas(canvasId, cellSize = 1000) {
    let canvas = document.getElementById(canvasId);
    return new Canvas(canvas, cellSize, 25);
}


function hubSetup(hubConn) {
    hubConn.on("updateClient", (point) => {
        let desPoint = JSON.parse(point);
        Object.setPrototypeOf(desPoint.color, toRGBAStringMixin);
        canvas.addPoint(desPoint);
    });

    hubConn.on("clearDrawer", (p) => {
        canvas.clear();
    });

    hubConn.on("onUserLeavesRoom", (userId) => {
        let nodes = Array.from(listDOM.childNodes);
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].innerText == userId) {
                listDOM.removeChild(nodes[i]);
                break;
            }
        }
    });

    hubConn.on("onUserConnectToRoom", (userId) => {
        appendChildTagDOM(listDOM, "li", userId);
    });
}

function appendChildTagDOM(parent, tag, childContent) {
    let tagDOM = document.createElement(tag);
    tagDOM.innerHTML = childContent;

    parent.appendChild(tagDOM);
}

function updateConnectedUsers(listDOM, usersList) {
    listDOM.innerHTML = "";

    usersList.forEach(el => {
        appendChildTagDOM(listDOM, "li", el);
    });
}

function setAllObjectPrototypes(objArr, prot, fieldName) {
    objArr.forEach((o) => {
        Object.setPrototypeOf(o[fieldName], prot);
    });
}

async function connectToRoom(roomId, onSuccessConnection) {
    if (roomId == null) return;

    let res = await hubConn.invoke("ConnectToRoom", roomId);

    if (res != null) {
        updateRoomId(roomId);
        onSuccessConnection(JSON.parse(res));
    } else {
        throw new Error("Cannot connect to room");
    }
}

function onToRoomConnected(data) {
    setAllObjectPrototypes(data.fieldState, toRGBAStringMixin, "color");
    updateConnectedUsers(connectedUsers, data.connectedUsers);
    canvas.addManyPoints(data.fieldState);
}

function updateRoomId(newId) {
    currentRoomIdDOM.value = newId;
    currentRoomId = newId;
}


const DEFAULT_FILL_COLOR = new Color(0, 0, 0, 1);

let currentFillColor = DEFAULT_FILL_COLOR;

let hubConn = new signalR.HubConnectionBuilder()
    .withUrl("/draw")
    .build();

hubSetup(hubConn);


let canvas = getCanvas("draw-canvas");
let colorPicker = document.getElementById("color-picker");
let colorOpacity = document.getElementById("color-opacity");

let connectionId = document.getElementById("connection-id");
let connectionWrapper = document.getElementById("connection-id-wrapper");
let connectedUsers = document.getElementById("connected-users");

let currentRoomIdDOM = document.getElementById("current-room-id");

var currentRoomId = currentRoomIdDOM.value == "null" ? null : currentRoomIdDOM.value;


canvas.canvasLineUp(canvas, 30, 30);

hubConn.start().then(() => {
    connectToRoom(currentRoomId, onToRoomConnected).catch((r) => {
        currentRoomId = null;
        alert("CANNOT CONNECT TO ROOM");
    });
})

colorPicker.addEventListener("change", (ev) => {
    let color = colorPicker.value;
    currentFillColor = new Color(
        parseInt(color.slice(-6, -4), 16),
        parseInt(color.slice(-4, -2), 16),
        parseInt(color.slice(-2), 16),
        parseInt(colorOpacity.value)
    );
});

colorOpacity.addEventListener("change", (ev) => {
    currentFillColor.a = parseFloat(colorOpacity.value);
});

document.getElementById("clear-btn").addEventListener("click", async (ev) => {
    await hubConn.invoke("ClearDrawer", currentRoomId);

    canvas.clear();
});

document.getElementById("create-room-btn").addEventListener("click", async (ev) => {
    let id = await hubConn.invoke("CreateRoom", "msg");
    connectionWrapper.style = "visibility: unset";

    connectionId.innerText = id;
    updateRoomId(id);
});

document.getElementById("connect-room-btn").addEventListener("click", async (ev) => {
    let id = prompt("Enter room id, please");

    await connectToRoom(id, onToRoomConnected);

    console.log(res);
});


canvas.canvasDOM.onclick = function (event) {
    if (currentRoomId == null) {
        alert("Firstly, create a room or connect to existing one");
        return;
    }

    let bound = canvas.canvasDOM.getBoundingClientRect();

    let x = event.clientX - bound.left - canvas.canvasDOM.clientLeft;
    let y = event.clientY - bound.top - canvas.canvasDOM.clientTop;

    let p = { x: x, y: y, color: currentFillColor };

    canvas.addPoint(p);

    hubConn.invoke("UpdateClients", currentRoomId, JSON.stringify(p));
};


