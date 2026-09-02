/**
 * Post-export step: inject PWA / add-to-home-screen tags into the exported
 * dist/index.html.
 *
 * Expo's web SPA output ("single") uses a fixed index.html template and does
 * not honour app/+html.tsx, so we add the manifest link and Apple meta tags
 * here instead. Idempotent — safe to run repeatedly.
 */
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error(`[inject-pwa] ${indexPath} not found — did "expo export" run first?`);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

if (html.includes('rel="manifest"')) {
  console.log('[inject-pwa] PWA tags already present — skipping.');
  process.exit(0);
}

const tags = `
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#FFF6E9" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Adopt" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
`;

// Widen the viewport so iOS respects the safe area under the notch.
html = html.replace(
  '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />',
  '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />',
);

html = html.replace('</head>', `${tags}  </head>`);

fs.writeFileSync(indexPath, html);
console.log('[inject-pwa] Injected PWA tags into dist/index.html');
