import fs from 'fs';
import path from 'path';
import fm from "front-matter";
import { marked } from "marked";
import { PATHS } from "./config.js";
import beautify from 'js-beautify';

marked.use({
    gfm: true,
    breaks: false
});

const beautifySettings = {
    indent_size: 4,
    unformatted: ['p', 'a', 'span', 'time'],
    preserve_newlines: false,
    end_with_newline: false,
    decode_entities: false
}

const EXPIRATION_MONTHS = 6; // how many months news item should persist
const MAX_ITEMS = 5; // maximal number of items in newsfeed

function createPost(filePath) {
    const markdown = fs.readFileSync(filePath, "utf8");
    const post = fm(markdown);
    const postHtml = 
        `<tr>
        <th class="news-title">${post.attributes.title}</th>
        <th class="news-date">${post.attributes.date}</th>
        </tr>
        <tr>
        <td colspan="2" class="news-body">
        ${marked.parse(post.body)}
        </td>
        </tr>`;
    post.html = beautify.html(postHtml,beautifySettings); 
    post.date = new Date(post.attributes.date);
    return post;
}

function buildPostsQueue(lang, expirationMonths, maxItems) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - expirationMonths);

    const cutoffYear = cutoffDate.getFullYear();
    let currentYear = new Date().getFullYear();

    const queue = [];

    while (currentYear >= cutoffYear) {
        const yearDir = path.join(PATHS.newsfeed,currentYear.toString());

        if (fs.existsSync(yearDir)) {
            
            let yearPosts = fs.readdirSync(yearDir);
            yearPosts = yearPosts.filter(f => f.endsWith('.md'));
            yearPosts = yearPosts.map(f => createPost(path.join(yearDir,f)));
            yearPosts = yearPosts.filter(f => f.attributes.language === lang);
            yearPosts = yearPosts.sort(
                (a, b) => b.date - a.date
            );

            for (const post of yearPosts) {
                if (post.date >= cutoffDate) {
                    if (queue.length < maxItems) {
                        queue.push(post);
                    } else {
                        return queue;
                    }
                } else {
                    break;
                }
            }
        }

        currentYear--;
    }

    return queue;
}

function buildNewsfeed(lang, expirationMonths, maxItems) {
    const queue = buildPostsQueue(lang, expirationMonths, maxItems);
    if (queue.length === 0){
        const emptyMsg = lang === 'fr' ? 'Aucune nouvelle récente.' : 'No recent news.';
        return `<p>${emptyMsg}</p>`;
    }

    const tableRows = queue.map(post => post.html).join('\n\n');
    return `<table class="newsfeed-table">\n${tableRows}\n</table>`;
}

const banner = `<!-- 
=============================================================================
AUTO-GENERATED FILE
Content: /content/newsfeed/
Script: /newsfeed.js
=============================================================================
-->\n`;

for (const lang of ["fr","en"]) {
    const outputFile = path.join(PATHS.fragments, `newsfeed-${lang}.html`)
    fs.writeFileSync(outputFile, banner + buildNewsfeed(lang, EXPIRATION_MONTHS, MAX_ITEMS), { encoding:'utf8'});
    console.log(`[${lang}] Wrote newsfeed fragment to ${outputFile}`);
} 

console.log('Newsfeed fragments generated successfully.');