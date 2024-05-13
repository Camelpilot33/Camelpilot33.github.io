class Cell {
    constructor(state = "air") {
        this.state = state
        this.color = [1, 0, 1]
        switch (state) {
            case "air":
                this.color = [0.996, 0.98, 0.965]
                break
            case "rock":
                let offset = Math.random() / 10 
                this.color = [0.5, 0.5, 0.5].map(e => e - offset)
                break
            case "sand":
                // console.log(document.getElementById("sandcolor").value)
                this.color = document.getElementById("sandcolor").value.slice(1,7).match(/.{1,2}/g).map(e=>parseInt(e,16)/255).map(e => e + Math.random() / 10 - 0.1)
                break
        }
    }
    attempt(ox, oy, x, y) {
        if (x < 0 || x > canvas.width / zoom - 1 || y < 0 || y > canvas.height / zoom - 1) return false
        if (world[x][y].state == "air") {
            world[x][y] = this
            world[ox][oy] = new Cell("air")
            return true
        }
        return false
    }
}
function update() {//q
    for (y = 0; y <= canvas.height / zoom - 1; y++) for (x = 0; x <= canvas.width / zoom - 1; x++) {
        if (world[x][y].state == "sand") {
            let lr = 1//Math.random() > 0.5 ? 1 : -1
            if (!world[x][y].attempt(x, y, x, y - 1))
            if (!world[x][y].attempt(x, y, x - lr, y - 1))
            if (!world[x][y].attempt(x, y, x + lr, y - 1)) { }
            /* gel like substance
            if (!world[x][y].attempt(x, y, x, y - 1))
            if (!world[x][y].attempt(x, y, x - 1, y - lr))
            if (!world[x][y].attempt(x, y, x + 1, y - lr)) { }
             */
        }
    }
    draw()
}


//INIT
var mspf = 1000 / 60
let world = new Array(canvas.width / zoom)
    .fill(0).map(e => new Array(canvas.height / zoom)
        .fill(0).map(w => new Cell("air")))
setInterval(update, mspf)