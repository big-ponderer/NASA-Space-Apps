import p5 from "p5"
function keplerNewtonsMethod(M, e, tol = 1e-6, maxIter = 1000) {
    // Initial guess for E (starting with the mean anomaly)
    let E = e < 0.8 ? M : Math.PI;

    // Iterate to refine the guess using Newton's method
    for (let i = 0; i < maxIter; i++) {
        // Kepler's equation: f(E) = E - e * sin(E) - M
        let f_E = E - e * Math.sin(E) - M;
        // Derivative: f'(E) = 1 - e * cos(E)
        let f_prime_E = 1 - e * Math.cos(E);
        // Newton's method step
        let delta = f_E / f_prime_E;
        E = E - delta;
        // Check if the result is within the tolerance
        if (Math.abs(delta) < tol) {
            break;
        }
    }

    return E;
}
export function niceData(asteroid){
    let data = {}
    if(asteroid && asteroid.mass){
        //x += "Mass: " + asteroid.mass + " kg\n"
        data["Mass (kg)"] = asteroid.mass
    }
    if (asteroid && asteroid.radius){
        //x += "Radius: " + asteroid.radius + " km\n"
        data["Radius (km)"] = asteroid.radius
    }
    if (asteroid && asteroid.period){
        //x += "Period: " + asteroid.period + " years\n"
        data["Period (years)"] = asteroid.period
    }
    if (asteroid && asteroid.intrestRez){
        //x += "Intresting Resources: " + asteroid.intrestRez + "\n"
        data["Intresting Resources"] = asteroid.intrestRez
    }
    if (asteroid && asteroid.hazardous){
        data["img"] = "dupe.png"
    }
    else if (asteroid && asteroid.nearEarth){
        data["img"] = "dupe1.png"
    } else {
        data["img"] = "dupe2.png"
    }
    return data
}


export function planetOrbits(t) {
    const elements = [
        { a: 0.3870975847905576, e: 0.2056454787167579, i: 7.003523521784342, Omega: 48.30014312216669, omega: 29.19497121662391, M0: 103.8211226512955, name: "Mercury" }, // Mercury
        { a: 0.7233291917901979, e: 0.006737279122322842, i: 3.394396433432916, Omega: 76.61179678719908, omega: 55.24210717207938, M0: 138.9937083519449, name: "Venus" }, // Venus
        { a: 1.000777360389874, e: 0.0168738010671458, i: 0.00157039561960013, Omega: 157.0565801356092, omega: 298.7945712955125, M0: 273.3295178212163, name: "Earth" }, // Earth
        { a: 1.523780980571824, e: 0.09336432391805517, i: 1.847711557917372, Omega: 49.48980318078964, omega: 286.7211682607092, M0: 78.32680827641637, name: "Mars" }, // Mars
        { a: 5.202574393950348, e: 0.04828245000523424, i: 1.303434425214163, Omega: 100.5216554428596, omega: 273.5659800334696, M0: 51.7126855200728, name: "Jupiter" }, // Jupiter
    ];

    const G = 2.959122082855911e-4; // AU^3 / (kg * day^2)
    const positionVectors = {};

    elements.forEach(planet => {
        // Calculate mean motion (n)
        const n = Math.sqrt(G / Math.pow(planet.a, 3));
        // Mean anomaly at time t
        const M_t = planet.M0 + n * t;
        // Solve for eccentric anomaly E_t using Newton's method
        const E_t = keplerNewtonsMethod(M_t, planet.e);
        // True anomaly v_t
        const v_t = 2 * Math.atan(Math.sqrt((1 + planet.e) / (1 - planet.e)) * Math.tan(E_t / 2));
        // Distance r_t
        const r_t = (planet.a * (1 - planet.e ** 2)) / (1 + planet.e * Math.cos(v_t));
        // Convert to Cartesian coordinates
        const x = r_t * Math.cos(v_t);
        const y = r_t * Math.sin(v_t);
        // Append position to list
        positionVectors[planet.name] = [x, y]
    });

    return positionVectors;
}

export class Utils {
    // Calculate the Width in pixels of a Dom element
    static elementWidth(element) {
        return (
            element.clientWidth -
            parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-left")) -
            parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-right"))
        )
    }

    // Calculate the Height in pixels of a Dom element
    static elementHeight(element) {
        return (
            element.clientHeight -
            parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-top")) -
            parseFloat(window.getComputedStyle(element, null).getPropertyValue("padding-bottom"))
        )
    }
}

const MODEL_SIZE = 200

export const renderSector = (data, p, models, handleCollisions) => {
    p.push()
    data.asteroids && data.asteroids.forEach((asteroid, i) => {
        if (asteroid.position && models) {
            //models take turns
            const model = models[i % models.length]
            //detect which asteroid is being looked at if any

            if (!asteroid.rotation) {
                asteroid.rotation = {
                    axis: p.createVector(p.random(), p.random(), p.random()).normalize(), // Random rotation axis
                    speed: p.random(0.01, 0.05)/10, // Random rotation speed
                    angle: 0 // Current rotation angle
                };
            }
            asteroid.rotation.angle += asteroid.rotation.speed;

            const distance = p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2)
            const angle = (p.TAU + p.atan2(p.mouseY - p.height / 2, p.mouseX - p.width / 2)) % p.TAU
            const asteroidAngle = (p.TAU + p.atan2(asteroid.position[1], asteroid.position[0])) % p.TAU
            p.push()
            p.translate(asteroid.position[0], asteroid.position[1], asteroid.position[2]);

            p.rotate(asteroid.rotation.angle, [asteroid.rotation.axis.x, asteroid.rotation.axis.y, asteroid.rotation.axis.z]);

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
            handleCollisions(asteroid)
        }
    })
    p.pop()
}