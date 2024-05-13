var canvas = document.getElementById("sandbox");
var ctx = canvas.getContext("2d");
const zoom = 1;
//canvas
const C = { w: canvas.width / zoom, h: canvas.height / zoom };
const toDeg = x => x * 180 / Math.PI;
const toRad = x => x / 180 * Math.PI;
const C2V = (cx, cy) => new vec(cx * V.w / C.w, -cy * V.h / C.h, V.d);

//classes
class vec {
    constructor (x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }
    //v.yaw
    get rxy() {
        let x = Math.atan2(this.y, this.x);
        return x >= 0 ? x : x + 2 * Math.PI;
    }
    set rxy(theta) {
        this.x = this.length * Math.cos(theta);
        this.y = this.length * Math.sin(theta);
    }
    //v.roll
    get rzy() {
        let x = Math.atan2(this.y, this.z);
        return x >= 0 ? x : x + 2 * Math.PI;
    }
    set rzy(theta) {
        this.z = this.length * Math.cos(theta);
        this.y = this.length * Math.sin(theta);
    }
    //magnitude
    get length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }
    //normal
    get norm() {
        return vec.prod(this, 1 / this.length);
    }
    //vector operators
    static add(a, b) {
        return new vec(a.x + b.x, a.y + b.y, a.z + b.z);
    }
    static prod(a, c) {
        return new vec(a.x * c, a.y * c, a.z * c);
    }
    static dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
}
class sphere {
    constructor (pos, r, clr, shiny) {
        this.pos = pos;
        this.r = r || 1;
        this.color = clr || [1, 1, 1];
        this.specular = shiny || -1;
    }
}
class light {
    constructor (type, i, v = new vec(0, 0, 0)) {
        this.type = type || "ambient";
        this.i = i || 0;
        this.vec = v;
    }
}
// draw
function set(x, y, rgb = [0, 0, 0]) {
    // console.log(rgb)
    rgb = rgb.map(e => e * 0xFF);
    ctx.fillStyle = `rgb(${rgb.toString()})`;
    ctx.fillRect((x + C.w / 2 - 0.5) * zoom, (y + C.w / 2 - 0.5) * zoom, zoom, zoom);
}
function clear() {
    ctx.clearRect(0, 0, C.w, C.h);
}


//World
let V = { w: 1, h: 1, d: 1 };
let O = new vec(0, 0, 0);

let p = [0, -0.8, 3];
let sun = new vec(1, 1, -1);

let scene = {
    background: [0.4, 0.4, 0.4],
    spheres: [
        new sphere(new vec(2, 0, 7), 1, [0, 1, 0], 300),
        new sphere(new vec(-1.5, -1, 3), 1, [0.7, 0, 0.7], 10),
        new sphere(new vec(0, 0, 9.7), 0.8, [1, 0, 0], 800),
        new sphere(new vec(-0.7, -1, 11), 2.1, [0.9, 0.9, 0.9], -1),
        new sphere(new vec(...p), 0.1, [10, 10, 7], -1),
        new sphere(new vec(0, -10000, 0), 9999, [1, 0.5, 0], 100),
        // new sphere(sun, 2, [100, 100, 0.9])
    ],
    lights: [
        new light("ambient", 0.1),
        new light("point", 0.7, new vec(...p)),
        new light("directional", 0.5, sun)
    ]
};
//ray tracing
function ClosestIntersection(O, D, t_min, t_max, type = 'default') {
    closest_t = Infinity;
    closest_sphere = null;
    for (sphere of scene.spheres) {
        if (type == 'shadow' && sphere.r == 0.1) continue;
        let [t1, t2] = IntersectRaySphere(O, D, sphere);
        if (t_min < t1 && t1 < t_max && t1 < closest_t) {
            closest_t = t1;
            closest_sphere = sphere;
        }
        if (t_min < t2 && t2 < t_max && t2 < closest_t) {
            closest_t = t2;
            closest_sphere = sphere;
        }
    }
    return [closest_sphere, closest_t];
}
function trace(O, D, t_min, t_max, debug = false) {
    let [closest_sphere, closest_t] = ClosestIntersection(O, D, t_min, t_max);
    // console.log([closest_sphere, closest_t])
    if (closest_sphere == null) {
        return scene.background;
    }
    let P = vec.add(O, vec.prod(D, closest_t));
    let N = vec.add(P, vec.prod(closest_sphere.pos, -1)).norm;
    return closest_sphere.color.map(e => e * ComputeLighting(P, N, vec.prod(D, -1), closest_sphere.specular));//.map(e=>(1-(closest_t/10))*10*e)
}
function IntersectRaySphere(O, D, sphere) {
    // console.warn(O,D,sphere)
    let r = sphere.r;
    let CO = vec.add(O, vec.prod(sphere.pos, -1));

    let a = vec.dot(D, D);
    let b = 2 * vec.dot(CO, D);
    let c = vec.dot(CO, CO) - r * r;

    let discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
        return [Infinity, Infinity];
    }
    t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    // console.log(t1,t2,b,discriminant,a)
    return [t1, t2];
}
function ComputeLighting(P, N, V, s) {
    let i = 0.0;
    for (light of scene.lights) {
        if (light.type == "ambient") {
            i += light.i;
        } else {
            let L;
            if (light.type == "point") {
                L = vec.add(light.vec, vec.prod(P, -1));
                t_max = 1;
            } else {
                L = light.vec;
                t_max = Infinity;
            }
            //shad
            [shadow_sphere, shadow_t] = ClosestIntersection(P, L, 0.01, t_max, 'shadow');
            if (shadow_sphere != null) {
                continue;
            }
            //diff
            let n_dot_l = vec.dot(N, L);
            if (n_dot_l > 0) {
                i += light.i * n_dot_l / ((N).length * (L).length);
            }
            //spec
            if (s != -1) {
                let R = vec.add(vec.prod(N, 2 * vec.dot(N, L)), vec.prod(L, -1));
                let r_dot_v = vec.dot(R, V);
                // console.log(R,V)
                if (r_dot_v > 0) {
                    // console.log('spec')
                    i += light.i * Math.pow(r_dot_v / (R.length * V.length), s);
                }
            }
        }
    }
    // console.log(i)
    return i;
}
//test render
// console.log(C)
function draw(a) {
    console.info(`Frame (${a})`);
    clear();
    for (x = -C.w / 2; x <= C.w / 2; x++) {
        for (y = -C.h / 2; y <= C.h / 2; y++) {
            //set(i,j,[((i*j)/10)%1,((i+j)/10)%1,(i/j*10)%1])
            let D = C2V(x, y);
            let color = trace(O, D, 1, Infinity, false);
            // console.log(x,y,D,color)
            set(x, y, color);//[Math.random()**10,a,Math.random()**10])
            a--;
        }
    }
}
let t = 0;
draw(0);
let interval=setInterval(function(){
	draw(t)
	t++
	// sun.rzy+=0.01
    // sun.rxy+=0.01
    // scene.spheres[]
    // scene.spheres[0].pos.x++
	scene.spheres[2].pos.z=9.7-Math.sin(t/5)
    scene.spheres[2].pos.x=1-Math.cos(t/5)
	// console.log(scene.spheres[2].specular)
},1000)
console.info('Terminated without error');