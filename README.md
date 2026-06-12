# Piping Stress Illustration

Interactive static teaching app for piping stress concepts.

## Current module

`failure-strength-lab-v3` is the first saved module:

- Static loading tab uses a stress-strain (`σ–ε`) curve.
- Fatigue loading tab uses an S-N curve with `log10(N)` cycle mapping.
- Side view, local/cross-section view, curve panel, and interpretation panel are separated.
- Ductile and brittle material response changes the failure interpretation, not the applied stress demand.

## Run locally

```bash
cd failure-strength-lab-v3
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Educational status

This is a conceptual demonstration app only. It is not an ASME / B31.3 / B31.4 / B31.8 code-compliance calculator.
