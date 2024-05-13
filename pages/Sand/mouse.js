function gaussianRandom(mean = 0, stdev = 0.1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}
function getCursorPosition(c, event) {
    const rect = c.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    type = document.getElementById("type").value;
    // console.log(Math.floor(x / zoom), Math.floor((canvas.height - y) / zoom))
    let [ax, ay] = [Math.floor(x / zoom), Math.floor((canvas.height - y) / zoom)];
    world[ax][ay] = new Cell(type);
    let stdev = document.getElementById("stdev").value / 10;
    let dense = Number(document.getElementById("dense").value);
    if (stdev != 0.1) for (i = 0; i < dense; i++) {
        rx = (ax + Math.floor(gaussianRandom(0, stdev) * 5));
        ry = (ay + Math.floor(gaussianRandom(0, stdev) * 5));
        if (rx < 0 || ry < 0 || rx > canvas.width / zoom - 1 || ry > canvas.height / zoom - 1) continue;
        world[rx][ry] = new Cell(type);
    }
}
function clickdelay() {
    var interval = setInterval(function () {
        if (!holding) clearInterval(interval);
        getCursorPosition(canvas, mousePosition);
    }, 0);
}
var holding, mousePosition = [0, 0];
canvas.addEventListener('mousedown', function () { holding = true; clickdelay(); });
canvas.addEventListener('mouseup', function () { holding = false; clickdelay(); });
canvas.addEventListener('mouseleave', function () { holding = false; });
canvas.addEventListener('mousemove', function (e) { mousePosition = e; });
