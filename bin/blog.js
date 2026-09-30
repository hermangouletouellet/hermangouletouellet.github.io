import fs from 'fs';
import path from 'path';
import fm from "front-matter";
import { marked } from "marked";
import { PATHS, BEAUTIFY_OPTIONS } from "./config.js";
import beautify from 'js-beautify';

marked.use({
    gfm: true,
    breaks: false
});

const MAX_ITEMS = 5; // maximal number of items in blog main page

function findMdFiles( base ) {
    let files = fs.readdirSync(base);
    let result = [];

    for (const file of files){
        const newbase = path.join(base,file);
        if (fs.statSync(newbase).isDirectory()) {
            result.push(...findMdFiles(newbase));
        } else {
            if (file.endsWith(".md")) {
                result.push(newbase);
            }
        }
    }
    return result;
}

function createPost(filePath) {
    const markdown = fs.readFileSync(filePath, "utf8");
    const post = fm(markdown);

    const dateStr = post.attributes.date.toISOString().split('T')[0].replace(/-/g, '/');


    const postSummary = [
        `<article class="blog-summary">`,
        `<time class="gutter-date">${dateStr}</time>`,
        `<h2 class="blog-title">${post.attributes.title}</h2>`,
        `<div class="blog-description">`,
        `${marked.parse(post.attributes.description)}`,
        `</div>`,
        `</article>`
    ].join("\n")
        

    post.summary = beautify.html(postSummary, BEAUTIFY_OPTIONS);

    return post;
}

function buildPostsList() {
    let posts = findMdFiles(PATHS.blog).map(f => createPost(f));

    posts = posts.sort((a, b) => b.attributes.date - a.attributes.date);

    return posts;
}

function buildSummary(blog){
    return blog.map( post => post.summary ).join("\n\n");
}

const blog = buildPostsList();

const banner = [
    `<!--`,
    `================================================================`,
    `AUTO-GENERATED FILE`,
    `Content: /content/blog/`,
    `Script: /blog.js`,
    `================================================================`,
    `-->\n`
].join("\n");

const outputFile = path.join(PATHS.fragments, `blog.html`)
fs.writeFileSync(outputFile, banner + buildSummary(blog));
console.log(`Wrote blog fragment to ${outputFile}`);

console.log('Blog fragment generated successfully.');