import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import { Utils, planetOrbits } from '../functions.js'
import { useQuery } from 'react-query'
import { fetchSystem } from '../queries.js'
import loadingScreen from './loadingScreen.js'

const planets = [
    { name: "Mercury", color: "gray", radius: 1.6 * 10 ** -5 }, //in AU
    { name: "Venus", color: "yellow", radius: 4.0 * 10 ** -5 },
    { name: "Earth", color: "blue", radius: 4.2 * 10 ** -5 },
    { name: "Mars", color: "red", radius: 2.2 * 10 ** -5 },
    { name: "Jupiter", color: "orange", radius: 4.4 * 10 ** -5 },
]

const getSectorColor = density => {
    const red = 10 + 20 * density
    const green = 10 + 20 * density
    const blue = 44 + 20 * density
    return [red, green, blue]
}

const Display = () => {
    const sector = p => {
        let cam;
        let angleX = 0;
        let angleY = 0;
        let moveSpeed = 5;
        let data = solarSystem.data.sectors[currentID[0]][currentID[1]]
        p.inSystemView = () => false

        p.setup = () => {
            p.createCanvas(p.displayWidth, p.displayHeight, p.WEBGL);
            const cameraPos = data.cameraPos;
            cam = p.createCamera(cameraPos.x, cameraPos.y, cameraPos.z, 0, 0, 0, 0, 1, 0);
            p.noCursor();
        }

        p.draw = () => {
            //space purple
            p.background(10, 10, 44);
            p.ambientLight(50, 50, 50);
            p.directionalLight(100, 100, 100, 0, 0, -1);
            p.pointLight(150, 150, 150, 100, 100, 200);
            p.specularMaterial(100, 100, 100);
            p.shininess(10);

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
            let currentX = 0;
            let currentY = 0;
            let currentZ = 0;
            data.asteroids && data.asteroids.forEach(asteroid => {
                if (asteroid.position) {
                    //detect which asteroid is being looked at if any
                    const distance = p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2)
                    const angle = (p.TAU + p.atan2(p.mouseY - p.height / 2, p.mouseX - p.width / 2)) % p.TAU
                    const asteroidAngle = (p.TAU + p.atan2(asteroid.position[1], asteroid.position[0])) % p.TAU
                    if (/*distance < 50 && */angle > asteroidAngle - p.PI / 8 && angle < asteroidAngle + p.PI / 8) {
                        setActiveAsteroid(asteroid.position[0])
                    } else {
                        setActiveAsteroid(null)
                    }
                    currentX = Math.round(asteroid.position[0]) - currentX;
                    currentY = Math.round(asteroid.position[1]) - currentY;
                    currentZ = Math.round(asteroid.position[2]) - currentZ;
                    p.translate(currentX, currentY, currentZ);
                    p.sphere(asteroid.radius);
                    p.translate(-currentX, -currentY, -currentZ);
                    if (asteroid.velocity) {
                        console.log(asteroid.velocity)
                        const point1 = asteroid.position.map((coord, i) => coord - asteroid.velocity[i] * 10 ** 10)
                        const point2 = asteroid.position.map((coord, i) => coord + asteroid.velocity[i] * 10 ** 10)
                        p.strokeWeight(20)
                        p.stroke(255)
                        p.smooth()
                        p.line(...point1, ...point2)
                    }
                }
            })
            p.pop();
        }
    }

    const system = p => {
        const data = solarSystem.data
        let zoom = 1
        p.inSystemView = () => true

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
            if (p.keyIsDown(87)) {
                zoom += 0.01
            }
            if (p.keyIsDown(83) && zoom > 1) {
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
                    p.fill(...getSectorColor(sector.density));
                    //check if mouse is on sector
                    const distance = p.dist(p.mouseX, p.mouseY, CENTER_X, CENTER_Y)
                    const angle = (p.TAU + p.atan2(p.mouseY - CENTER_Y, p.mouseX - CENTER_X)) % p.TAU
                    if (distance < zoom * orreryRadius * sortedRadii[i] / largestCircle && (sortedRadii.length <= i + 1 || distance > zoom * orreryRadius * sortedRadii[i + 1] / largestCircle) && angle > data.angles * j && angle < data.angles * (j + 1)) {
                        p.fill(255, 255, 255);
                        if (p.mouseIsPressed && p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
                            setCurrentID(sector.id)
                            setView("sector")
                        }
                    }
                    p.arc(CENTER_X, CENTER_Y, zoom * orreryRadius * sortedRadii[i] / largestCircle, zoom * orreryRadius * sortedRadii[i] / largestCircle, data.angles * j, data.angles * (j + 1));
                })
            })
            const positions = planetOrbits(p.frameCount)
            planets.forEach((planet) => {
                p.noStroke()
                p.fill(planet.color);
                const x = CENTER_X + zoom * orreryRadius * positions[planet.name][0] / largestCircle;
                const y = CENTER_Y + zoom * orreryRadius * positions[planet.name][1] / largestCircle;
                const image = planet.img
                const diameter = zoom * 0.5 * 10 ** 4 * orreryRadius * planet.radius / largestCircle * 2
                p.image(image, x, y, diameter, diameter)
            })
        }
    }

    const [myP5, setMyP5] = useState(null)
    const ref = useRef()
    const [view, setView] = useState('system')
    const [activeAsteroid, setActiveAsteroid] = useState(null)
    const [currentID, setCurrentID] = useState([0, 0])

    const solarSystem = useQuery("system", fetchSystem)

    useEffect(() => {
        if (solarSystem.data) {
            switch (view) {
                case "system":
                    myP5 && myP5.remove()
                    setMyP5(new p5(system, ref.current))
                    break;
                case "sector":
                    myP5 && myP5.remove()
                    setMyP5(new p5(sector, ref.current))
                    break;
                default:
                    break;
            }
        } else {
            myP5 && myP5.remove()
            setMyP5(new p5(loadingScreen, ref.current))
        }
    }, [solarSystem.data, view]);

    return <>
        <header className="header">
            <h1 className="title">{activeAsteroid && "Now Observing:"}  {activeAsteroid || "Orrery"}</h1>
            <p className="subtitle">use your cursor to look around. press W to move forard and S to move backward</p>
        </header>

        <div className="simulator-container">
            <div id="orrery" ref={ref} style={{ height: "100%" }} />
        </div>

        <p />

        {view === "sector" && <button className="button" onClick={() => setView("system")}>EXIT</button>}
        {/*view === "system" && <input className="slider" type="range" min={0.5} max={2} step={0.01} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />*/}
    </>
}

export default Display;