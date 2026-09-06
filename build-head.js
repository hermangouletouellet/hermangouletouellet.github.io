const fs = require('fs');
const path = require('path');

const headContent = fs.readFileSync(path.join(__dirname, '_head.html'), 'utf8');

function processDirectory(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
            if (['node_modules', '.git', '.github'].includes(entry.name)) continue;
            processDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            injectHead(fullPath);
        }
    }
}

function injectHead(htmlFilePath) {
    let html = fs.readFileSync(htmlFilePath, 'utf8');


    if (html.includes('<!-- NO-HEAD-INJECT -->')) {
        console.log(`Skipped (excluded): ${path.relative(__dirname, htmlFilePath)}`);
        return;
    }

    const headBlockRegex = /<!-- HEAD_START -->[\s\S]*?<!-- HEAD_END -->/;
    let updatedHtml;

    if (headBlockRegex.test(html)) {
        updatedHtml = html.replace(headBlockRegex, () => headContent);
    } else {
        updatedHtml = html.replace('</head>', () => `${headContent}\n</head>`);
    }

    if (html !== updatedHtml) {
        fs.writeFileSync(htmlFilePath, updatedHtml, 'utf8');
        console.log(`Synced head in: ${path.relative(__dirname, htmlFilePath)}`);
    }
}

processDirectory(__dirname);
console.log('Build complete: HTML files updated.');