import fs from 'fs';
import path from 'path';
import fm from "front-matter";
import { PATHS, BEAUTIFY_OPTIONS } from "./config.js";
import beautify from 'js-beautify';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
    html: true,  
    linkify: true,    
    typographer: false
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
    post.path = path.join("/blog/", String(post.attributes.date.getFullYear()), post.attributes.slug+".html");
    post.date = dateStr;

    const postSummary = [
        `<article class="blog-summary">`,
        `<time class="gutter-date">${post.date}</time>`,
        `<h2 class="blog-title">`,
        `<a href="${post.path}">${post.attributes.title}</a>`,
        `</h2>`,
        `<div class="blog-description">`,
        `${md.render(post.attributes.description)}`,
        `</div>`,
        `</article>`
    ].join("\n")
        

    post.summary = beautify.html(postSummary, BEAUTIFY_OPTIONS);

    return post;
}


function createPage(post) {
    const postUrl = path.join("https://hermangouletouellet.github.io/",post.path);
    let html = [
        `<!doctype html>`,
        `<html lang="fr-CA">`,
        `<head>`,
            `<meta name="description" content="${post.attributes.description}" />`,
            `<title> ${post.attributes.title} </title>`,
            `<link rel="canonical" href="${postUrl}" />`,
            `<link rel="alternate" hreflang="fr" href="${postUrl}" />`,
            `<!-- fragment:head -->`,
            `<!-- /fragment:head -->`,
            `<!-- fragment:mathjax -->`,
            `<!-- /fragment:mathjax -->`,
        `</head>`,
        `<body>`,
            `<!-- fragment:navbar-fr -->`,
            `<!-- /fragment:navbar-fr -->`,
            `<main class="blog-post">`,
                `<hgroup>`,
                `<h1>${post.attributes.title}</h1>`,
                `<h4>${post.attributes.description}</h4>`,
                `</hgroup>`,
                `<p>
                <time class="pub-date">PUBLIÉ: ${post.date}</time>
                </p>`,
                `<article class="blog-body">`,
                `${md.render(post.body)}`,
                `</article>`,
            `</main>`,
        `</body>`,
        `<!-- fragment:footer -->`,
        `<!-- /fragment:footer -->`,
        `<script>`,
        `document.addEventListener('DOMContentLoaded', () => {`,
        `const enBtn = document.querySelector('.navbar-lang a[href="en/"]');`,
        `if (enBtn) {`,
        `enBtn.removeAttribute('href'); // Removes link functionality & keyboard tab stop`,
        `enBtn.setAttribute('aria-disabled', 'true');`,
        `enBtn.setAttribute('title', 'Ce billet est disponible en français seulement');`,
        `enBtn.classList.add('is-disabled');`,
        `}`,
        `});`,
        `</script >`,
        `</html>`,
        ].join("\n");

    return beautify.html(html,BEAUTIFY_OPTIONS);

}

function buildPostsList() {
    let blog = findMdFiles(PATHS.blog).map(f => createPost(f));

    blog = blog.sort((a, b) => b.attributes.date - a.attributes.date);

    return blog;
}

function buildSummary(blog){
    return blog.map( post => post.summary ).join("\n\n");
}

const blog = buildPostsList();


for (const post of blog) {
    const outputFile = path.join(PATHS.root,post.path);
    if (!fs.existsSync(path.dirname(outputFile))) {
        fs.mkdirSync(path.dirname(outputFile));
    }
    fs.writeFileSync(outputFile, createPage(post));
}

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