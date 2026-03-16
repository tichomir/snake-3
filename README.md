# test6 — Hello World

A minimal Hello World web app built to validate the full development workflow.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Entry point — HTML skeleton |
| `style.css` | Presentation layer |
| `main.js` | Behaviour layer — logs "Hello, World!" to the console |
| `ARCHITECTURE.md` | Architecture decisions and CI/CD pipeline design |

## Running

Open `index.html` directly in a browser (`file://` — no server required).

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for design decisions, including the rationale for plain static files (no build step), and the planned CI/CD pipeline stages (lint → test → deploy).
