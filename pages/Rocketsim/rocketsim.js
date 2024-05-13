Number.prototype.mod = function (n) { return ((this % n) + n) % n; };
var canvas = document.getElementById("display");
// canvas.style.backgroundColor = "#000";
var ctx = canvas.getContext("2d");
let states = {
    inair: false,
    alive: true,
};

class Rocket {
    /**
     * @param {number} x x position
     * @param {number} y y position
     * @param {number} theta rotation of rocket
     * @param {number} l distance from COM to thruster
     * @param {number} phi angle of thruster
     * @param {number} thrust force of thruster
     * @param {number} basemass mass without fuel
     * @param {number} fuelmass mass of fuel
     */
    constructor (x, y, theta = 0, l = 50, phi, thrust, basemass = 1, fuelmass = 9) {
        /** [Variable] Position of rocket */
        this.pos = { x: x, y: y };
        /** [Variable] Velocity of rocket */
        this.vel = { x: 0, y: 0 };
        /** [Variable] Acceleration of rocket */
        this.acc = { x: 0, y: 0 };
        /** [Variable] Derivatives of angle of rocket  */
        this.angle = {
            theta: theta,
            dtheta: 0,
            ddtheta: 0
        };
        /** [Control] Angle of thruster relative to rocket */
        this.phi = phi;
        /** [Control] Thrust of rocket */
        this.thrust = thrust;
        /** [Param] Length of rocket */
        this.l = l;
        /** [Variable] Mass of rocket */
        this.basemass = basemass;
        /** [Variable] Mass of fuel of rocket */
        this.fuel = fuelmass;
    }
    get mass() {
        return this.fuel + this.basemass;
    }
}

function drawRocket(body) {
    let [x, y, theta, phi, thrust, len] = [
        body.pos.x,
        body.pos.y,
        body.angle.theta,
        body.phi,
        body.thrust,
        body.l
    ];
    let vert = 5;
    const offsetangle = (a, b, da, db, c) => [a + da * Math.sin(c + Math.PI / 2) + db * Math.sin(c), b + da * Math.cos(c + Math.PI / 2) + db * Math.cos(c)];


    let [tx, ty] = offsetangle(x, y, 0, len, theta);

    //fire
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.moveTo(...offsetangle(tx, ty, 0, vert + thrust * 2, phi + theta));
    ctx.lineTo(...offsetangle(tx, ty, 7, vert - 5, phi + theta));
    ctx.lineTo(...offsetangle(tx, ty, -7, vert - 5, phi + theta));
    ctx.fill();
    ctx.fillStyle = "#f00";
    ctx.strokeStyle = "#f00";
    ctx.beginPath();
    ctx.moveTo(...offsetangle(tx, ty, 8, vert - 1, phi + theta));
    ctx.lineTo(...offsetangle(tx, ty, 7, vert + thrust, phi + theta));
    ctx.lineTo(...offsetangle(tx, ty, 0, vert - 5, phi + theta));
    ctx.lineTo(...offsetangle(tx, ty, -7, vert - 1 + thrust, phi + theta));
    ctx.lineTo(...offsetangle(tx, ty, -8, vert - 1, phi + theta));
    ctx.fill();
    ctx.stroke();

    //thruster
    ctx.fillStyle = "#777";
    ctx.beginPath();
    ctx.moveTo(...offsetangle(tx, ty, 0, -10, phi + theta));
    ctx.lineTo(...offsetangle(tx, ty, 10, vert, phi + theta));
    ctx.lineTo(...offsetangle(tx, ty, -10, vert, phi + theta));
    ctx.fill();

    //rocket body
    ctx.fillStyle = "#ddd";
    ctx.beginPath();
    ctx.moveTo(...offsetangle(x, y, -10, -len, theta));
    ctx.lineTo(...offsetangle(x, y, -10, len, theta));
    ctx.lineTo(...offsetangle(x, y, +10, len, theta));
    ctx.lineTo(...offsetangle(x, y, +10, -len, theta));
    ctx.lineTo(...offsetangle(x, y, 0, -len - 10, theta));
    ctx.fill();

    //dot
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#ff0";
    ctx.fill();
    ctx.stroke();
}
//x,y,theta,l,phi,thrust,bm,fm
let rocket = new Rocket(250, 450, 0, 40, 0, 0, 1, 9);
drawRocket(rocket);



let goal = {
    x: 250,
    y: 250,
    score: 0
};
function updategoal() {
    let dist = (rocket.pos.x - goal.x) ** 2 + (rocket.pos.y - goal.y) ** 2;
    ctx.beginPath();
    ctx.arc(goal.x, goal.y, 100 / (goal.score + 10), 0, 2 * Math.PI);
    ctx.fillStyle = `hsl(${460 - dist / 500}, 100%, 50%)`;
    ctx.fill();
    if (dist < (100 / (goal.score + 10)) ** 2 + 10) {
        goal.score++;
        goal.x = Math.random() * 440 + 30;
        goal.y = Math.random() * 360 + 30;
    }
}

function update(dt) {
    if (!states.alive) {
        ctx.strokeStyle = "#0f0";
        ctx.font = "48px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.strokeText("Final Score: " + goal.score, 250, 300);
        ctx.fillStyle = "#f00";
        ctx.textBaseline = "bottom";
        ctx.font = "70px sans-serif";
        ctx.fillText("YOU LOSE", 250, 200);
        clearInterval(interval);
        return 0;
    }
    //bounds
    if (rocket.pos.x < 0) rocket.vel.x = Math.abs(rocket.vel.x * 0.7);
    if (rocket.pos.x > 500) rocket.vel.x = -Math.abs(rocket.vel.x * 0.7);
    if (rocket.pos.y < 0) rocket.vel.y = Math.abs(rocket.vel.y * 0.7);
    if (rocket.pos.y > 500 - rocket.l - 10) {
        if (rocket.vel.y > 10) states.alive = false;
        rocket.pos.y -= 0.1;
        rocket.vel.y = 0;
        rocket.vel.x *= 0.95;
    }
    if (!states.inair && rocket.pos.y < 400) states.inair = true;

    //controller
    if (keys.w) rocket.thrust += 0.25;
    if (keys.s && rocket.thrust > 0) rocket.thrust -= 0.25;

    if (keys.a && keys.d) rocket.phi = (Math.abs(rocket.phi) - 0.01) * rocket.phi / Math.abs(rocket.phi);
    else if (keys.a && rocket.phi > -0.25) rocket.phi = (rocket.phi - 0.01);
    else if (keys.d && rocket.phi < 0.25) rocket.phi = (rocket.phi + 0.01);
    else rocket.phi = (Math.abs(rocket.phi) - 0.01) * rocket.phi / (Math.abs(rocket.phi) + Number.EPSILON);

    //physics engine
    if (rocket.fuel <= 0) { rocket.thrust = 0; rocket.fuel = 0; }
    rocket.fuel -= rocket.thrust / 50000;

    n = {
        angle: {
            theta: rocket.angle.theta + dt * rocket.angle.dtheta,
            dtheta: rocket.angle.dtheta + dt * rocket.angle.ddtheta,
            ddtheta: rocket.thrust * rocket.l * Math.tan(-rocket.phi) / 30000//(Math.random()-0.5)/10
        },
        pos: {
            x: rocket.pos.x + rocket.vel.x * dt + (Math.random() - 0.5) * rocket.thrust / 20,
            y: rocket.pos.y + rocket.vel.y * dt + (Math.random() - 0.5) * rocket.thrust / 20
        },
        vel: {
            x: rocket.vel.x + rocket.acc.x * dt,
            y: rocket.vel.y + rocket.acc.y * dt
        },
        acc: {
            x: -rocket.thrust * Math.sin(rocket.angle.theta + rocket.phi) / rocket.mass,
            y: 1 - rocket.thrust * Math.cos(rocket.angle.theta + rocket.phi) / rocket.mass
        }
    };
    rocket.acc = n.acc;
    rocket.vel = n.vel;
    rocket.pos = n.pos;
    rocket.angle = n.angle;




    document.getElementById("data").innerHTML = `
        Thruster: ${Math.round(0.5*rocket.phi * 180 / Math.PI)*2}° at ${Math.round(rocket.thrust)} N<br>
        Fuel remaining: ${rocket.fuel.toFixed(3)}/9.000 L<br>
        Score: ${goal.score} pts<br>
        Velocity: ${Math.sqrt(rocket.vel.x ** 2 + rocket.vel.y ** 2).toFixed(0)} m/s
    `;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#0f0";
    ctx.strokeRect(20, 20, 460, 400);
    ctx.fillStyle = "#999";
    ctx.fillRect(0, 495, 500, 5);
    drawRocket(rocket);
    updategoal();
}

var keys = {
    w: false,
    s: false,
    a: false,
    d: false
};
window.addEventListener("keydown", (e) => {
    if (e.isComposing || e.keyCode === 229) {
        return;
    }
    let a = true;
    if (e.code === "KeyW") keys.w = a;
    if (e.code === "KeyS") keys.s = a;
    if (e.code === "KeyA") keys.a = a;
    if (e.code === "KeyD") keys.d = a;
});
window.addEventListener("keyup", (e) => {
    if (e.isComposing || e.keyCode === 229) {
        return;
    }
    let a = false;
    if (e.code === "KeyW") keys.w = a;
    if (e.code === "KeyS") keys.s = a;
    if (e.code === "KeyA") keys.a = a;
    if (e.code === "KeyD") keys.d = a;
});
let interval = setInterval(update, 10, 0.1)

