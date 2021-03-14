

class Canvas {
    constructor(canvasDOM, canvasSideSize, xyLinesCount) {
        this.canvasDOM = canvasDOM;

        this.canvasDOM.width = canvasSideSize;
        this.canvasDOM.height = canvasSideSize;

        this.context = canvasDOM.getContext("2d");
        this.canvasSideSize = canvasSideSize;

        this.cellSize = canvasSideSize / xyLinesCount;

        this.linesCount = xyLinesCount;
    }

    drawPoint(xAbs, yAbs, color) {
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
    return new Canvas(canvas, 1000, 25);
}


function hubSetup(hubConn) {
    hubConn.on("drawPoint", (point) => {
        let desPoint = JSON.parse(point);
        Object.setPrototypeOf(desPoint.color, toRGBAStringMixin);
        canvas.drawPoint(desPoint.x, desPoint.y, desPoint.color);
    });
}




const DEFAULT_FILL_COLOR = new Color(0, 0, 0, 1);

let currentFillColor = DEFAULT_FILL_COLOR;

let hubConn = new signalR.HubConnectionBuilder()
    .withUrl("/draw")
    .build();

hubSetup(hubConn);
hubConn.start();

let canvas = getCanvas("draw-canvas");
let colorPicker = document.getElementById("color-picker");
let colorOpacity = document.getElementById("color-opacity");

canvas.canvasLineUp(canvas, 30, 30);

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

document.getElementById("clear-btn").addEventListener("click", (ev) => {
    canvas.clear();
});


canvas.canvasDOM.onclick = function (event) {
    let bound = canvas.canvasDOM.getBoundingClientRect();

    let x = event.clientX - bound.left - canvas.canvasDOM.clientLeft;
    let y = event.clientY - bound.top - canvas.canvasDOM.clientTop;

    canvas.drawPoint(x, y, currentFillColor);

    hubConn.invoke("AddPoint", JSON.stringify({ x: x, y: y, color: currentFillColor }));
};


