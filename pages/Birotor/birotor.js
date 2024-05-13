Number.prototype.mod = function (n) { return ((this % n) + n) % n; };
function addvector(...v) {
    let sum = v[0]
    for (i = 1; i < v.length; i++) {
        sum = sum.map((e, j) => e + v[i][j]);
    }
    return sum
}
var canvas = document.getElementById("display");
// canvas.style.backgroundColor = "#000";
var ctx = canvas.getContext("2d");
let [width, height] = [canvas.width, canvas.height];
var [tx, ty] = [300, 150]

var config = {
    pos: {
        x: width / 2,
        y: 1 * height / 2,
    },
    vel: {
        x: 0,
        y: 0
    },
    angle: {
        theta: 0,
        dtheta: 0
    },
    mass: 0.03,
    length: 30,
    thrust: {
        l: 0,
        r: 0
    }
}

function draw() {
    ctx.clearRect(0, 0, width, height);
    let rotate = (x, y, ox, oy) => [x + ox * Math.cos(config.angle.theta) - oy * Math.sin(config.angle.theta), y + ox * Math.sin(config.angle.theta) + oy * Math.cos(config.angle.theta)];

    //target lines
    ctx.beginPath();
    ctx.strokeStyle = "#f00";
    let targety = ty//height-document.getElementsByName("targety")[0].value;
    ctx.moveTo(0, targety);
    ctx.lineTo(width, targety);
    ctx.stroke();
    ctx.beginPath();
    let targetx = tx//document.getElementsByName("targetx")[0].value;
    ctx.moveTo(targetx, 0);
    ctx.lineTo(targetx, height);
    ctx.stroke();

    //body
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(...rotate(config.pos.x, config.pos.y, 5, 0));
    ctx.lineTo(...rotate(config.pos.x, config.pos.y, 0, -10));
    ctx.lineTo(...rotate(config.pos.x, config.pos.y, -5, 0));
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(...rotate(config.pos.x, config.pos.y, config.length, 0));
    ctx.lineTo(...rotate(config.pos.x, config.pos.y, -config.length, 0));
    ctx.stroke();

    let tf = 10
    //left rotor
    let lrf = Math.sqrt((Math.sqrt(config.thrust.l) * tf) ** 2 + config.length ** 2);
    let ltf = -Math.atan2(Math.sqrt(config.thrust.l) * tf, config.length);
    ctx.strokeStyle = "#00f";
    ctx.beginPath();
    ctx.moveTo(config.pos.x - config.length * Math.cos(config.angle.theta), config.pos.y - config.length * Math.sin(config.angle.theta));
    ctx.lineTo(config.pos.x - lrf * Math.cos(ltf + config.angle.theta), config.pos.y - lrf * Math.sin(ltf + config.angle.theta));
    ctx.stroke();
    //right rotor
    let rrf = Math.sqrt((Math.sqrt(config.thrust.r) * tf) ** 2 + config.length ** 2);
    let rtf = +Math.atan2(Math.sqrt(config.thrust.r) * tf, config.length);
    ctx.strokeStyle = "#00f";
    ctx.beginPath();
    ctx.moveTo(config.pos.x + config.length * Math.cos(config.angle.theta), config.pos.y + config.length * Math.sin(config.angle.theta));
    ctx.lineTo(config.pos.x + rrf * Math.cos(rtf + config.angle.theta), config.pos.y + rrf * Math.sin(rtf + config.angle.theta));
    ctx.stroke();

}


var integral = 0

function update(dt) {
    if (config.pos.y >= height) {
        config.pos.y -= 0.1;
        config.vel.y = -Math.abs(config.vel.y * 0.3);
        // config.angle.dtheta = -config.angle.dtheta * 0.5;
    }
    if (config.pos.x <= 0) config.vel.x = Math.abs(config.vel.x * 0.5);
    if (config.pos.x >= width) config.vel.x = -Math.abs(config.vel.x * 0.5);

    tx+=2*(keys.right-keys.left);
    ty+=2*(keys.down-keys.up);
    tx = Math.min(width, Math.max(0, tx));
    ty = Math.min(height, Math.max(0, ty));
    let targety = ty//height-document.getElementsByName("targety")[0].value;
    let targetx = tx//document.getElementsByName("targetx")[0].value;
    let targettheta = Math.min(1, Math.max(-1, (targetx - config.pos.x) * 0.003 - 0.009 * config.vel.x))
    function T_angle(a) {
        let delta = Math.min(a - targettheta, 2 * Math.PI - a + targettheta) * Math.sign(a - Math.PI);
        return [
            delta * 1.1,
            -delta * 1.1
        ]
    }
    function T_dangle(a) {
        return [
            -a * 1.5,
            a * 1.5
        ]
    }

    function T_y(y) {
        integral += (y - targety) * dt
        return [
            0.01 * (y - targety) + 0.002 * integral,//+(98/2*config.mass),
            0.01 * (y - targety) + 0.002 * integral//+(98/2*config.mass)
        ];//set Fnet=>0
    }
    function T_dy(dy) {
        return [0.01 * dy, 0.01 * dy];
    }
    if (document.getElementsByName("precalc")[0].checked) {
        integral = (98 / 2 * config.mass / 0.002)
    }
    document.getElementById("integral").innerHTML = `${(integral/(98 / 2 * config.mass / 0.002)*100).toFixed(2)}%`;
    let assist = document.getElementsByName("assist")[0].checked;
    // let assist=true
    auto = addvector(
        T_angle(config.angle.theta),
        T_dangle(config.angle.dtheta),
        T_y(config.pos.y),
        T_dy(config.vel.y)
    )

    config.thrust = {
        l: auto[0] * assist,
        r: auto[1] * assist
    }
    config.thrust.l = Math.min(10, Math.max(0, config.thrust.l)) + (keys.a ? pwr : 0) + (keys.s ? pwr : 0);
    config.thrust.r = Math.min(10, Math.max(0, config.thrust.r)) + (keys.d ? pwr : 0) + (keys.s ? pwr : 0);
    // config.thrust.l = 2*(Math.random()<config.thrust.l/2?1:0)
    // config.thrust.r = 2*(Math.random()<config.thrust.r/2?1:0)

    let F = [
        (config.thrust.l + config.thrust.r) * Math.sin(config.angle.theta) - config.mass * 0.1 * config.vel.x,
        config.mass * 98 - config.mass * 0.1 * config.vel.y - (config.thrust.l + config.thrust.r) * Math.cos(config.angle.theta),
        config.length * (config.thrust.l - config.thrust.r)
    ]

    let step = {
        pos: {
            x: config.pos.x + dt * config.vel.x + 0.5 * dt * dt * F[0] / config.mass,
            y: config.pos.y + dt * config.vel.y + 0.5 * dt * dt * F[1] / config.mass
        },
        vel: {
            x: config.vel.x + dt * F[0] / config.mass,
            y: config.vel.y + dt * F[1] / config.mass
        },
        angle: {
            theta: (config.angle.theta + dt * config.angle.dtheta).mod(2 * Math.PI),
            dtheta: config.angle.dtheta + dt * F[2] / (config.mass * config.length ** 2)
        },
    }
    config.vel = step.vel;
    config.angle = step.angle;
    config.pos = step.pos;
}

var pwr = 5
var keys = {
    a: false,
    d: false,
    s: false,
    up: false,
    down: false,
    left: false,
    right: false
};
canvas.addEventListener('mousemove', e => {
    tx = e.offsetX;
    ty = e.offsetY;
});
window.addEventListener("keydown", (e) => {
    if (e.isComposing || e.keyCode === 229) return;
    if (e.code == "KeyW") document.getElementsByName("assist")[0].checked = !document.getElementsByName("assist")[0].checked;
    if (e.code == "KeyE") document.getElementsByName("precalc")[0].checked = !document.getElementsByName("precalc")[0].checked;
    if (e.key <= "9" && e.key >= "0") pwr = parseInt(e.key) + 1;

    if (e.code == "ArrowUp") keys.up = true;
    if (e.code == "ArrowDown") keys.down = true;
    if (e.code == "ArrowLeft") keys.left = true;
    if (e.code == "ArrowRight") keys.right = true;

    if (e.code == "Space") {
        config.pos = {
            x: width / 2,
            y: height / 2,
        };
        config.vel = {
            x: 0,
            y: 0
        };
        config.angle = {
            theta: 0,
            dtheta: 0
        };
        config.thrust = {
            l: 0,
            r: 0
        };
    }

    if (e.code == "KeyS") keys.s = true;
    if (e.code == "KeyA") keys.a = true;
    if (e.code == "KeyD") keys.d = true;
});
window.addEventListener("keyup", (e) => {
    if (e.isComposing || e.keyCode === 229) return;

    if (e.code == "ArrowUp") keys.up = false;
    if (e.code == "ArrowDown") keys.down = false;
    if (e.code == "ArrowLeft") keys.left = false;
    if (e.code == "ArrowRight") keys.right = false;

    if (e.code == "KeyS") keys.s = false;
    if (e.code == "KeyA") keys.a = false;
    if (e.code == "KeyD") keys.d = false;
});

let fps = 60;
setInterval(() => {
    update(1 / fps);
    draw();
}, 1000 / fps);
