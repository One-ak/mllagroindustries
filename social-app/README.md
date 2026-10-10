# Vansh Group Social Hub

Editable source for the social hub served at `/social/`.

Run `npm install` and `npm run build` in this directory. The build writes
versioned assets to `../social/assets/` and updates `../social/index.html`.
Commit the generated assets alongside the source so the existing Hostinger
deployment can serve the page without an additional production build step.

Company links, profile text and product content remain in `../social/data.json`.
Accessibility and video behavior is in `../social/social-hub-enhancements.js`.
