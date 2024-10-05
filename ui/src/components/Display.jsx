import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

const sketch = (p) => {
    p.setup = () => {
        p.createCanvas(400, 400);
    }

    p.draw = () => {
        p.background(220);
        p.ellipse(200, 200, 50, 50);
    }
}

const Display = () => {
    const [myP5, setMyP5] = useState(null)
    const ref = useRef()
    useEffect(()=>{
        setMyP5(new p5(sketch, ref.current))
    }, [])
}

export default Display;