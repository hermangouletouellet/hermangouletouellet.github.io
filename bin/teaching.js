import fs from 'fs';
import path from 'path';
import beautify from "js-beautify";
import { PATHS } from "./config.js";

const beautifyOptions = {
    indent_size: 4,
    unformatted: ['p', 'a', 'span', 'time'],
    preserve_newlines: false,
    end_with_newline: false,
    decode_entities: false
}

const semesterStr = {
    "A": { "fr": "Automne", "en": "Fall" },
    "H": { "fr": "Hiver", "en": "Winter" },
    "E": { "fr": "Été", "en": "Summer" },
}

function buildSemester(entry,lang) {

    const semesterName = `${semesterStr[entry.semester[0]][lang]}`; 
    let semesterHtml = 
    `<tr>
    <th>${semesterName} ${entry.semester.slice(1)}
    </tr>`
    for (const course of entry.courses) {
        semesterHtml += 
        `<tr>
        <td><strong>${course.code} ‒ ${course.title}</strong>.</td>
        </tr>`;
    }

    return semesterHtml;
}

function buildTable(data,lang) {

    const html = data.map(s=>buildSemester(s,lang)).join("\n");
    const tableHtml = `<table id="teaching-table">\n${html}\n</table>`

    return beautify.html(tableHtml, beautifyOptions); 
}

const banner = `<!-- 
=============================================================================
AUTO-GENERATED FILE
Data: /data/teaching.json
Script: /teaching.js
=============================================================================
-->\n`;

const data = JSON.parse(fs.readFileSync(path.join(PATHS.data,"teaching.json"), 'utf8'));

for (const lang of ["fr","en"]) {
    const outputFile = path.join(PATHS.fragments, `teaching-${lang}.html`)
    fs.writeFileSync(outputFile, banner + buildTable(data,lang), 'utf8');
    console.log(`[${lang}] Wrote teaching fragment to ${outputFile}`);
} 

console.log('Teaching fragments generated successfully.');