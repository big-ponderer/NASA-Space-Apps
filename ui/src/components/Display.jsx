import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

const sketch = (p) => {
    let cam;
    let angleX = 0;
    let angleY = 0;
    let moveSpeed = 5;
    let data;

    p.setup = () => {
        //dummy data
        data = {
            cameraPos: { x: 0, y: 0, z: 0 },
            asteroids: [
                {
                    current: { x: 200, y: 200, z: 200 },
                    refPoints: [
                        { x: 0, y: 0, z: 0 },
                        { x: 0, y: 0, z: 200 }
                    ],
                    radius: 50
                },
                {
                    current: { x: -200, y: -200, z: -200 },
                    refPoints: [
                        { x: 0, y: 0, z: 0 },
                        { x: 0, y: 0, z: -200 }
                    ],
                    radius: 50
                }
            ]
        }
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        cam = p.createCamera(0, 0, 0);
        p.noCursor();
    }

    p.draw = () => {
        //space purple
        p.background(25, 25, 112);
        p.ambientLight(100);
        p.pointLight(255, 255, 255, 0, 0, 0)

        angleX += (p.movedX * 0.01);
        angleY += (p.movedY * 0.01);

        // Limit the vertical rotation to avoid camera flipping - might remove
        angleY = p.constrain(angleY, -p.PI / 2, p.PI / 2);

        let forwardX = p.sin(angleX);
        let forwardZ = -p.cos(angleX);
        let forwardY = p.tan(angleY);

        if (p.keyIsDown(87)) {
            cam.move(0, 0, -moveSpeed);
        }

        if (p.keyIsDown(83)) {
            cam.move(0, 0, moveSpeed);
        }

        cam.lookAt(cam.eyeX + forwardX, cam.eyeY + forwardY, cam.eyeZ + forwardZ);

        p.push();
        p.noStroke();
        //asteroid color
        p.fill(139, 69, 19);
        p.specularMaterial(255);
        p.shininess(20);
        let currentX = 0;
        let currentY = 0;
        let currentZ = 0;
        data.asteroids.forEach(asteroid => {
            currentX = asteroid.current.x - currentX;
            currentY = asteroid.current.y - currentY;
            currentZ = asteroid.current.z - currentZ;
            p.translate(currentX, currentY, currentZ);
            p.sphere(asteroid.radius);
        })
        p.pop();
    }
}

const Display = () => {
    const [myP5, setMyP5] = useState(null)
    const ref = useRef()
    useEffect(() => {
        setMyP5(new p5(sketch, ref.current))
    }, [])
}

export default Display;