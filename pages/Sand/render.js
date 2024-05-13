var canvas = document.getElementById("sandbox")
var ctx = canvas.getContext("2d")
const zoom = 4
function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}
function set(x, y, rgb = [0, 0, 0]) {
    // console.log(rgb)
    rgb = rgb.map(e => e * 0xFF)
    ctx.fillStyle = `rgb(${rgb.toString()})`
    ctx.fillRect(x * zoom, y * zoom, zoom, zoom)
}
modified = new Set()
function draw() {
    clear()
    for (x = 0; x <= canvas.width / zoom - 1; x++) for (y = 0; y <= canvas.height / zoom - 1; y++) {
        set(x, canvas.height / zoom - y - 1, world[x][y].color)
    }
}