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

export function planetOrbits(t) {
    const elements = [
        { a: 0.3870975847905576, e: 0.2056454787167579, i: 7.003523521784342, Omega: 48.30014312216669, omega: 29.19497121662391, M0: 103.8211226512955 }, // Mercury
        { a: 0.7233291917901979, e: 0.006737279122322842, i: 3.394396433432916, Omega: 76.61179678719908, omega: 55.24210717207938, M0: 138.9937083519449 }, // Venus
        { a: 1.000777360389874, e: 0.0168738010671458, i: 0.00157039561960013, Omega: 157.0565801356092, omega: 298.7945712955125, M0: 273.3295178212163 }, // Earth
        { a: 1.523780980571824, e: 0.09336432391805517, i: 1.847711557917372, Omega: 49.48980318078964, omega: 286.7211682607092, M0: 78.32680827641637 }, // Mars
        { a: 5.202574393950348, e: 0.04828245000523424, i: 1.303434425214163, Omega: 100.5216554428596, omega: 273.5659800334696, M0: 51.7126855200728 }, // Jupiter
    ];

    const G = 2.959122082855911e-4; // AU^3 / (kg * day^2)
    const positionVectors = [];

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
        positionVectors.push([x, y]);
    });

    return positionVectors;
}
