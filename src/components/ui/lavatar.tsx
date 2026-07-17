import * as React from "react"

export type LavatarShape = "circle" | "rounded" | "square"
export type LavatarPalette = "lava" | "aurora" | "nebula" | "plasma" | "mono"

export interface LavatarProps
  extends Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, "children" | "width" | "height" | "role"> {
  seed: string
  size?: number | string
  shape?: LavatarShape
  palette?: LavatarPalette
  animated?: boolean
  label?: string
}

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 out_color;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_seed;
uniform vec3 u_background_a;
uniform vec3 u_background_b;
uniform vec3 u_colors[6];

float random(float value) {
  return fract(sin(value * 91.3458 + u_seed.w * 73.156) * 47453.5453);
}

float noise(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  local = local * local * (3.0 - 2.0 * local);

  float a = random(dot(cell, vec2(127.1, 311.7)));
  float b = random(dot(cell + vec2(1.0, 0.0), vec2(127.1, 311.7)));
  float c = random(dot(cell + vec2(0.0, 1.0), vec2(127.1, 311.7)));
  float d = random(dot(cell + vec2(1.0), vec2(127.1, 311.7)));

  return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
}

void main() {
  vec2 uv = v_uv;
  float time = u_time;

  float liquid_noise = noise(uv * 3.4 + vec2(time * 0.035, -time * 0.028));
  vec2 liquid_uv = uv;
  liquid_uv.x += sin(uv.y * 8.0 + time * 0.34 + u_seed.x * 8.0) * 0.024;
  liquid_uv.y += sin(uv.x * 7.0 - time * 0.27 + u_seed.y * 9.0) * 0.018;
  liquid_uv += (liquid_noise - 0.5) * 0.035;

  float field = 0.0;
  vec3 mixed_color = vec3(0.0);
  float color_weight = 0.0;

  for (int i = 0; i < 6; i++) {
    float index = float(i);
    float phase = random(index + 1.0) * 6.2831853;
    float speed = mix(0.16, 0.34, random(index + 8.0));
    float radius = mix(0.105, 0.205, random(index + 21.0));

    vec2 origin = vec2(
      mix(0.13, 0.87, random(index + 34.0)),
      mix(0.08, 0.92, random(index + 55.0))
    );

    vec2 position = origin + vec2(
      sin(time * speed + phase) * mix(0.06, 0.18, random(index + 67.0)),
      cos(time * speed * 0.73 + phase * 1.37) * mix(0.14, 0.34, random(index + 79.0))
    );

    vec2 delta = liquid_uv - position;
    delta.x *= mix(0.72, 1.25, random(index + 91.0));
    float influence = radius * radius / (dot(delta, delta) + 0.0025);

    field += influence;
    float weight = influence * influence;
    mixed_color += u_colors[i] * weight;
    color_weight += weight;
  }

  mixed_color /= max(color_weight, 0.001);

  float lava = smoothstep(1.15, 1.72, field);
  float aura = smoothstep(0.28, 1.25, field) * (1.0 - lava);
  float edge = smoothstep(1.0, 1.45, field) - smoothstep(1.48, 2.0, field);

  vec3 background = mix(u_background_b, u_background_a, uv.y + liquid_noise * 0.12);
  background += mixed_color * aura * 0.22;

  vec3 color = mix(background, mixed_color, lava);
  color += mixed_color * edge * 0.34;

  float highlight = pow(max(0.0, 1.0 - distance(uv, vec2(0.31, 0.18)) * 2.4), 5.0);
  color += vec3(0.9, 0.94, 1.0) * highlight * lava * 0.28;

  float vignette = smoothstep(0.82, 0.24, distance(uv, vec2(0.5)));
  color *= mix(0.7, 1.08, vignette);

  float grain = random(dot(gl_FragCoord.xy, vec2(0.067, 0.113)) + floor(time * 12.0));
  color += (grain - 0.5) * 0.025;

  out_color = vec4(color, 1.0);
}`

function hashString(input: string): number {
  let hash = 2166136261

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function normalizeSeed(seed: string): string {
  const normalized = seed.trim().toLowerCase()
  return normalized.length > 0 ? normalized : "lavatar"
}

function seededUnit(seed: string, salt: string): number {
  return (hashString(`${seed}:${salt}`) % 10_000) / 10_000
}

function hslToRgb(hue: number, saturation: number, lightness: number): [number, number, number] {
  const h = ((hue % 360) + 360) % 360 / 360
  const s = saturation / 100
  const l = lightness / 100
  const chroma = (1 - Math.abs(2 * l - 1)) * s
  const section = h * 6
  const x = chroma * (1 - Math.abs(section % 2 - 1))
  const match = l - chroma / 2

  const [red, green, blue] =
    section < 1 ? [chroma, x, 0]
      : section < 2 ? [x, chroma, 0]
        : section < 3 ? [0, chroma, x]
          : section < 4 ? [0, x, chroma]
            : section < 5 ? [x, 0, chroma]
              : [chroma, 0, x]

  return [red + match, green + match, blue + match]
}

function createPalette(seed: string, palette: LavatarPalette) {
  const base = hashString(`${seed}:hue`) % 360
  const variation = (index: number) => hashString(`${seed}:color-${index}`) % 24

  if (palette === "mono") {
    return {
      backgroundA: hslToRgb(0, 0, 12),
      backgroundB: hslToRgb(0, 0, 2),
      colors: [92, 76, 61, 86, 69, 97].flatMap((lightness) => hslToRgb(0, 0, lightness)),
      fallback: `linear-gradient(145deg, hsl(0 0% 18%), hsl(0 0% 3%))`,
    }
  }

  const offsets = {
    lava: [0, 53, 119, 181, 244, 307],
    aurora: [0, 71, 132, 174, 231, 296],
    nebula: [0, 37, 97, 164, 223, 281],
    plasma: [0, 29, 83, 151, 216, 289],
  }[palette]
  const saturation = palette === "nebula" ? 84 : 96
  const lightness = palette === "nebula" ? 56 : 62
  const hues = offsets.map((offset, index) => base + offset + variation(index))

  return {
    backgroundA: hslToRgb(base + 20, 76, palette === "nebula" ? 11 : 8),
    backgroundB: hslToRgb(base + 205, 78, 3),
    colors: hues.flatMap((hue, index) => hslToRgb(hue, saturation, lightness + index % 2 * 7)),
    fallback: `radial-gradient(circle at 30% 25%, hsl(${hues[0]} ${saturation}% 58%), transparent 42%), radial-gradient(circle at 72% 70%, hsl(${hues[3]} ${saturation}% 56%), transparent 46%), hsl(${base + 205} 72% 5%)`,
  }
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Lavatar shader compilation failed:", gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value)
  else if (ref) ref.current = value
}

export const Lavatar = React.forwardRef<HTMLCanvasElement, LavatarProps>(function Lavatar(
  {
    seed,
    size = 96,
    shape = "rounded",
    palette = "lava",
    animated = true,
    label,
    className,
    style,
    ...props
  },
  forwardedRef,
) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const normalizedSeed = normalizeSeed(seed)
  const paletteValues = React.useMemo(() => createPalette(normalizedSeed, palette), [normalizedSeed, palette])

  const setCanvasRef = React.useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas
    assignRef(forwardedRef, canvas)
  }, [forwardedRef])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: true,
      depth: false,
      powerPreference: "high-performance",
      premultipliedAlpha: false,
    })

    if (!gl) return

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    const buffer = gl.createBuffer()
    if (!program || !buffer) return

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Lavatar shader link failed:", gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

    const position = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution")
    const timeLocation = gl.getUniformLocation(program, "u_time")
    const seedLocation = gl.getUniformLocation(program, "u_seed")
    const backgroundALocation = gl.getUniformLocation(program, "u_background_a")
    const backgroundBLocation = gl.getUniformLocation(program, "u_background_b")
    const colorsLocation = gl.getUniformLocation(program, "u_colors[0]")

    gl.uniform4f(
      seedLocation,
      seededUnit(normalizedSeed, "x"),
      seededUnit(normalizedSeed, "y"),
      seededUnit(normalizedSeed, "z"),
      seededUnit(normalizedSeed, "w"),
    )
    gl.uniform3fv(backgroundALocation, paletteValues.backgroundA)
    gl.uniform3fv(backgroundBLocation, paletteValues.backgroundB)
    gl.uniform3fv(colorsLocation, paletteValues.colors)

    let frame = 0
    let start = performance.now() - seededUnit(normalizedSeed, "time") * 48_000
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.round(bounds.width * dpr))
      const height = Math.max(1, Math.round(bounds.height * dpr))

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      gl.viewport(0, 0, width, height)
      gl.uniform2f(resolutionLocation, width, height)
    }

    const render = (now: number) => {
      resize()
      gl.uniform1f(timeLocation, animated && !reducedMotion ? (now - start) / 1000 : seededUnit(normalizedSeed, "still") * 42)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      if (animated && !reducedMotion) frame = requestAnimationFrame(render)
    }

    const observer = new ResizeObserver(() => {
      resize()
      if (!animated || reducedMotion) render(performance.now())
    })
    observer.observe(canvas)
    render(performance.now())

    const handleContextLost = (event: Event) => event.preventDefault()
    canvas.addEventListener("webglcontextlost", handleContextLost)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      canvas.removeEventListener("webglcontextlost", handleContextLost)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      start = 0
    }
  }, [animated, normalizedSeed, paletteValues])

  const dimensions = typeof size === "number"
    ? { width: size, height: size }
    : { width: size, aspectRatio: "1 / 1" }

  return (
    <canvas
      ref={setCanvasRef}
      role="img"
      aria-label={label ?? `Shader lava lamp avatar for ${seed}`}
      className={["block select-none overflow-hidden", className].filter(Boolean).join(" ")}
      style={{
        ...dimensions,
        display: "block",
        borderRadius: shape === "circle" ? "50%" : shape === "square" ? 0 : "24%",
        background: paletteValues.fallback,
        ...style,
      }}
      {...props}
    >
      {label ?? `Shader lava lamp avatar for ${seed}`}
    </canvas>
  )
})

Lavatar.displayName = "Lavatar"
