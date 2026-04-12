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

When you push to the `main` branch, it will:

* install dependencies
* build the site
* publish the built `dist` folder to GitHub Pages
