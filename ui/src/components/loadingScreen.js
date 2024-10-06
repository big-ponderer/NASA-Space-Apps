export default function loadingScreen(p) {
    const numStars = 500;
    let stars = [];

    p.inSystemView = () => false;

    p.setup = () => {
        p.createCanvas(600, 600);
        p.stroke(255);
        p.strokeWeight(2);

        for (let i = 0; i < numStars; i++) {
            stars.push(new Star(p.random(p.width), p.random(p.height)));
        }
    }

    p.draw = () => {
        p.background(0, 50);

        const acc = 0.1

        stars = stars.filter(star => {
            star.draw();
            star.update(acc);
            return star.isActive();
        });

        while (stars.length < numStars) {
            stars.push(new Star(p.random(p.width), p.random(p.height)));
        }
    }

    class Star {
        constructor(x, y) {
            this.pos = p.createVector(x, y);
            this.prevPos = p.createVector(x, y);

            this.vel = p.createVector(0, 0);

            this.ang = p.atan2(y - (p.height / 2), x - (p.width / 2));
        }

        isActive() {
            return onScreen(this.prevPos.x, this.prevPos.y);
        }

        update(acc) {
            this.vel.x += p.cos(this.ang) * acc;
            this.vel.y += p.sin(this.ang) * acc;

            this.prevPos.x = this.pos.x;
            this.prevPos.y = this.pos.y;

            this.pos.x += this.vel.x;
            this.pos.y += this.vel.y;
        }

        draw() {
            const alpha = p.map(this.vel.mag(), 0, 3, 0, 255);
            p.stroke(255, alpha);
            p.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        }
    }

    function onScreen(x, y) {
        return x >= 0 && x <= p.width && y >= 0 && y <= p.height;
    }
}