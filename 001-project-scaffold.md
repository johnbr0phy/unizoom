# Task 001: Project Scaffold

## Goal
Set up the project with Vite, TypeScript, and Biome tooling with a single `pnpm check` command.

## Acceptance Criteria
- [ ] `pnpm dev` starts Vite dev server
- [ ] `pnpm check` runs biome + tsc + vitest in sequence
- [ ] TypeScript strict mode enabled
- [ ] Path alias `@/` maps to `src/`
- [ ] Basic `index.html` with canvas element
- [ ] Empty `main.ts` entry point that logs "Powers of Ten"
- [ ] `pnpm check` passes

## Relevant Files
- `package.json`
- `tsconfig.json`
- `biome.json`
- `vite.config.ts`
- `index.html`
- `src/main.ts`

## Commands to Run
```bash
pnpm create vite . --template vanilla-ts
pnpm add -D @biomejs/biome vitest
pnpm biome init
```

## Notes
- Use `simple-git-hooks` + `lint-staged` for pre-commit later (not in this task)
- Canvas should be full viewport with no scrollbars
- Add basic CSS reset in index.html or separate file
