const fs = require('fs');
const path = require('path');
const beautify = require('js-beautify');
const pkg = require('./package.json');

const LANG_STR = {
    journal: { fr: "Revues scientifiques", en: "Peer-reviewed journals" },
    proceedings: { fr: "Actes de conférences", en: "Conference proceedings" },
    preprint: { fr: "Prépublications", en: "Preprints" },
    thesis: { fr: "Thèse", en: "Thesis" },
    abstract: { fr: "Résumé", en: "Abstract" },
    and: { fr: "et", en: "and"},
    in: { fr: "dans", en: "in" },
    ed: { fr: "éd. par", en: "ed. by" },
};

const PUB_TYPES = ["journal", "proceedings", "preprint", "thesis"];

function buildArxivLink(arxivId,lang) {
    if (!arxivId) return "";
    let url = `https://arxiv.org/abs/${arxivId}`
    let tooltip = (lang === "en") ? "View on arXiv" : "Voir sur arXiv";
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" title="${tooltip}"> arXiv </a>`;
}

function buildDoiLink(doi,lang) {
    if (!doi) return "";
    let url = `https://doi.org/${doi}`
    let tooltip = (lang === "en") ? "DOI link" : "Lien DOI";
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" title="${tooltip}"> doi </a>`;
}

function buildHalLink(halId,lang) {
    if (!halId) return "";
    let url = `https://hal.science/${halId}`
    let tooltip = (lang === "en") ? "View on HAL" : "Voir sur HAL" ;
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" title="${tooltip}"> hal </a>`;
}

function buildUrlLink(url,lang) {
    if (!url) return "";
    let tooltip = (lang === "en") ? "Citation URL" : "URL de la citation";
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" title="${tooltip}"> url </a>`;
}

function buildCitation(row,lang) {
    let authorStr = (row.authors.length>1) 
        ? [row.authors.slice(0,-1).join(", "),row.authors.slice(-1)[0]].join(` ${LANG_STR.and[lang]} `)
        : row.authors[0];

    let html = `${authorStr}. <em>${row.title}</em>,`;

    if (row.type === "journal" && row.journal) {
        html += ` ${row.journal}` ;
        html += (row.volume) ? `, <strong>${row.volume}</strong> (${row.year})` : ` (${row.year})` ;
        if (row.issue) html += `, no. ${row.issue}`;
        if (row.artno) html += `, art. ${row.artno}`;
        if (row.pages) html += `, pp. ${row.pages}`;
        html += ".";

    } else if (row.type === "proceedings") {
        html += ` ${LANG_STR.in[lang]}: <em>${row.booktitle}</em>`;
        if (row.editors) html += `, ${LANG_STR.ed[lang]}: ${row.editors}`;
        html += ` (${row.year})`
        if (row.series) html += `, ${row.series}`;
        if (row.volume) html += `, vol. ${row.volume}`;
        if (row.artno) html += `, art. ${row.artno}`;
        if (row.pages) html += `, pp. ${row.pages}`;
        html += ".";

    } else if (row.type === "thesis") {
        html += ` <em>${row.institution}</em>, ${row.year}.`;
        
    } else if (row.year) {
        html += ` ${row.year}.`;
    }

    return html;
}

function buildRow(row,lang) {

    const citationHtml = buildCitation(row,lang);

    const links = [
        buildArxivLink(row.arxiv,lang),
        buildDoiLink(row.doi,lang),
        buildHalLink(row.hal,lang),
        buildUrlLink(row.url,lang)
    ];
    linksHtml = links ? `<div class="pub-links">${links.join("")}</div>` : null;

    const abstractText = row.abstract?.[lang] || row.abstract?.en;
    let abstractHtml = null;
    let checkboxHtml = null;

    if (abstractText && typeof abstractText === "string") {
        abstractHtml = [
            `<div id="${row.id}" class="abstract-wrapper">`,
            `<div class="abstract-inner">`,
            `${abstractText}`,
            `</div>`,
            `</div>`
        ].join("\n");
        onclickHtml = `document.getElementById('${row.id}').classList.toggle('is-expanded', this.checked)`
        checkboxHtml = `<input type="checkbox" onclick="${onclickHtml}">`;
    }   

    return [
        `<tr>`,
        `<td>`,
        citationHtml,
        linksHtml,
        abstractHtml,
        `</td>`,
        `<td style="text-align:center;">`,
        checkboxHtml,
        `</td>`
    ].filter(Boolean).join("\n");
}

    function buildSectionHeader(type,lang) {
        return [
            `<tr>`,
            `<th>`,
            LANG_STR[type][lang],
            `</th>`,
            `<th style="text-align: center; width: 8ex;">`,
            LANG_STR.abstract[lang],
            `</th>`,
            `</tr>`
        ].join("\n");
    }

function buildTable(rows,lang) {

    const groups = {};
    for (const row of rows) {
        if (!groups[row.type]) groups[row.type] = [];
        groups[row.type].push(row);
    }

    let rowsHtml = [];

    for (const type of PUB_TYPES) {
        const group = groups[type];
        if (!group) continue;
        group.sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10));
        
        rowsHtml.push(buildSectionHeader(type,lang));
        rowsHtml.push(...group.map(row => buildRow(row,lang)));
    }

    tableHtml = `<table id="pub-table">\n${rowsHtml.join('\n')}\n</table>`

    return beautify.html(tableHtml, {
        indent_size: 4,
        wrap_line_length: 0,
        preserve_newlines: true,
        extra_liners: [],
        inline: ['a', 'span', 'em', 'strong'] 
    }); 
}


const dataPath = path.join(__dirname, pkg.config.DATA_DIR);
const fragmentsPath = path.join(__dirname, pkg.config.FRAGMENTS_DIR);

const rows = JSON.parse(fs.readFileSync(path.join(dataPath,"publications.json"), 'utf8'));


if (!fs.existsSync(fragmentsPath)) fs.mkdirSync(fragmentsPath, { recursive: true });

fs.writeFileSync(path.join(fragmentsPath, 'publications-fr.html'), buildTable(rows, 'fr'), 'utf8');
fs.writeFileSync(path.join(fragmentsPath, 'publications-en.html'), buildTable(rows, 'en'), 'utf8');

console.log('Publication fragments generated successfully.');