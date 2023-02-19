import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useEffect, useRef } from 'react';
import tinycolor from "tinycolor2";

export default function Home() {

  const [dimension, setDimension] = useState({width: 0, height: 0})
  const canvas = useRef(null);
  const container = useRef(null);
  const colors = ["#5A9DAC", "#E69E37", "#F1E0D6"];
  let indexOfCurrentColor = 0;
  let prevX = null;
  let prevY = null;
  let circles = [];
  let isReseting = false;

  useEffect(() => {
    const resize = () => {
      setDimension({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    window.addEventListener("resize", () => {
      resize();
    })
    resize();
  }, [])

  const manageMouseMove = (event) => {
    const { clientX, clientY, movementX, movementY } = event;
    if(isReseting) return;
    if(circles.length > 250){
      reset();
      return;
    }
    requestAnimationFrame( () => {paint(clientX, clientY, 180, 18)})
    circles.push({x: clientX, y: clientY})
    if(prevX != null){
      const speed = Math.max(Math.abs(movementX), Math.abs(movementY));
      fill(clientX, clientY, 180, speed / 20);
    }
    prevX = clientX;
    prevY = clientY;
  }

  const fill = (x, y ,radius, speed) => {
    console.log("fill")
    const lerp = (x, y, a) => x * (1 - a) + y * a;
    for(let i = 0 ; i < speed ; i++){
      const targetX = lerp(prevX, x, (1/speed) * i);
      const targetY = lerp(prevY, y, (1/speed) * i);
      requestAnimationFrame( () => {paint(targetX, targetY, radius, 18)})
    }
  }

  const paint = (x, y, radius, delta) => {
    if(delta == 0) return;
    const ctx = canvas.current?.getContext("2d");
    const color = lighten(colors[indexOfCurrentColor], delta)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.fill();
    requestAnimationFrame(() => {paint(x, y, radius, delta - 1)})
  }

  const reset = () => {
    isReseting = true;
    const shuffled = circles.sort( () => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);

    selected.map( ({x, y}) => {
      expandCircle(x, y, 180);
    })

    container.current.style.backgroundColor = colors[indexOfCurrentColor];

    setTimeout( () => {
      const ctx = canvas.current?.getContext("2d");
      ctx.clearRect(0, 0, dimension.width, dimension.height);
      indexOfCurrentColor = indexOfCurrentColor == 2 ? 0 : indexOfCurrentColor + 1;
      isReseting = false;
      circles = [];
      prevX = null;
      prevY = null;
    }, 500)
  }

  const lighten = (color, amount) => {
    if(amount == 0) return color;
    return tinycolor(color).brighten(amount * 0.8).saturate(amount * 0.8)
  }

  const expandCircle = (x, y, radius) => {
    if(radius > 600) return;
    const ctx = canvas.current?.getContext("2d");
    ctx.fillStyle = colors[indexOfCurrentColor]
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.fill();
    requestAnimationFrame(() => {expandCircle(x, y, radius + 15)})
  }

  return (
    <div onMouseMove={(e) => {manageMouseMove(e)}} ref={container} className={styles.container}>
        <canvas ref={canvas} className={styles.canvas} width={dimension.width} height={dimension.height}>
        </canvas>
    </div>
  )
}
