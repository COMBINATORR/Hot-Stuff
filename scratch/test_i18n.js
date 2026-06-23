const fs = require('fs');

// Read i18n.js and extract the resources object
const content = fs.readFileSync('src/i18n.js', 'utf8');
const resourcesMatch = content.match(/const resources = ({[\s\S]*?});\r?\n\r?\nresources\.kk/);
if (!resourcesMatch) {
  console.error("Could not find resources object in i18n.js");
  process.exit(1);
}

// Evaluate resources
let resources;
try {
  eval("resources = " + resourcesMatch[1]);
} catch (e) {
  console.error("Failed to parse resources:", e);
  process.exit(1);
}

// Initialize i18next
const i18n = require('i18next');
i18n.init({
  resources,
  lng: 'ru',
  fallbackLng: 'ru',
  interpolation: { escapeValue: false }
}, (err, t) => {
  if (err) return console.error(err);
  console.log("RU:", t('header.free_shipping_hint', { amount: '21 100' }));
  
  i18n.changeLanguage('en', (err, t) => {
    console.log("EN:", t('header.free_shipping_hint', { amount: '21 100' }));
  });
});
