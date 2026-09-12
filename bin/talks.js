const fs = require('fs');
const path = require('path');
const beautify = require('js-beautify');
const pkg = require('../package.json');

const typeNames = {
    "conference": { "fr": "Conférences", "en": "Conferences" },
    "seminar": { "fr": "Séminaires", "en": "Seminars" },
    "poster": { "fr": "Affiches", "en": "Posters" },
}

const langStr = {
    "online" : {"fr": "En ligne", "en": "Online"},
    "abstract" : {"fr": "Résumé", "en": "Abstract"}
}

function buildTalk(row,lang) {

    const formatter = new Intl.DateTimeFormat(lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const langNames = new Intl.DisplayNames([lang], { type: 'region' });


    let html = `<em>${row.title}</em>. `;
    let countryStr = row.country ? langNames.of(row.country) : null;
    let dates = row.date.split("/");
    let dateStr = dates[1]
        ? formatter.formatRange(new Date(dates[0]), new Date(dates[1]))
        : formatter.format(new Date(dates[0]));

    let locationInfo = [row.venue, row.location, countryStr, dateStr];
    html += locationInfo.filter(Boolean).join(", ") + ".";
    if (row.online) html += `${langStr.online[lang]}.`

    return html;
}

function buildRow(row,lang) {

    const talkHtml = buildTalk(row,lang);

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
        talkHtml,
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
        typeNames[type][lang],
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
        group.sort((a, b) => {
            return new Date(b.date.split('/')[0]) - new Date(a.date.split('/')[0]);
        });
        rowsHtml.push(buildSectionHeader(type,lang));
        rowsHtml.push(...group.map(row => buildRow(row,lang)));
    }

    tableHtml = `<table id="talk-table">\n${rowsHtml.join('\n')}\n</table>`

    const banner = `<!-- 
=============================================================================
AUTO-GENERATED FILE
Data: /data/talks.json
Script: /talks.js
=============================================================================
-->\n`;

    return beautify.html(banner+tableHtml, {
        indent_size: 4,
        wrap_line_length: 0,
        preserve_newlines: true,
        extra_liners: [],
        inline: ['a', 'span', 'em', 'strong'] 
    }); 
}


const dataPath = path.join(__dirname, "../", pkg.config.DATA_DIR);
const fragmentsPath = path.join(__dirname, "../", pkg.config.FRAGMENTS_DIR);

const rows = JSON.parse(fs.readFileSync(path.join(dataPath,"talks.json"), 'utf8'));


if (!fs.existsSync(fragmentsPath)) fs.mkdirSync(fragmentsPath, { recursive: true });

fs.writeFileSync(path.join(fragmentsPath, 'talks-fr.html'), buildTable(rows, 'fr'), 'utf8');
fs.writeFileSync(path.join(fragmentsPath, 'talks-en.html'), buildTable(rows, 'en'), 'utf8');

console.log('Talk fragments generated successfully.');