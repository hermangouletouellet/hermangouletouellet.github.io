import fs from 'fs';
import path from 'path';
import beautify from "js-beautify";
import { PATHS, BEAUTIFY_OPTIONS } from "./config.js";

const langStr = {
    conference: { fr: "Conférences", en: "Conferences" },
    seminar: { fr: "Séminaires", en: "Seminars" },
    poster: { fr: "Affiches", en: "Posters" },
    online : {fr: "En ligne", en: "Online"},
    abstract : {fr: "Résumé", en: "Abstract"}
}

function buildTalk(entry,lang) {

    const formatter = new Intl.DateTimeFormat(lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const langNames = new Intl.DisplayNames([lang], { type: 'region' });


    let html = `<em>${entry.title}</em>. `;
    let countryStr = entry.country ? langNames.of(entry.country) : null;
    let dates = entry.date.split("/");
    let dateStr = dates[1]
        ? formatter.formatRange(new Date(dates[0]), new Date(dates[1]))
        : formatter.format(new Date(dates[0]));

    let locationInfo = [entry.venue, entry.location, countryStr, dateStr];
    html += locationInfo.filter(Boolean).join(", ") + ".";
    if (entry.online) html += ` ${langStr.online[lang]}.`

    return `<div class="content-inner">\n` + html + `\n</div>`;
}

function buildAbstractButton(entry, lang) {
    const abstractText = entry.abstract;
    if (!abstractText || typeof abstractText !== "string") {
        return { buttonHtml: "", abstractHtml: "" };
    }

    const abstractId = `abstract-${entry.id}`;

    const buttonHtml = `
        <button type="button" class="toggle" aria-expanded="false" aria-controls="${abstractId}" onclick="toggle(this)">
            <span>${langStr.abstract[lang]}</span>
            <span class="icon-toggle" aria-hidden="true">
                <span class="bar line-left"></span>
                <span class="bar line-right"></span>
            </span>
        </button>
    `.trim();

    const abstractHtml = `
        <div id="${abstractId}" class="toggle-target">
            <div class="abstract-inner">
                <div class="abstract-text">
                    ${abstractText}
                </div>
            </div>
        </div>
    `.trim();

    return { abstractButton: buttonHtml, abstractText: abstractHtml };
}

function buildItem(entry,lang) {

    const talkHtml = buildTalk(entry,lang);

    const { abstractButton, abstractText } = buildAbstractButton(entry, lang);

    let abstractHtml = "";
    if (abstractButton) {
        abstractHtml = [
            `<div class="content-ui">`,
            abstractButton,
            `</div>`,
            abstractText
        ].join("\n")
    }

    return [
        `<li>`,
        talkHtml,
        abstractHtml,
        `</li>`
    ].filter(Boolean).join("\n");
}

function buildSectionHeader(type,lang) {
    return [
        `<h2>`,
        langStr[type][lang],
        `</h2>`,
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
        group.sort((a, b) => {
            return new Date(b.date.split('/')[0]) - new Date(a.date.split('/')[0]);
        });
        listHtml.push(buildSectionHeader(type,lang));
        listHtml.push(`<ol class="content-list talk">`);
        listHtml.push(...group.map(data => buildItem(data,lang)));
        listHtml.push(`</ol>`)
    }

    return beautify.html(listHtml.join('\n'), BEAUTIFY_OPTIONS); 
}


const items = JSON.parse(fs.readFileSync(path.join(PATHS.data,"talks.json"), 'utf8'));

if (!fs.existsSync(PATHS.fragments)) {
    fs.mkdirSync(PATHS.fragments, { recursive: true })
};

const banner = `<!-- 
=============================================================================
AUTO-GENERATED FILE
Data: /data/talks.json
Script: /talks.js
=============================================================================
-->\n`;

for (const lang of ["fr","en"]) {
    const outputFile = path.join(PATHS.fragments, `talks-${lang}.html`);
    fs.writeFileSync(outputFile, banner+buildList(items, lang), 'utf8');
    console.log(`[${lang}] Wrote talks fragment to ${outputFile}`);
}

console.log('Talk fragments generated successfully.');