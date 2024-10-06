import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import { Utils, planetOrbits } from '../functions.js'

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

const PLACEHOLDER_SYSTEM = {
    radii: [5, 1, 3],
    sectionAngle: Math.PI / 1.5,
    sectors: [
        [{density: 0.1}, {density: 0.2}, {density: 0.3}],
        [{density: 0.4}, {density: 0.5}, {density: 0.6}],
        [{density: 0.7}, {density: 0.8}, {density: 0.9}]
    ]
}

const planets = [
    {name: "Mercury", color: "gray", radius: 1.6 * 10**-5}, //in AU
    {name: "Venus", color: "yellow", radius: 4.0 * 10**-5},
    {name: "Earth", color: "blue", radius: 4.2 * 10**-5},
    {name: "Mars", color: "red", radius: 2.2 * 10**-5},
    {name: "Jupiter", color: "orange", radius: 4.4 * 10**-5},
]

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
            p.createCanvas(p.displayWidth, p.displayHeight, p.WEBGL);
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
        const data = solarSystem
        let zoom = 1

        p.preload = () => {
            planets && planets.forEach((planet) => {
                planet.img = p.loadImage(`${planet.name}.png`);
            })
        }

        p.setup = () => {
            const p5Div = document.getElementById("orrery");
            p.createCanvas(Utils.elementWidth(p5Div), Utils.elementHeight(p5Div));
        }

        p.draw = () => {
            console.log(zoom)
            if(p.keyIsDown(87)){
                zoom += 0.01
            }
            if(p.keyIsDown(83) && zoom > 0.05) {
                zoom -= 0.01
            }

            p.ellipseMode(p.RADIUS)
            p.background(10, 10, 44);
            const orreryRadius = 0.9 * Math.min(p.height, p.width) / 2;
            const CENTER_X = p.width / 2;
            const CENTER_Y = p.height / 2;
            const largestCircle = data.radii && Math.max(...data.radii)
            const sortedRadii = data.radii.sort((a, b) => b - a);
            data.sectors.slice().reverse().forEach((ring, i) => {
                ring.forEach((sector, j) => {
                    p.fill(200 * sector.density + 55, 0, 200 * sector.density + 55);
                    //check if mouse is on sector
                    const distance = p.dist(p.mouseX, p.mouseY, CENTER_X, CENTER_Y)
                    const angle = (p.TAU + p.atan2(p.mouseY - CENTER_Y, p.mouseX - CENTER_X)) % p.TAU
                    if (distance < zoom * orreryRadius * sortedRadii[i] / largestCircle && (sortedRadii.length <= i + 1 || distance > zoom * orreryRadius * sortedRadii[i+1] / largestCircle) && angle > data.sectionAngle*j && angle < data.sectionAngle*(j+1)) {
                        p.fill(255, 255, 255);
                        if (p.mouseIsPressed && p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
                            setView("sector")
                        }
                    }
                    p.arc(CENTER_X, CENTER_Y, zoom * orreryRadius * sortedRadii[i] / largestCircle, zoom * orreryRadius * sortedRadii[i] / largestCircle, data.sectionAngle*j, data.sectionAngle*(j+1));
                })
            })
            const positions = planetOrbits(p.frameCount)
            planets.forEach((planet) => {
                p.noStroke()
                p.fill(planet.color);
                const x = CENTER_X + zoom * orreryRadius * positions[planet.name][0] / largestCircle;
                const y = CENTER_Y + zoom * orreryRadius * positions[planet.name][1] / largestCircle;
                const image = planet.img
                const diameter = zoom*0.5*10**4 * orreryRadius * planet.radius / largestCircle * 2
                p.image(image, x, y, diameter, diameter)
            })
        }
    }

    const [myP5, setMyP5] = useState(null)
    const ref = useRef()
    const checkFirstRender = useRef(true)
    const [view, setView] = useState('sector')
    const [solarSystem, setSolarSystem] = useState({})
    const [currentSector, setCurrentSector] = useState({})
    //const [zoom, setZoom] = useState(1)

    useEffect(() => {
        switch (view) {
            case "system":
                // solar system api call
                setSolarSystem({...PLACEHOLDER_SYSTEM, rehydrate: !PLACEHOLDER_SYSTEM.rehydrate})
                break;
            case "sector":
                // sector api call
                console.log("called")
                setCurrentSector({...PLACEHOLDER_DATA, rehydrate: !PLACEHOLDER_DATA.rehydrate})
                break;
            default:
                setMyP5(null)
        }
    }, [view])

    useEffect(() => {
        if(checkFirstRender.current){
            checkFirstRender.current = false
            return
        }
        myP5 && myP5.remove()
        setMyP5(new p5(system, ref.current))
    }, [solarSystem])

    useEffect(() => {
        console.log("sector useeffect called")
        myP5 && myP5.remove()
        setMyP5(new p5(sector, ref.current))
    }, [currentSector])

    return <>
        <div className="simulator-container">
            <div id="orrery" ref={ref} style={{height: "100%"}}/>
        </div>
        <p />
        {view === "sector" && <button className="button" onClick={() => setView("system")}>EXIT</button>}
        {/*view === "system" && <input className="slider" type="range" min={0.5} max={2} step={0.01} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />*/}
    </>
}

export default Display;