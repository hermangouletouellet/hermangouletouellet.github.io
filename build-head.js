import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

const headContent = readFileSync(join(__dirname, '_head.html'), 'utf8');

function processDirectory(currentDir) {
    const entries = readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);

        if (entry.isDirectory()) {
            if (['node_modules', '.git', '.github'].includes(entry.name)) continue;
            processDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            injectHead(fullPath);
        }
    }
}

function injectHead(htmlFilePath) {
    let html = readFileSync(htmlFilePath, 'utf8');


    if (html.includes('<!-- NO-HEAD-INJECT -->')) {
        console.log(`Skipped (excluded): ${path.relative(rootDir, htmlFilePath)}`);
        return;
    }

    const headBlockRegex = /<!-- HEAD_START -->[\s\S]*?<!-- HEAD_END -->/;
    let updatedHtml;

    if (headBlockRegex.test(html)) {
        updatedHtml = html.replace(headBlockRegex, headContent.trim());
    } else {
        updatedHtml = html.replace('</head>', `    ${headContent.trim()}\n</head>`);
    }

    if (html !== updatedHtml) {
        fs.writeFileSync(htmlFilePath, updatedHtml, 'utf8');
        console.log(`Synced head in: ${path.relative(rootDir, htmlFilePath)}`);
    }
}

processDirectory(__dirname);
console.log('Build complete: HTML files updated.');