import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import { Utils, planetOrbits, renderSector } from '../functions.js'
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

const Display = () => {
    const handleCollisions = asteroid => {
        if (view !== "sector" || !myP5 || myP5.inSystemView()) {
            return
        }
        const camera = myP5.getCamera()
        if (!camera) {
            return
        }
        const currentCameraPos = [ camera.eyeX, camera.eyeY, camera.eyeZ ]
        const asteroidPos = asteroid.position
        if (Math.sqrt(asteroidPos.reduce((acc, coord, i) => acc + (coord - currentCameraPos[i]) ** 2, 0)) < asteroid.radius) {
            console.log("COLLIDING")
            setPopupOpen(true)
        } else {
            setPopupOpen(false)
        }
    }

    const sector = p => {
        let cam;
        let asteroidModels;
        let angleX = 0;
        let angleY = 0;
        let moveSpeed = 0.01;
        let data = solarSystem.data.sectors[currentID[0]][currentID[1]]
        let neighboringSectors = []
        if (solarSystem){
            for(let i = Math.max(currentID[0]-2, 0); i<Math.min(currentID[0]+3, 23); i++){
                for(let j = Math.max(currentID[1]-2, 0); j<Math.min(currentID[1]+3, 23); j++){
                    neighboringSectors.push(solarSystem.data.sectors[i][j])
                }
            }
        }
        p.inSystemView = () => false

        p.getCamera = () => cam

        p.preload = () => {
            asteroidModels = [1, 2, 3].map(i => p.loadModel(`asteroid${i}.stl`))
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
            renderSector(data, p, asteroidModels, handleCollisions);
            neighboringSectors.forEach(sector => { renderSector(sector, p, asteroidModels, handleCollisions) });
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
    const [popupOpen, setPopupOpen] = useState(false)
    const [currentAsteroid, setCurrentAsteroid] = useState(null)
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

    //open popup when user press p
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "p") {
                setPopupOpen(!popupOpen)
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [popupOpen])

    const navigateToClosestAsteroid = () => {
        const camera = myP5.getCamera()
        if (!camera) {
            return
        }
        const currentCameraPos = [ camera.eyeX, camera.eyeY, camera.eyeZ ]
        const closestAsteroid = solarSystem.data.sectors[currentID[0]][currentID[1]].asteroids.reduce((closest, asteroid) => {
            const distance = Math.sqrt(asteroid.position.reduce((acc, coord, i) => acc + (coord - currentCameraPos[i]) ** 2, 0))
            return distance < closest.distance ? { distance, asteroid } : closest
        }, { distance: Infinity, asteroid: null }).asteroid
        if (closestAsteroid) {
            camera.setPosition(...closestAsteroid.position)
            camera.lookAt(0,0,0)
            setCurrentAsteroid(closestAsteroid)
        }
    }

    return <>
        <div className="simulator-container">
            <div id="orrery" ref={ref} style={{ height: "100%" }} />
        </div>
        <p />
        {view === "sector" && <button className="button" onClick={navigateToClosestAsteroid}>NAVIGATE TO CLOSEST</button>}
        {view === "sector" && <button className="button" onClick={() => setView("system")}>EXIT</button>}
        {/*view === "system" && <input className="slider" type="range" min={0.5} max={2} step={0.01} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />*/}
        <img
            src="dupe.png"
            className={`centered-image ${popupOpen ? '' : 'hidden'}`}
        />
        {currentAsteroid && niceDataPlaceholder(solarSystem.data)} //replace thi with your function

    </>
}

const niceDataPlaceholder = asteroid => asteroid //replace thi with your function

export default Display;