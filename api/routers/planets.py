import numpy as np

def kepler_newtons_method(M, e, tol=1e-6, max_iter=1000):
    # Initial guess for E (starting with the mean anomaly)
    E = M if e < 0.8 else np.pi
    # Iterate to refine the guess using Newton's method
    for _ in range(max_iter):
        # Kepler's equation: f(E) = E - e * sin(E) - M
        f_E = E - e * np.sin(E) - M
        # Derivative: f'(E) = 1 - e * cos(E)
        f_prime_E = 1 - e * np.cos(E)
        # Newton's method step
        delta = f_E / f_prime_E
        E = E - delta
        # Check if the result is within the tolerance
        if abs(delta) < tol:
            break
    return E

def planet_orbits(t):
    elements = [
        {"a": 3.870975847905576E-01,"e": 2.056454787167579E-01, "i":7.003523521784342E+00, "Omega":4.830014312216669E+01, "omega": 2.919497121662391E+01, "M0":1.038211226512955E+02 }, #Mercury
        {"a": 7.233291917901979E-01,"e": 6.737279122322842E-03, "i":3.394396433432916E+00, "Omega": 7.661179678719908E+01, "omega": 5.524210717207938E+01, "M0": 1.389937083519449E+02 }, #Venus
        {"a": 1.000777360389874E+00,"e": 1.687380106714580E-02, "i":1.570395619600130E-03, "Omega": 1.570565801356092E+02, "omega": 2.987945712955125E+02 , "M0": 2.733295178212163E+02 }, #Earth
        {"a": 1.523780980571824E+00,"e": 9.336432391805517E-02, "i":1.847711557917372E+00, "Omega": 4.948980318078964E+01, "omega": 2.867211682607092E+02, "M0": 7.832680827641637E+01 }, #Mars
        {"a": 5.202574393950348E+00,"e": 4.828245000523424E-02, "i":1.303434425214163E+00, "Omega": 1.005216554428596E+02, "omega": 2.735659800334696E+02, "M0": 5.171268552007280E+01 } #Jupiter
    ]

    G = 2.959122082855911E-4 # AU^3 / (kg * day^2)
    M_sun = 1.989E30 # kg
    position_vectors = []

    for planet in elements:
        # Calculate mean motion (n)
        n = (G * M_sun / planet["a"]**3)**(1/2)
        # Mean anomaly at time t
        M_t = planet["M0"] + n * t
        # Solve for eccentric anomaly E_t using Newton's method
        E_t = kepler_newtons_method(M_t, planet["e"])
        # True anomaly v_t
        v_t = 2 * np.arctan(np.sqrt((1 + planet["e"]) / (1 - planet["e"])) * np.tan(E_t / 2))
        # Distance r_t
        r_t = (planet["a"] * (1 - planet["e"]**2)) / (1 + planet["e"] * np.cos(v_t))
        # Convert to Cartesian coordinates
        x = r_t * np.cos(v_t)
        y = r_t * np.sin(v_t)
        # Append position to list
        position_vectors.append([x, y])

    return position_vectors




