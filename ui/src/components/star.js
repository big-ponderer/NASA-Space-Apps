export default class Star {
    constructor(p) {
      this.p = p;  // Store the p5 instance
      this.init();
    }
    
    init() {
      // Randomize positions and set initial z position far from view
      this.x = 3*this.p.random(-this.p.windowWidth / 4, 3*this.p.windowWidth / 4);
      this.y = 3*this.p.random(-this.p.windowHeight / 4, 3*this.p.windowHeight / 4);
      this.z = this.p.random(this.p.windowWidth);
    }
  
    update() {
      // Move stars closer (increase their z value)
      this.z -= 0.1;
      if (this.z < 1) {
        this.init();  // Reset when star passes the viewer
      }
    }
  
    show() {
      this.p.noStroke();
      this.p.fill(255);
      // Map the size of the star based on how close it is
      let sx = this.p.map(this.x / this.z, 0, 1, 0, this.p.windowWidth / 2);
      let sy = this.p.map(this.y / this.z, 0, 1, 0, this.p.windowHeight / 2);
      let r = this.p.map(this.z, 0, this.p.windowWidth, 8, 0);  // Size of stars based on depth
      this.p.ellipse(sx, sy, r, r);
    }
  }
    