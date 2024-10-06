import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import { Utils, planetOrbits } from '../functions.js'
import { useQuery } from 'react-query'
import { fetchSystem } from '../queries.js'
import loadingScreen from './loadingScreen.js'
import Star from "./star.js"
const MODEL_SIZE = 200

const planets = [
    { name: "Mercury", color: "gray", radius: 1.6 * 10 ** -5 }, //in AU
    { name: "Venus", color: "yellow", radius: 4.0 * 10 ** -5 },
    { name: "Earth", color: "blue", radius: 4.2 * 10 ** -5 },
    { name: "Mars", color: "red", radius: 2.2 * 10 ** -5 },
    { name: "Jupiter", color: "orange", radius: 4.4 * 10 ** -5 },
]

const getSectorColor = density => {
    const red = 3 + 20 * density
    const green = 3 + 20 * density
    const blue = 11 + 20 * density
    return [red, green, blue]
}

const renderSector = (data, p, setActiveAsteroid, models) => {
    p.push()
    data.asteroids && data.asteroids.forEach((asteroid,i) => {
        if (asteroid.position && models) {
            //models take turns
            console.log(i%models.length)
            const model = models[i%models.length]
            //detect which asteroid is being looked at if any
            const distance = p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2)
            const angle = (p.TAU + p.atan2(p.mouseY - p.height / 2, p.mouseX - p.width / 2)) % p.TAU
            const asteroidAngle = (p.TAU + p.atan2(asteroid.position[1], asteroid.position[0])) % p.TAU
            if (/*distance < 50 && */angle > asteroidAngle - p.PI / 8 && angle < asteroidAngle + p.PI / 8) {
                setActiveAsteroid(asteroid.position[0])
            } else {
                setActiveAsteroid(null)
            }
            p.push()
            p.translate(asteroid.position[0], asteroid.position[1], asteroid.position[2]);
            //p.noStroke()
            p.scale((asteroid.radius / MODEL_SIZE) * 5 * 10 ** 5);
            p.model(model);
            p.pop()
            /*if (asteroid.velocity) {
                const point1 = asteroid.position.map((coord, i) => coord - asteroid.velocity[i] * 10 ** 10)
                const point2 = asteroid.position.map((coord, i) => coord + asteroid.velocity[i] * 10 ** 10)
                p.strokeWeight(asteroid.radius * 5 * 10 ** 2)
                p.stroke(255)
                p.smooth()
                p.line(...point1, ...point2)
            }*/
        }
    })
    p.pop()
}

const Display = () => {
    const sector = p => {
        let cam;
        let asteroidModels;
        let angleX = 0;
        let angleY = 0;
        let moveSpeed = 0.01;
        let data = solarSystem.data.sectors[currentID[0]][currentID[1]]
        let neighboringSectors = [
            solarSystem.data.sectors[currentID[0] - 1] && solarSystem.data.sectors[currentID[0] - 1][currentID[1] - 1],
            solarSystem.data.sectors[currentID[0] - 1] && solarSystem.data.sectors[currentID[0] - 1][currentID[1]],
            solarSystem.data.sectors[currentID[0] - 1] && solarSystem.data.sectors[currentID[0] - 1][currentID[1] + 1],
            solarSystem.data.sectors[currentID[0]][currentID[1] - 1],
            solarSystem.data.sectors[currentID[0]][currentID[1] + 1],
            solarSystem.data.sectors[currentID[0] + 1] && solarSystem.data.sectors[currentID[0] + 1][currentID[1] - 1],
            solarSystem.data.sectors[currentID[0] + 1] && solarSystem.data.sectors[currentID[0] + 1][currentID[1]],
            solarSystem.data.sectors[currentID[0] + 1] && solarSystem.data.sectors[currentID[0] + 1][currentID[1] + 1],
        ]
        p.inSystemView = () => false

        p.preload = () => {
            asteroidModels = [1,2,3].map(i => p.loadModel(`asteroid${i}.stl`))
        }

        p.setup = () => {
            //p.createCanvas(p.displayWidth, p.displayHeight, p.WEBGL);
            const p5Div = document.getElementById("orrery");
            p.createCanvas(Utils.elementWidth(p5Div), Utils.elementHeight(p5Div), p.WEBGL);
            const cameraPos = data.cameraPos;
            cam = p.createCamera();
            cam.setPosition(cameraPos.x, cameraPos.y, cameraPos.z);
            console.log(cam.eyeX)
            console.log(cam.eyeY)
            console.log(cam.eyeZ)
            p.noCursor();
            console.log(data)
            console.log(asteroidModels)
        }

        p.draw = () => {
            setCameraPos({ x: cam.eyeX, y: cam.eyeY, z: cam.eyeZ })
            // Set the perspective with a larger near clipping plane
            let fov = p.PI / 8; // Field of view
            let aspect = p.width / p.height; // Aspect ratio
            let near = 0.1; // Closer to 0 means objects can be closer to the camera
            let far = 1000; // How far the camera can see
            p.perspective(fov, aspect, near, far);

            //space purple
            p.background(3, 3, 11);
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
            renderSector(data, p, setActiveAsteroid, asteroidModels);
            neighboringSectors.forEach(sector => {renderSector(sector, p, setActiveAsteroid)});
            p.pop();
        }
    }

    const system = p => {
        const data = solarSystem.data
        let zoom = 1
        p.inSystemView = () => true

        let stars = []
        let numstars = 800

    
        p.preload = () => {
            planets && planets.forEach((planet) => {
                planet.img = p.loadImage(`${planet.name}.png`);
            })
        }

        p.setup = () => {
            const p5Div = document.getElementById("orrery");
            p.createCanvas(Utils.elementWidth(p5Div), Utils.elementHeight(p5Div));

            for (let i = 0; i<numstars; i++){
                stars.push(new Star(p))
            }
        }

        p.draw = () => {
            if (p.keyIsDown(87)) {
                zoom += 0.01
            }
            if (p.keyIsDown(83) && zoom > 1) {
                zoom -= 0.01
            }

            p.ellipseMode(p.RADIUS)
            p.background(3, 3, 11);

            for (let star of stars) {
                star.update();
                star.show();
            }
    
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
    const [currentID, setCurrentID] = useState([0, 0])
    const [cameraPos, setCameraPos] = useState({ x: 0, y: 0, z: 0 })
    const [activeAsteroid, setActiveAsteroid] = useState(null)
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
            <p className="subtitle">X position: {cameraPos.x}, Y position: {cameraPos.y}, Z position: {cameraPos.z}</p>
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