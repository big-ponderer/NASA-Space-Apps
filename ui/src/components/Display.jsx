import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

const PLACEHOLDER_DATA = {
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

const PLACEHOLDER_SYSTEM = {}

const Display = () => {
    const sector = p => {
        let cam;
        let angleX = 0;
        let angleY = 0;
        let moveSpeed = 5;
        let img;
        let data = currentSector

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
            p.background(10, 10, 44);
            p.ambientLight(100);
            p.pointLight(75, 75, 75, 0, 0, 0)

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

    const system = p => {
        p.setup = () => { p.createCanvas(p.windowWidth, p.windowHeight) }
        p.draw = () => { p.background(220) }
    }

    const [myP5, setMyP5] = useState(null)
    const ref = useRef()
    const [view, setView] = useState('sector')
    const [solarSystem, setSolarSystem] = useState({})
    const [currentSector, setCurrentSector] = useState({})

    useEffect(() => {
        if (!ref.current) return
        switch (view) {
            case "system":
                // solar system api call
                setSolarSystem(PLACEHOLDER_SYSTEM)
                myP5 && myP5.remove()
                setMyP5(new p5(system, ref.current))
                break;
            case "sector":
                // sector api call
                setCurrentSector(PLACEHOLDER_DATA)
                myP5 && myP5.remove()
                setMyP5(new p5(sector, ref.current))
                break;
            default:
                setMyP5(null)
        }
    }, [view])

    return <>
        <div className="simulator-container">
            <div ref={ref}/>
        </div>
        <p />
        {view === "sector" && <button className="button" onClick={() => setView("system")}>EXIT</button>}
    </>
}

export default Display;