'use client';

import { useEffect, useRef } from 'react';

export default function HeroShader() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      vec2 random2(vec2 st) {
        st = vec2(dot(st,vec2(127.1,311.7)),
                  dot(st,vec2(269.5,183.3)));
        return -1.0 + 2.0*fract(sin(st)*43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(dot(random2(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                       dot(random2(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
                  mix(dot(random2(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                       dot(random2(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        st.x *= u_resolution.x / u_resolution.y;

        vec2 mouse = u_mouse / u_resolution.xy;

        vec2 q = vec2(0.0);
        q.x = noise(st + 0.05 * u_time);
        q.y = noise(st + vec2(1.0));

        vec2 r = vec2(0.0);
        r.x = noise(st + 1.0 * q + vec2(1.7, 9.2) + 0.08 * u_time + mouse.x * 0.5);
        r.y = noise(st + 1.0 * q + vec2(8.3, 2.8) + 0.08 * u_time + mouse.y * 0.5);

        float f = noise(st + r);

        vec3 col1 = vec3(0.106, 0.110, 0.102); // Dark stone
        vec3 col2 = vec3(0.063, 0.725, 0.506); // Emerald #10B981
        vec3 col3 = vec3(0.961, 0.282, 0.600); // Pink #FF72B1
        vec3 col4 = vec3(0.961, 0.620, 0.043); // Amber glow

        vec3 color = mix(col1, col2, clamp(length(q), 0.0, 1.0));
        color = mix(color, col3, clamp(length(r.x), 0.0, 1.0));
        color = mix(color, col4, clamp(f * f * 4.0, 0.0, 1.0));

        float dist = distance(st, mouse * vec2(u_resolution.x / u_resolution.y, 1.0));
        color += vec3(0.05, 0.2, 0.15) * (1.0 - smoothstep(0.0, 0.6, dist));

        gl_FragColor = vec4(color, 0.85);
      }
    `;

    function createShader(glCtx, type, source) {
      const shader = glCtx.createShader(type);
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error("Shader compile error:", glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const posAttrLocation = gl.getAttribLocation(program, 'a_position');
    const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const mouseUniformLocation = gl.getUniformLocation(program, 'u_mouse');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = rect.height - (e.clientY - rect.top);
    };

    window.addEventListener('mousemove', handleMouseMove);

    function resizeCanvas() {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }

    let animationFrameId;
    let startTime = performance.now();

    function render(now) {
      resizeCanvas();

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      gl.useProgram(program);
      gl.enableVertexAttribArray(posAttrLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(posAttrLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(timeUniformLocation, (now - startTime) * 0.001);
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseUniformLocation, mouseX, mouseY);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-90"
    />
  );
}
