
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


function getCanvas(canvasId, width = 500, height = 500) {
    let canvas = document.getElementById(canvasId);

    canvas.width = width;
    canvas.height = height;

    return {
        canvasDOM: canvas,
        context: canvas.getContext("2d"),
        drawPoint(x, y, color) {
            this.context.fillStyle = color.toRGBAString();
            this.context.fillRect(x, y, 10, 10);
        },
        clear() {
            this.context.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
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

    let x = event.clientX - bound.left //- canvas.clientLeft;
    let y = event.clientY - bound.top //- canvas.clientTop;

    canvas.drawPoint(x, y, currentFillColor);

    hubConn.invoke("AddPoint", JSON.stringify({ x: x, y: y, color: currentFillColor }));
};
