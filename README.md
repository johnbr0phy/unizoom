# Powers of Ten in Pixels

An interactive pixel art recreation of the 1977 Eames "Powers of Ten" film. Scroll from quarks to the observable universe — 42 orders of magnitude in a single zoomable canvas.

## Quick Start

```bash
pnpm install
pnpm dev
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm check` | Lint + typecheck + test (run after changes) |
| `pnpm build` | Production build |
| `pnpm test` | Run tests in watch mode |

## Project Structure

See [CLAUDE.md](./CLAUDE.md) for full architecture documentation.

## Scale Journey

| Scale | What You See |
|-------|--------------|
| 10⁻¹⁶ m | Quarks |
| 10⁻¹⁴ m | Atomic nucleus |
| 10⁻¹⁰ m | Atoms |
| 10⁻⁹ m | Molecules, DNA |
| 10⁻⁶ m | Cells |
| 10⁰ m | Human (the classic picnic) |
| 10³ m | City |
| 10⁷ m | Earth |
| 10¹¹ m | Solar system |
| 10²¹ m | Milky Way |
| 10²⁶ m | Observable universe |

## Controls

- **Desktop**: Scroll wheel to zoom
- **Mobile**: Pinch to zoom

## Tech Stack

- Vite + TypeScript
- Canvas 2D (no WebGL needed)
- Biome (lint + format)
- Vitest (testing)

## License

MIT
