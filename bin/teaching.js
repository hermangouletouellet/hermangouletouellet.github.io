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
    "A": { "fr": "A", "en": "F" },
    "H": { "fr": "H", "en": "W" },
    "E": { "fr": "É", "en": "S" },
}

function buildSemester(entry,lang) {

    const semesterName = semesterStr[entry.semester[0]][lang];
    const semesterYear = entry.semester.slice(1); 
    const semesterCourses=entry.courses.map( 
        (c) => `<div class="course">${c.code} ‒ <em>${c.title}</em>.</div>`
    ).join("\n");

    return [
        `<time class = "gutter-date">${semesterName}-${semesterYear}</time>`,
        `<div class = "course-list">`,
        semesterCourses,
        `</div>`
    ].join("\n")

}

function buildContent(data,lang) {

    const html = data.map(s=>buildSemester(s,lang)).join("\n");
    return beautify.html(html, beautifyOptions); 
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
    fs.writeFileSync(outputFile, banner + buildContent(data,lang), 'utf8');
    console.log(`[${lang}] Wrote teaching fragment to ${outputFile}`);
} 

console.log('Teaching fragments generated successfully.');