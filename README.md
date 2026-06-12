# Piping Stress Illustration

Interactive static/web demos for piping stress concepts.

## Live demo

GitHub Pages URL:

```text
https://reallaksh19.github.io/PipingStressIllustration/
```

Current deployed module: **Failure & Strength Lab v3**.

## Current module

### Failure & Strength Lab v3

React/Vite implementation of a visual piping stress concept demo.

Location:

```bash
failure-strength-lab-v3/
```

Run locally:

```bash
cd failure-strength-lab-v3
npm install
npm run dev
```

Build:

```bash
npm run build
```

## GitHub Pages deployment

Deployment is handled by GitHub Actions:

```bash
.github/workflows/pages.yml
```

The workflow builds `failure-strength-lab-v3` and publishes its `dist` folder to GitHub Pages.

## Technical model

- Static loading uses stress-strain (`σ–ε`) behavior only.
- Fatigue loading uses an S-N curve only.
- S-N cycles are mapped as `log10(N)`, not linear screen distance.
- Side view and cross-section/local view are separate SVG components.
- Material response changes the failure interpretation and curve shape; it does not change the applied stress demand.

## Repo verification

The first committed app files are under `failure-strength-lab-v3/` on the `main` branch.

## Educational status

This is a conceptual teaching demo only, not a code compliance calculator.
