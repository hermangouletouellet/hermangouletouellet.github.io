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
    post.date = new Date(post.attributes.date);

    const dateStr = post.date.toISOString().split('T')[0].replace(/-/g, '/');

    const postHtml = 
        `<article class="news-article">
        <time class="news-date">${dateStr}</time>
        <h2 class="news-title">${post.attributes.title}</h2>
        <div class="news-body">
        ${marked.parse(post.body)}
        </div>
        </article>`;
    post.html = beautify.html(postHtml,beautifySettings); 
    return post;
}

function buildPostsQueue(lang, expirationMonths, maxItems) {
    const currentDate = new Date();
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - expirationMonths);

    const cutoffYear = cutoffDate.getFullYear();
    let currentYear = currentDate.getFullYear();

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
                if (post.date <= currentDate) {
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

    const newsfeed = queue.map(post => post.html).join('\n\n');
    return newsfeed;
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