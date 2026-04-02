'use client';

import {useRef, useEffect, useState} from 'react';

// ─── GLSL Shaders ───────────────────────────────────────────────────────────

const VERTEX_SHADER = `
attribute vec2 vertex;
varying vec2 coord;
void main() {
  coord = vertex * 0.5 + 0.5;
  gl_Position = vec4(vertex, 0.0, 1.0);
}
`;

// Drop shader — creates a ripple impulse at mouse position
const DROP_SHADER = `
precision highp float;
const float PI = 3.141592653589793;
uniform sampler2D texture;
uniform vec2 center;
uniform float radius;
uniform float strength;
varying vec2 coord;

void main() {
  vec4 info = texture2D(texture, coord);
  float drop = max(0.0, 1.0 - length(center * 0.5 + 0.5 - coord) / radius);
  drop = 0.5 - cos(drop * PI) * 0.5;
  info.r += drop * strength;
  gl_FragColor = info;
}
`;

// Update shader — Laplacian wave equation with damping
const UPDATE_SHADER = `
precision highp float;
uniform sampler2D texture;
uniform vec2 delta;
varying vec2 coord;

void main() {
  vec4 info = texture2D(texture, coord);
  vec2 dx = vec2(delta.x, 0.0);
  vec2 dy = vec2(0.0, delta.y);
  float average = (
    texture2D(texture, coord - dx).r +
    texture2D(texture, coord - dy).r +
    texture2D(texture, coord + dx).r +
    texture2D(texture, coord + dy).r
  ) * 0.25;
  info.g += (average - info.r) * 2.0;
  info.g *= 0.995;
  info.r += info.g;
  gl_FragColor = info;
}
`;

// Render shader — transparent overlay with light caustics + specular only
// No background texture needed — outputs rgba with alpha for compositing
const RENDER_SHADER = `
precision highp float;
uniform sampler2D samplerRipples;
uniform vec2 delta;
varying vec2 coord;

void main() {
  float height = texture2D(samplerRipples, coord).r;
  float heightX = texture2D(samplerRipples, vec2(coord.x + delta.x, coord.y)).r;
  float heightY = texture2D(samplerRipples, vec2(coord.x, coord.y + delta.y)).r;

  // Compute surface normal from heightfield gradient
  vec3 dx = vec3(delta.x, heightX - height, 0.0);
  vec3 dy = vec3(0.0, heightY - height, delta.y);
  vec2 normal = -normalize(cross(dy, dx)).xz;

  // Specular highlight — directional light from upper-left
  float specular = pow(max(0.0, dot(normal, normalize(vec2(-0.6, 1.0)))), 4.0);

  // Caustic-like brightness from wave convergence/divergence
  float curvature = abs(heightX + heightY - 2.0 * height);
  float caustic = curvature * 80.0;

  // Combine: white light for specular, subtle caustic glow
  float brightness = specular * 0.7 + caustic * 0.15;

  // Edge darkening (Fresnel-like) for depth
  float edgeDark = length(normal) * 0.08;

  // Final: white highlights with transparency
  float alpha = clamp(brightness + edgeDark, 0.0, 0.6);
  vec3 color = vec3(1.0) * specular + vec3(0.95, 0.97, 1.0) * caustic * 0.3;

  gl_FragColor = vec4(color, alpha);
}
`;

// ─── WebGL Helpers ──────────────────────────────────────────────────────────

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram {
  const program = gl.createProgram()!;
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  return program;
}

// ─── Water Ripple Engine ────────────────────────────────────────────────────

class WaterRipple {
  private gl: WebGLRenderingContext;
  private canvas: HTMLCanvasElement;
  private resolution: number;

  private quad!: WebGLBuffer;
  private dropProgram!: WebGLProgram;
  private updateProgram!: WebGLProgram;
  private renderProgram!: WebGLProgram;

  // Ping-pong framebuffers for wave simulation
  private textures: WebGLTexture[] = [];
  private framebuffers: WebGLFramebuffer[] = [];
  private bufferWriteIndex = 0;

  private running = true;

  constructor(canvas: HTMLCanvasElement, options: {resolution?: number} = {}) {
    this.canvas = canvas;
    this.resolution = options.resolution ?? 256;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
    })!;

    if (!gl) throw new Error('WebGL not supported');
    this.gl = gl;

    // Enable alpha blending for transparent overlay
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Check for required float texture extension
    const floatExt = gl.getExtension('OES_texture_half_float');
    gl.getExtension('OES_texture_half_float_linear');

    if (!floatExt) {
      gl.getExtension('OES_texture_float');
      gl.getExtension('OES_texture_float_linear');
    }

    this.initShaders();
    this.initBuffers();
    this.initTextures(floatExt);
    this.resize();
  }

  private initShaders(): void {
    const gl = this.gl;
    this.dropProgram = createProgram(gl, VERTEX_SHADER, DROP_SHADER);
    this.updateProgram = createProgram(gl, VERTEX_SHADER, UPDATE_SHADER);
    this.renderProgram = createProgram(gl, VERTEX_SHADER, RENDER_SHADER);
  }

  private initBuffers(): void {
    const gl = this.gl;
    this.quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]),
      gl.STATIC_DRAW
    );
  }

  private initTextures(floatExt: OES_texture_half_float | null): void {
    const gl = this.gl;
    const type = floatExt ? floatExt.HALF_FLOAT_OES : gl.FLOAT;

    for (let i = 0; i < 2; i++) {
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.resolution, this.resolution, 0, gl.RGBA, type, null);

      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

      this.textures.push(texture);
      this.framebuffers.push(fbo);
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  resize(): void {
    const gl = this.gl;
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  drop(x: number, y: number, radius: number, strength: number): void {
    const gl = this.gl;
    const prog = this.dropProgram;

    gl.useProgram(prog);

    const vertexLoc = gl.getAttribLocation(prog, 'vertex');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(vertexLoc);
    gl.vertexAttribPointer(vertexLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[this.bufferWriteIndex]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[1 - this.bufferWriteIndex]);
    gl.uniform1i(gl.getUniformLocation(prog, 'texture'), 0);

    gl.uniform2f(gl.getUniformLocation(prog, 'center'), 2 * x - 1, 1 - 2 * y);
    gl.uniform1f(gl.getUniformLocation(prog, 'radius'), radius);
    gl.uniform1f(gl.getUniformLocation(prog, 'strength'), strength);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    this.bufferWriteIndex = 1 - this.bufferWriteIndex;
  }

  update(): void {
    const gl = this.gl;
    const prog = this.updateProgram;

    gl.useProgram(prog);

    const vertexLoc = gl.getAttribLocation(prog, 'vertex');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(vertexLoc);
    gl.vertexAttribPointer(vertexLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[this.bufferWriteIndex]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[1 - this.bufferWriteIndex]);
    gl.uniform1i(gl.getUniformLocation(prog, 'texture'), 0);
    gl.uniform2f(gl.getUniformLocation(prog, 'delta'), 1 / this.resolution, 1 / this.resolution);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    this.bufferWriteIndex = 1 - this.bufferWriteIndex;
  }

  render(): void {
    const gl = this.gl;
    const prog = this.renderProgram;

    gl.useProgram(prog);

    const vertexLoc = gl.getAttribLocation(prog, 'vertex');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(vertexLoc);
    gl.vertexAttribPointer(vertexLoc, 2, gl.FLOAT, false, 0, 0);

    // Render to screen (transparent overlay)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[1 - this.bufferWriteIndex]);
    gl.uniform1i(gl.getUniformLocation(prog, 'samplerRipples'), 0);
    gl.uniform2f(gl.getUniformLocation(prog, 'delta'), 1 / this.resolution, 1 / this.resolution);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }

  dropAtPixel(x: number, y: number, radius: number, strength: number): void {
    const rect = this.canvas.getBoundingClientRect();
    this.drop(x / rect.width, y / rect.height, radius / rect.width, strength);
  }

  step(): void {
    if (!this.running) return;
    this.update();
    this.update();
    this.render();
  }

  destroy(): void {
    const gl = this.gl;
    this.running = false;
    for (const tex of this.textures) gl.deleteTexture(tex);
    for (const fbo of this.framebuffers) gl.deleteFramebuffer(fbo);
    gl.deleteBuffer(this.quad);
    gl.deleteProgram(this.dropProgram);
    gl.deleteProgram(this.updateProgram);
    gl.deleteProgram(this.renderProgram);
  }
}

// ─── React Component ────────────────────────────────────────────────────────

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!isDesktop || !canvasRef.current) return;

    const canvas = canvasRef.current;
    let ripple: WaterRipple | null = null;
    let animFrameId: number;

    try {
      ripple = new WaterRipple(canvas, {resolution: 256});
    } catch {
      // WebGL not available — graceful degradation, no effect
      return;
    }

    const onResize = () => ripple?.resize();
    window.addEventListener('resize', onResize);

    // Mouse movement creates gentle ripples
    const onMouseMove = (e: MouseEvent) => {
      ripple?.dropAtPixel(e.clientX, e.clientY, 20, 0.04);
    };

    // Click creates stronger ripple burst
    const onClick = (e: MouseEvent) => {
      ripple?.dropAtPixel(e.clientX, e.clientY, 35, 0.14);
    };

    // Animation loop
    const animate = () => {
      ripple?.step();
      animFrameId = requestAnimationFrame(animate);
    };
    animFrameId = requestAnimationFrame(animate);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      ripple?.destroy();
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
