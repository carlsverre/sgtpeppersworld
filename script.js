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
    lastTime = now;

    window.requestAnimationFrame(loop);

    draw(delta);
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

function drawWave(wave, offsetX) {
    var points = wave.points;

    function o(x) { return x + offsetX; }

    ctx.beginPath();
    ctx.moveTo(o(points[0].x), points[0].y);
    for (var i = 1; i < points.length; ++i) {
        var control = points[i];
        i++;
        var end = points[i];

        ctx.quadraticCurveTo(o(control.x), control.y, o(end.x), end.y);
    }

    var first = points[0];
    var last = points[points.length - 1];
    ctx.lineTo(o(last.x), 10000);
    ctx.lineTo(first.x, 10000);

    ctx.closePath();
    ctx.fillStyle = wave.color;
    ctx.fill();
    ctx.strokeStyle = wave.color;
    ctx.stroke();
}

var overload = 10 * width;
var waves = [
    // farthest to nearest
    makeWave(point(0, height / 2), point(overload, height / 2), 10 * 4, "#003080"),
    makeWave(point(0, height - (height / 3)), point(overload, height - (height / 3)), 10 * 3, "#0050a0"),
    makeWave(point(0, height - (height / 4)), point(overload, height - (height / 4)), 10 * 5, "#00a0f0"),
];

var cameraOffsetX = 0;

function draw(delta) {
    var deltaS = delta / 1000;
    ctx.clearRect(0,0,width,height);

    cameraOffsetX -= deltaS * 20;

    for (var i = 0; i < waves.length; i++) {
        drawWave(waves[i], cameraOffsetX * ((i + 1) * 0.5));
    }
}

setup();
