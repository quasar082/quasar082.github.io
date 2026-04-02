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

// Render shader — displaces background using heightfield normals + specular
const RENDER_SHADER = `
precision highp float;
uniform sampler2D samplerBackground;
uniform sampler2D samplerRipples;
uniform vec2 delta;
uniform float perturbance;
varying vec2 coord;

void main() {
  float height = texture2D(samplerRipples, coord).r;
  float heightX = texture2D(samplerRipples, vec2(coord.x + delta.x, coord.y)).r;
  float heightY = texture2D(samplerRipples, vec2(coord.x, coord.y + delta.y)).r;
  vec3 dx = vec3(delta.x, heightX - height, 0.0);
  vec3 dy = vec3(0.0, heightY - height, delta.y);
  vec2 offset = -normalize(cross(dy, dx)).xz;
  float specular = pow(max(0.0, dot(offset, normalize(vec2(-0.6, 1.0)))), 4.0);
  gl_FragColor = texture2D(samplerBackground, coord + offset * perturbance) + specular;
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
  private perturbance: number;
  private dropRadius: number;

  private quad!: WebGLBuffer;
  private dropProgram!: WebGLProgram;
  private updateProgram!: WebGLProgram;
  private renderProgram!: WebGLProgram;

  // Ping-pong framebuffers for wave simulation
  private textures: WebGLTexture[] = [];
  private framebuffers: WebGLFramebuffer[] = [];
  private bufferWriteIndex = 0;

  // Background texture
  private backgroundTexture!: WebGLTexture;
  private backgroundWidth = 0;
  private backgroundHeight = 0;

  private visible = true;
  private running = true;

  constructor(
    canvas: HTMLCanvasElement,
    options: {resolution?: number; perturbance?: number; dropRadius?: number} = {}
  ) {
    this.canvas = canvas;
    this.resolution = options.resolution ?? 256;
    this.perturbance = options.perturbance ?? 0.03;
    this.dropRadius = options.dropRadius ?? 20;

    const gl = canvas.getContext('webgl', {alpha: true, premultipliedAlpha: false})!;
    this.gl = gl;

    // Check for required extension
    const floatExt = gl.getExtension('OES_texture_half_float');
    const floatLinear = gl.getExtension('OES_texture_half_float_linear');

    // Fallback: try full float
    if (!floatExt) {
      gl.getExtension('OES_texture_float');
      gl.getExtension('OES_texture_float_linear');
    }

    this.initShaders();
    this.initBuffers();
    this.initTextures(floatExt);
    this.initBackgroundTexture();
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

    // Create 2 textures + framebuffers for ping-pong
    for (let i = 0; i < 2; i++) {
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        this.resolution,
        this.resolution,
        0,
        gl.RGBA,
        type,
        null
      );

      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

      this.textures.push(texture);
      this.framebuffers.push(fbo);
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private initBackgroundTexture(): void {
    const gl = this.gl;
    this.backgroundTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  private bindQuad(): void {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    const location = 0;
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  }

  resize(): void {
    const gl = this.gl;
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  // Capture current page content as background texture
  captureBackground(image: TexImageSource): void {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    this.backgroundWidth = this.canvas.width;
    this.backgroundHeight = this.canvas.height;
  }

  drop(x: number, y: number, radius: number, strength: number): void {
    const gl = this.gl;
    const dropProgram = this.dropProgram;

    gl.useProgram(dropProgram);

    // Bind vertex attribute
    const vertexLoc = gl.getAttribLocation(dropProgram, 'vertex');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(vertexLoc);
    gl.vertexAttribPointer(vertexLoc, 2, gl.FLOAT, false, 0, 0);

    // Write to current write buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[this.bufferWriteIndex]);

    // Read from the other buffer
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[1 - this.bufferWriteIndex]);
    gl.uniform1i(gl.getUniformLocation(dropProgram, 'texture'), 0);

    gl.uniform2f(
      gl.getUniformLocation(dropProgram, 'center'),
      (2 * x - 1),
      (1 - 2 * y)
    );
    gl.uniform1f(gl.getUniformLocation(dropProgram, 'radius'), radius);
    gl.uniform1f(gl.getUniformLocation(dropProgram, 'strength'), strength);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Swap buffers
    this.bufferWriteIndex = 1 - this.bufferWriteIndex;
  }

  update(): void {
    const gl = this.gl;
    const updateProgram = this.updateProgram;

    gl.useProgram(updateProgram);

    const vertexLoc = gl.getAttribLocation(updateProgram, 'vertex');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(vertexLoc);
    gl.vertexAttribPointer(vertexLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[this.bufferWriteIndex]);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[1 - this.bufferWriteIndex]);
    gl.uniform1i(gl.getUniformLocation(updateProgram, 'texture'), 0);

    gl.uniform2f(
      gl.getUniformLocation(updateProgram, 'delta'),
      1 / this.resolution,
      1 / this.resolution
    );

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    this.bufferWriteIndex = 1 - this.bufferWriteIndex;
  }

  render(): void {
    const gl = this.gl;
    const renderProgram = this.renderProgram;

    gl.useProgram(renderProgram);

    const vertexLoc = gl.getAttribLocation(renderProgram, 'vertex');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(vertexLoc);
    gl.vertexAttribPointer(vertexLoc, 2, gl.FLOAT, false, 0, 0);

    // Render to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Background texture (unit 0)
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture);
    gl.uniform1i(gl.getUniformLocation(renderProgram, 'samplerBackground'), 0);

    // Ripple heightfield texture (unit 1)
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[1 - this.bufferWriteIndex]);
    gl.uniform1i(gl.getUniformLocation(renderProgram, 'samplerRipples'), 1);

    gl.uniform2f(
      gl.getUniformLocation(renderProgram, 'delta'),
      1 / this.resolution,
      1 / this.resolution
    );
    gl.uniform1f(gl.getUniformLocation(renderProgram, 'perturbance'), this.perturbance);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }

  // Create a ripple at pixel coordinates
  dropAtPixel(x: number, y: number, radius?: number, strength?: number): void {
    const rect = this.canvas.getBoundingClientRect();
    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;
    const dropRadiusNormalized = (radius ?? this.dropRadius) / rect.width;
    this.drop(normalizedX, normalizedY, dropRadiusNormalized, strength ?? 0.04);
  }

  step(): void {
    if (!this.running) return;
    this.update();
    this.update(); // Run simulation twice per frame for faster wave propagation
    this.render();
  }

  destroy(): void {
    const gl = this.gl;
    this.running = false;

    for (const tex of this.textures) gl.deleteTexture(tex);
    for (const fbo of this.framebuffers) gl.deleteFramebuffer(fbo);
    gl.deleteTexture(this.backgroundTexture);
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

  // Detect pointer:fine (desktop with precise pointer)
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
    let captureInterval: ReturnType<typeof setInterval>;
    let offscreenCanvas: HTMLCanvasElement;
    let offscreenCtx: CanvasRenderingContext2D;

    try {
      ripple = new WaterRipple(canvas, {
        resolution: 256,
        perturbance: 0.03,
        dropRadius: 20,
      });
    } catch {
      // WebGL not supported — show default cursor and bail
      return;
    }

    // Create offscreen canvas for html2canvas-like capture
    offscreenCanvas = document.createElement('canvas');
    offscreenCtx = offscreenCanvas.getContext('2d')!;

    // Capture page background as a solid color + gradient approximation
    // We use a simple approach: fill with the site's background color
    const captureBackground = () => {
      if (!ripple) return;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      offscreenCanvas.width = w;
      offscreenCanvas.height = h;

      // Get computed background color
      const bgColor = getComputedStyle(document.body).backgroundColor || '#FAFAF8';
      offscreenCtx.fillStyle = bgColor;
      offscreenCtx.fillRect(0, 0, w, h);

      ripple.captureBackground(offscreenCanvas);
    };

    // Initial capture after a short delay (let page render)
    setTimeout(captureBackground, 100);
    // Re-capture periodically to pick up scroll changes
    captureInterval = setInterval(captureBackground, 2000);

    const onResize = () => {
      ripple?.resize();
      captureBackground();
    };
    window.addEventListener('resize', onResize);

    // Mouse interaction
    const onMouseMove = (e: MouseEvent) => {
      ripple?.dropAtPixel(e.clientX, e.clientY, 20, 0.03);
    };

    const onClick = (e: MouseEvent) => {
      ripple?.dropAtPixel(e.clientX, e.clientY, 35, 0.12);
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
      clearInterval(captureInterval);
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
