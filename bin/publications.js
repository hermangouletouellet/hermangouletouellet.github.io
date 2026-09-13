import fs from 'fs';
import path from 'path';
import beautify from 'js-beautify';
import { PATHS } from "./config.js";

const langStr = {
    journal: { fr: "Revues scientifiques", en: "Peer-reviewed journals" },
    proceedings: { fr: "Actes de conférences", en: "Conference proceedings" },
    preprint: { fr: "Prépublications", en: "Preprints" },
    thesis: { fr: "Thèse", en: "Thesis" },
    abstract: { fr: "Résumé", en: "Abstract" },
    and: { fr: "et", en: "and"},
    in: { fr: "dans", en: "in" },
    ed: { fr: "éd. par", en: "ed. by" },
};

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
        ? [row.authors.slice(0,-1).join(", "),row.authors.slice(-1)[0]].join(` ${langStr.and[lang]} `)
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
        html += ` ${langStr.in[lang]}: <em>${row.booktitle}</em>`;
        if (row.editors) html += `, ${langStr.ed[lang]}: ${row.editors}`;
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
    const linksHtml = links ? `<div class="pub-links">${links.join("")}</div>` : null;

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
        const onclickHtml = `document.getElementById('${row.id}').classList.toggle('is-expanded', this.checked)`
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
            langStr[type][lang],
            `</th>`,
            `<th style="text-align: center; width: 8ex;">`,
            langStr.abstract[lang],
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

    for (const type in groups) {
        const group = groups[type];
        if (!group) continue;
        group.sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10));
        
        rowsHtml.push(buildSectionHeader(type,lang));
        rowsHtml.push(...group.map(row => buildRow(row,lang)));
    }

    const tableHtml = `<table id="pub-table">\n${rowsHtml.join('\n')}\n</table>`

    return beautify.html(tableHtml, {
        indent_size: 4,
        wrap_line_length: 0,
        preserve_newlines: true,
        extra_liners: [],
        inline: ['a', 'span', 'em', 'strong'] 
    }); 
}

const rows = JSON.parse(
    fs.readFileSync(path.join(PATHS.data,"publications.json"), 'utf8')
);


if (!fs.existsSync(PATHS.fragments)) {
    fs.mkdirSync(PATHS.fragments, { recursive: true });
}

const banner = `<!-- 
=============================================================================
AUTO-GENERATED FILE
Data: /data/publications.json
Script: /publications.js
=============================================================================
-->\n`;

for (const lang of ["fr","en"]) {
    const outputFile = path.join(PATHS.fragments, `publications-${lang}.html`)
    fs.writeFileSync(outputFile, banner + buildTable(rows, lang), 'utf8');
    console.log(`[${lang}] Wrote publications fragment to ${outputFile}`);
} 

console.log('Publication fragments generated successfully.');