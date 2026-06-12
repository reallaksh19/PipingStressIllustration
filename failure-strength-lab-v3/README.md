# Failure & Strength Lab v3

React/Vite implementation of the visual piping stress concept demo.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Key corrections

- Static tab uses stress-strain (`σ–ε`) behavior only.
- Fatigue tab uses an S-N curve only.
- S-N cycles are mapped as `log10(N)`, not linear screen distance.
- Side view and cross-section/local view are separate SVG components.
- Material response changes the failure interpretation and curve shape; it does not change the applied stress demand.

## Educational status

This is a conceptual teaching demo only, not a code compliance calculator.
