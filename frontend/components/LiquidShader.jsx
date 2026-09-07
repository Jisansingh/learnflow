'use client';

import { useEffect, useRef } from 'react';

export default function LiquidShader() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      varying vec2 v_texCoord;

      vec2 hash(vec2 p) {
          p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
          return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                         dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                     mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                         dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          vec2 p = uv;
          p.x *= u_resolution.x / u_resolution.y;

          vec2 mouse = u_mouse / u_resolution.xy;
          mouse.x *= u_resolution.x / u_resolution.y;

          float dist = distance(p, mouse);
          float mouseWave = sin(dist * 20.0 - u_time * 2.2) * exp(-dist * 4.0);
          float mouseInfluence = smoothstep(0.75, 0.0, dist);

          float flowSpeed = u_time * 0.07;
          vec2 q = vec2(0.0);
          q.x = noise(p * 2.4 + vec2(0.0, flowSpeed));
          q.y = noise(p * 2.4 + vec2(1.0, flowSpeed * 0.85));

          vec2 r = vec2(0.0);
          r.x = noise(p * 3.0 + 1.3 * q + vec2(1.7, 9.2) + flowSpeed * 1.25 + mouseInfluence * 0.35);
          r.y = noise(p * 3.0 + 1.3 * q + vec2(8.3, 2.8) + flowSpeed * 1.25 - mouseInfluence * 0.35);

          r += (p - mouse) * mouseWave * 0.20;

          float f = noise(p * 2.0 + r);

          vec3 bgWarm = vec3(0.985, 0.980, 0.965);
          vec3 emerald = vec3(0.035, 0.745, 0.490);
          vec3 mint = vec3(0.380, 0.940, 0.680);
          vec3 coral = vec3(0.980, 0.220, 0.360);
          vec3 gold = vec3(0.980, 0.650, 0.050);

          vec3 col = bgWarm;
          col = mix(col, mint, smoothstep(-0.35, 0.55, q.x) * 0.75);
          col = mix(col, emerald, smoothstep(-0.15, 0.75, r.x) * 0.58);
          col = mix(col, gold, smoothstep(-0.25, 0.65, r.y) * 0.42);
          col = mix(col, coral, smoothstep(0.05, 0.80, f * f * 2.2) * 0.38);

          col = mix(col, emerald, mouseInfluence * 0.28);
          col += vec3(0.03, 0.12, 0.08) * mouseWave;

          gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compileShader(glCtx, type, src) {
      const s = glCtx.createShader(type);
      glCtx.shaderSource(s, src);
      glCtx.compileShader(s);
      if (!glCtx.getShaderParameter(s, glCtx.COMPILE_STATUS)) {
        console.error("Shader error:", glCtx.getShaderInfoLog(s));
        glCtx.deleteShader(s);
        return null;
      }
      return s;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Link error:", gl.getProgramInfoLog(program));
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLocation = gl.getAttribLocation(program, 'a_position');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');

    let mouse = { x: 250, y: 250 };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    function syncSize() {
      const w = canvas.clientWidth || 500;
      const h = canvas.clientHeight || 700;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    let animationFrameId;
    function render(t) {
      syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.enableVertexAttribArray(posLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (resizeObserver) resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto z-0"
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
