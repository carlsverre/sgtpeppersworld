var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var width = window.innerWidth;
var height = window.innerHeight;

function setup() {
    window.addEventListener("resize", function() {
        canvas.width = width = window.innerWidth;
        canvas.height = height = window.innerHeight;
    });
    canvas.width = width;
    canvas.height = height;

    loop();
}

var lastTime = Date.now();
function loop() {
    var now = Date.now();
    var delta = now - lastTime;
    draw(lastTime, now, delta);
    lastTime = now;

    window.requestAnimationFrame(loop);

}

function point(x, y) { return { x: x, y: y }; }

function makeWave(start, end, numSegments, color) {
    var dist = (end.x - start.x) / numSegments;
    var numPoints = (numSegments * 2) - 1;

    var wave = [];
    wave.push(point(start.x, start.y));
    var flipflop = 1;
    for (var i = 1; i < numPoints; ++i) {
        flipflop *= -1;

        // control point offset
        var offset = (Math.random() * 150) * flipflop;

        // add the control point
        wave.push(point(start.x + (((i-1) * dist) + (dist / 2)), start.y + offset));

        // point offset
        offset = (Math.random() * 150) * flipflop;

        // add the segment end
        wave.push(point(start.x + (i * dist), start.y + offset));
    }

    return {
        points: wave,
        color: color,
    };
}

function drawWave(wave, offsetX, offsetY) {
    var points = wave.points;

    function o(x) { return x + offsetX; }
    function oy(y) { return y + offsetY; }

    ctx.beginPath();
    ctx.moveTo(o(points[0].x), oy(points[0].y));
    for (var i = 1; i < points.length; ++i) {
        var control = points[i];
        i++;
        var end = points[i];

        ctx.quadraticCurveTo(o(control.x), oy(control.y), o(end.x), oy(end.y));
    }

    var first = points[0];
    var last = points[points.length - 1];
    ctx.lineTo(o(last.x), 10000);
    ctx.lineTo(o(first.x), 10000);

    ctx.closePath();
    ctx.fillStyle = wave.color;
    ctx.fill();
    ctx.strokeStyle = wave.color;
    ctx.stroke();
}

function makeRandomColor() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + ", " + g + ", " + b + ")";
}

function makeBg() {
    var n = 200;
    var w = width / n;
    var cells = [];
    for (var i = 0; i < n; ++i) {

        cells.push({
            x: i * w,
            y: 0,
            w: w,
            h: height,
            c: makeRandomColor(),
        });
    }
    return cells;
}

function drawBg(cells) {
    for (var i = 0; i < cells.length; ++i) {
        var c = cells[i];
        ctx.fillStyle = c.c;
        ctx.fillRect(c.x,c.y,c.w,c.h);
    }
}

var overload = 10 * width;
var waves = [
    // farthest to nearest
    makeWave(point(0, height / 2), point(overload, height / 2), 10 * 4, "#003080"),
    makeWave(point(0, height - (height / 3)), point(overload, height - (height / 3)), 10 * 3, "#0050a0"),
    makeWave(point(0, height - (height / 4)), point(overload, height - (height / 4)), 10 * 5, "#00a0f0"),
];

var cameraOffsetX = 0;
var cameraOffsetY = 0;
var cameraOffsetYDirection = -1;
var bg = makeBg();

function makeFish(offsetX) {
    return {
        x: (width * Math.random()) + 200 + (-1 * offsetX),
        y: height - (height / 4),
        color: makeRandomColor(),
        d: -1,
        r: Math.random() * 100,
        l: Math.floor(Math.random() * waves.length),
    }
}

function drawFish(f, offset, offsetY) {
    ctx.beginPath();
    ctx.arc(f.x + offset, f.y + offsetY, f.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = f.color;
    ctx.fill();
}

var fade = 0;

var fish = [];
function draw(time, lastTime, delta) {
    var deltaS = delta / 1000;
    ctx.clearRect(0,0,width,height);

    if (Math.floor(time / 1000) !== Math.floor(lastTime / 1000)) {
        cameraOffsetYDirection *= -1;
    }

    cameraOffsetX -= deltaS * 40;
    cameraOffsetY -= cameraOffsetYDirection * (deltaS * 20);

    if (Math.floor(time / 200) !== Math.floor(lastTime / 200)) {
        bg = makeBg();
    }
    drawBg(bg);

    if (Math.floor(time / 200) !== Math.floor(lastTime / 200)) {
        fish.push(makeFish(cameraOffsetX));
    }

    for (var j = fish.length - 1; j > 0; j--) {
        var f = fish[j];
        f.d = (Math.random() > 0.9) ? (f.d * -1) : f.d;
        f.x += f.d * deltaS * 100;
        f.y -= deltaS * 100;

        if (f.y < -100) { fish.splice(j, 1); }
    }

    for (var i = 0; i < waves.length; i++) {
        var offset = cameraOffsetX * ((i + 1) * 0.5);
        var offsetY = cameraOffsetY * ((i + 1) * 0.5);

        for (var f = 0; f < fish.length; f++) {
            if (fish[f].l === i) {
                drawFish(fish[f], offset, offsetY);
            }
        }

        drawWave(waves[i], offset, offsetY);
    }

    if (fade < 1) {
        fade += deltaS / 1.5;
        ctx.fillStyle = "rgba(123,42,231," + (1 - fade) + ")";
        ctx.fillRect(0,0,width,height);
    }

}

setup();
