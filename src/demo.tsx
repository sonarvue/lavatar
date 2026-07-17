import * as React from "react"
import { createRoot } from "react-dom/client"
import {
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  Copy,
  Cpu,
  ExternalLink,
  Fingerprint,
  Gauge,
  Play,
  Terminal,
  WifiOff,
} from "lucide-react"

import { Lavatar, type LavatarPalette, type LavatarShape } from "./components/ui/lavatar"
import "./demo.css"

const people = [
  ["Mina Park", "mina@lavatar.dev"],
  ["Noah Williams", "noah@lavatar.dev"],
  ["Sofia Chen", "sofia@lavatar.dev"],
  ["Eli Okafor", "eli@lavatar.dev"],
  ["Ari Morgan", "ari@lavatar.dev"],
  ["Lina Haddad", "lina@lavatar.dev"],
] as const

const palettes: LavatarPalette[] = ["lava", "aurora", "plasma", "mono"]
const shapes: LavatarShape[] = ["rounded", "circle", "square"]

const installCode = `# Add the component source to your shadcn project
components/ui/lavatar.tsx

# No runtime packages required
# React 18+ · WebGL2 · TypeScript`

function App() {
  const [seed, setSeed] = React.useState("hello@lavatar.dev")
  const [palette, setPalette] = React.useState<LavatarPalette>("lava")
  const [shape, setShape] = React.useState<LavatarShape>("rounded")
  const [codeTab, setCodeTab] = React.useState<"usage" | "install">("usage")
  const [copied, setCopied] = React.useState(false)

  const safeSeed = (seed || "lavatar").replaceAll("\\", "\\\\").replaceAll('"', '\\"')
  const usageCode = `import { Lavatar } from "@/components/ui/lavatar"

export function UserAvatar() {
  return (
    <Lavatar
      seed="${safeSeed}"
      palette="${palette}"
      shape="${shape}"
      size={96}
    />
  )
}`
  const activeCode = codeTab === "usage" ? usageCode : installCode

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(activeCode)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = activeCode
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.append(textarea)
      textarea.select()
      document.execCommand("copy")
      textarea.remove()
    }

    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <main>
      <nav className="nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Lavatar home">
          <Lavatar seed="lavatar" size={30} shape="rounded" />
          <span>lavatar</span>
          <span className="version">v0.1</span>
        </a>

        <div className="nav-links">
          <a href="#playground">Playground</a>
          <a href="#gallery">Gallery</a>
          <a href="#code">Code</a>
        </div>

        <a className="nav-action" href="#code">
          <Code2 size={15} aria-hidden="true" />
          Use component
        </a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span /> Open-source shader identity</div>
          <h1>Every person gets a tiny <em>lava lamp.</em></h1>
          <p className="lede">
            A deterministic WebGL avatar for React and shadcn/ui. One seed produces one living,
            multicolor identity. No image requests or stored files.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#playground">
              <Play size={15} fill="currentColor" aria-hidden="true" />
              Try your seed
            </a>
            <a className="button secondary" href="#code">
              <Code2 size={16} aria-hidden="true" />
              View React code
            </a>
          </div>
        </div>

        <div className="hero-orbit" aria-label="A set of unique Lavatar examples">
          <div className="orbit-line" />
          <Lavatar className="orbit-avatar orbit-a" seed="gravity" size={158} shape="circle" />
          <Lavatar className="orbit-avatar orbit-b" seed="chromatic" size={94} shape="rounded" palette="aurora" />
          <Lavatar className="orbit-avatar orbit-c" seed="metaball" size={72} shape="circle" palette="plasma" />
          <span className="orbit-label"><Gauge size={13} /> 60 FPS</span>
        </div>
      </section>

      <section className="spec-strip" aria-label="Component features">
        <div><Fingerprint size={17} /><span><strong>Deterministic</strong>Same seed, same render</span></div>
        <div><Cpu size={17} /><span><strong>GPU rendered</strong>GLSL fragment shader</span></div>
        <div><WifiOff size={17} /><span><strong>Zero requests</strong>No avatar service needed</span></div>
      </section>

      <section className="playground-section" id="playground">
        <div className="section-heading compact">
          <div>
            <span className="kicker">Live shader lab</span>
            <h2>Find your Lavatar.</h2>
          </div>
          <div className="runtime-pill"><span /> WebGL2 active</div>
        </div>

        <div className="playground">
          <div className="preview-stage">
            <div className="stage-meta"><span>Live output</span><span>2× DPR</span></div>
            <div className="preview-glow" />
            <Lavatar seed={seed} palette={palette} shape={shape} size="clamp(190px, 32vw, 330px)" />
          </div>

          <div className="controls">
            <div className="field">
              <label htmlFor="seed">Seed</label>
              <div className="input-shell">
                <Fingerprint size={16} aria-hidden="true" />
                <input id="seed" value={seed} onChange={(event) => setSeed(event.target.value)} spellCheck={false} />
              </div>
              <span className="field-help">Use an email, username, wallet, or any stable ID.</span>
            </div>

            <div className="field">
              <span className="label">Palette</span>
              <div className="segmented" role="group" aria-label="Palette">
                {palettes.map((value) => (
                  <button key={value} data-active={palette === value} onClick={() => setPalette(value)}>
                    <span className={`swatch swatch-${value}`} />
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <span className="label">Shape</span>
              <div className="segmented three" role="group" aria-label="Shape">
                {shapes.map((value) => (
                  <button key={value} data-active={shape === value} onClick={() => setShape(value)}>
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <a className="inline-code-link" href="#code">
              <Terminal size={15} aria-hidden="true" />
              <code>&lt;Lavatar seed=&quot;{seed || "lavatar"}&quot; /&gt;</code>
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="gallery-section" id="gallery">
        <div className="section-heading">
          <div>
            <span className="kicker">Deterministic by design</span>
            <h2>A different atmosphere for every identity.</h2>
          </div>
          <p>Names never enter the shader. A one-way numeric seed drives color, motion, scale, and position.</p>
        </div>

        <div className="gallery">
          {people.map(([name, email], index) => (
            <article className="person" key={email}>
              <Lavatar
                seed={email}
                palette={palettes[index % palettes.length]}
                shape={index % 3 === 1 ? "circle" : "rounded"}
                size="100%"
                label={`${name}'s Lavatar`}
              />
              <div>
                <strong>{name}</strong>
                <span>{email}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="code-section" id="code">
        <div className="code-copy">
          <span className="kicker">Source-first component</span>
          <h2>Own the shader.</h2>
          <p>
            Lavatar follows the shadcn model: the component lives in your codebase. Change the GLSL,
            palettes, timing, or API whenever you want.
          </p>
          <ul>
            <li><Check size={15} /> React 18 and 19</li>
            <li><Check size={15} /> TypeScript props</li>
            <li><Check size={15} /> Reduced-motion support</li>
          </ul>
          <a className="docs-link" href="https://ui.shadcn.com/docs/registry" target="_blank" rel="noreferrer">
            <BookOpen size={16} /> Read the shadcn registry guide <ExternalLink size={13} />
          </a>
        </div>

        <div className="code-window">
          <div className="code-toolbar">
            <div className="code-tabs" role="tablist" aria-label="Code example">
              <button role="tab" aria-selected={codeTab === "usage"} onClick={() => setCodeTab("usage")}>Usage</button>
              <button role="tab" aria-selected={codeTab === "install"} onClick={() => setCodeTab("install")}>Install</button>
            </div>
            <button className="copy-button" onClick={copyCode} aria-label="Copy code">
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre><code>{activeCode}</code></pre>
          <div className="code-status"><span /> lavatar.tsx <span className="code-language">TSX + GLSL</span></div>
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <Lavatar seed="lavatar-footer" size={24} />
          <span>Lavatar</span>
          <span className="muted">MIT licensed · WebGL2 · zero runtime dependencies</span>
        </div>
        <div className="footer-links">
          <a href="https://www.sonarvue.com/" target="_blank" rel="noreferrer">
            Built by Sonarvue <ExternalLink size={11} />
          </a>
          <a href="/LICENSE.txt" target="_blank">License</a>
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext" target="_blank" rel="noreferrer">WebGL2 <ExternalLink size={11} /></a>
          <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer">shadcn/ui <ExternalLink size={11} /></a>
        </div>
      </footer>
    </main>
  )
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
