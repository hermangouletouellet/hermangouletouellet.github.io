import fs from 'fs';
import path from 'path';
import beautify from 'js-beautify';
import { PATHS, BEAUTIFY_OPTIONS } from "./config.js";

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

function buildAbstractButton(entry, lang) {
    const abstractText = entry.abstract?.[lang] || entry.abstract?.en;
    if (!abstractText || typeof abstractText !== "string") {
        return { buttonHtml: "", abstractHtml: "" };
    }

    const abstractId = `abstract-${entry.id}`;
    const labelText = langStr?.abstract?.[lang] || (lang === "fr" ? "ABSTRACT" : "ABSTRACT");

    // Matches your navbar inline toggle logic exactly
    const onclickHtml = `this.setAttribute('aria-expanded', this.getAttribute('aria-expanded') === 'false' ? 'true' : 'false')`;

    const buttonHtml = `
        <button type="button" class="abstract-toggle" aria-expanded="false" aria-controls="${abstractId}" onclick="${onclickHtml}">
            <span>${labelText}</span>
            <span class="icon-toggle" aria-hidden="true">
                <span class="bar line-left"></span>
                <span class="bar line-right"></span>
            </span>
        </button>
    `.trim();

    const abstractHtml = `
        <div id="${abstractId}" class="abstract-wrapper">
            <div class="abstract-inner">
                ${abstractText}
            </div>
        </div>
    `.trim();

    return { abstractButton: buttonHtml, abstractText: abstractHtml };
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

    return `<div class="pub-content">\n` + html + `\n</div>`;
}

function buildItem(entry,lang) {

    const citationHtml = buildCitation(entry,lang);

    const links = [
        buildArxivLink(entry.arxiv,lang),
        buildDoiLink(entry.doi,lang),
        buildHalLink(entry.hal,lang),
        buildUrlLink(entry.url,lang)
    ];
    const linksHtml = links ? `<div class="pub-links">${links.join("")}</div>` : null;

    let {abstractButton, abstractText} = buildAbstractButton(entry,lang);

    return [
        `<li>`,
        citationHtml,
        `<div class="pub-ui">`,
        abstractButton,
        linksHtml,
        `</div>`,
        abstractText,
        `</li>`
    ].filter(Boolean).join("\n");
}

    function buildSectionHeader(type,lang) {
        return [
            `<h1>`,
            langStr[type][lang],
            `</h1>`
        ].join("\n");
    }

function buildList(items,lang) {

    const groups = {};
    for (const item of items) {
        if (!groups[item.type]) groups[item.type] = [];
        groups[item.type].push(item);
    }

    let listHtml = [];

    for (const type in groups) {
        const group = groups[type];
        if (!group) continue;
        group.sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10));
        
        listHtml.push(buildSectionHeader(type,lang));
        listHtml.push(`<ol class="content-list pub">`);
        listHtml.push(...group.map(row => buildItem(row,lang)));
        listHtml.push(`</ol >`);
    }

    return beautify.html(listHtml.join('\n'), BEAUTIFY_OPTIONS); 
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
    fs.writeFileSync(outputFile, banner + buildList(rows, lang), 'utf8');
    console.log(`[${lang}] Wrote publications fragment to ${outputFile}`);
} 

console.log('Publication fragments generated successfully.');