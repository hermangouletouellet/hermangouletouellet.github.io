const fs = require('fs');
const path = require('path');
const FRAGMENTS_DIR = path.join(__dirname, require('./package.json').config.FRAGMENTS_DIR);

const pages = [
    { name: { fr: "Accueil", en: "Home" }, path: "/" },
    { name: { fr: "Publications", en: "Publications" }, path: "/publications/" },
    { name: { fr: "Exposés", en: "Talks" }, path: "/exposes/" },
];

function buildNavbar(lang) {
    isEn= lang==="en"

    const htmlLines = [`<div class="navbar">`];
    htmlLines.push(
        pages.map(x => {
            return `\t<a href="${x.path + (isEn ? 'en/' : '')}">${x.name[lang]}</a>`;
        })
    );
    htmlLines.push(`<div class="navbar-right">`)
    htmlLines.push(``)

    const linksHtml = pages.map(x => {
        return `\t<a href="${x.path + (isEn ? 'en/' : '')}">${x.name[lang]}</a>`;
    }).join('\n');

    const langToggleHtml = `<div class="navbar-right">
    <a href="${isEn ? '../' : './'}"${isEn ? '' : ' class="active"'}>fr</a>
    <a href="${isEn ? './' : 'en/'}"${isEn ? ' class="active"' : ''}>en</a>
</div>`;

    const activeStateScript = `<script src="/assets/scripts/activate-navbar.js" defer></script>`;

    return `<div class="navbar">\n${linksHtml}\n${langToggleHtml}\n</div>\n${activeStateScript}`;
}

fs.mkdirSync(FRAGMENTS_DIR, { recursive: true });
fs.writeFileSync(path.join(FRAGMENTS_DIR, 'navbar-fr.html'), buildNavbar('fr'), 'utf8');
fs.writeFileSync(path.join(FRAGMENTS_DIR, 'navbar-en.html'), buildNavbar('en'), 'utf8');

console.log('Generated: fragments/navbar-fr.html & fragments/navbar-en.html');