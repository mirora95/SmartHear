# Deployment Notes

## GitHub Pages

This project can be deployed to GitHub Pages as a static site.

What works well on Pages:

* the frontend UI
* microphone access, because GitHub Pages is served over HTTPS
* the fallback local sound classification already included in the app

Important limitation:

* a Gemini API key cannot be safely hidden in GitHub Pages frontend code

If you want real Gemini-powered classification in production, use a backend or serverless function and keep the API key there instead of exposing it in the browser.

## Included Workflow

The repository now includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

The workflow runs on pushes to `master` (the default branch) or when manually dispatched. It will:

* install dependencies
* build the site
* copy `dist/app.html` to `dist/index.html` so the Pages root opens the app
* publish the built `dist` folder to GitHub Pages

The Vite base path and service-worker fallback are configured for `/SmartHear/`. For local setup and preview URLs, see [Local development](README.md#local-development).
