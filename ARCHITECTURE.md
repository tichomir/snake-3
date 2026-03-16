# Hello World — Architecture Design Note

## File Structure

```
index.html   — entry point; HTML skeleton
style.css    — presentation layer (separated for clarity and cacheability)
main.js      — behaviour layer (minimal; logs to console)
```

Keeping HTML, CSS, and JS in separate files follows the single-responsibility
principle and makes each concern independently testable/replaceable, even at
this trivial scale.

## Static vs Served

**Decision: plain static files, no build step or server process.**

Rationale:
- A Hello World app has zero dynamic requirements.
- Any browser can open `index.html` directly (`file://`) without a server.
- For CI/CD preview/deploy a static host (GitHub Pages, Netlify, S3) is
  sufficient and has no runtime attack surface.
- A server process would add complexity (Node/Python version pinning, port
  management) with no benefit at this scope.

If the project grows to require API calls or server-side rendering, introduce
a lightweight dev server (e.g. `npx serve` or Vite) at that point.

## CI/CD Pipeline Stages

| Stage   | Tool / Command            | Purpose                                      |
|---------|---------------------------|----------------------------------------------|
| Lint    | `npx htmlhint index.html` | Catch malformed HTML                         |
| Test    | `npx jest` (or none yet)  | Unit/integration tests (placeholder for now) |
| Build   | _none required_           | No compilation; files are deploy-ready as-is |
| Deploy  | Upload to static host     | Push `index.html`, `style.css`, `main.js`    |

For the initial workflow validation, the pipeline simply verifies the files
are present and well-formed, then deploys to the static host.

## Assumptions

- No package manager or bundler is introduced until there is a concrete need.
- The `test` stage is listed as a future hook; no tests exist yet for a
  three-line app.
- All pipeline tooling versions will be pinned in CI config (e.g.
  `.github/workflows/ci.yml`) when that stage is added.
