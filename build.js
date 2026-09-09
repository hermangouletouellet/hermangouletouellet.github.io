/**
 * FRAGMENT INJECTION BUILD SCRIPT
 *
 * Injects HTML fragments from /assets/fragments/[name].html inside markers:
 *   <!-- fragment:name -->
 *   ... (content) ...
 *   <!-- /fragment:name -->
 * 
 * INFORMATION
 * - HTML files in /assets/fragments/ are ignored during by the script
 * - Content within a valid marker pair is overwritten on each run
 * 
 * WARNINGS
 * - Missing fragment file: logs a warning and leaves markers untouched
 * 
 * ERRORS
 * - Nested markers: forbidden, considered malformed
 * - Mismatched pairs: malformed (opened/unclosed, closed/unopened)
 * - Files with malformed markers are skipped to avoid HTML corruption
 * - Any warning or error triggers writing to logs/build.log
 */

const fs = require('fs');
const path = require('path');

const FRAGMENTS_DIR = path.join(__dirname, 'assets', 'fragments');
const fragmentCache = new Map();

const IS_STRIP_MODE = process.argv.includes('--strip');

function getFragment(name) {
    if (!fragmentCache.has(name)) {
        const fragmentPath = path.join(FRAGMENTS_DIR, `${name}.html`);
        if (fs.existsSync(fragmentPath)) {
            fragmentCache.set(name, fs.readFileSync(fragmentPath, 'utf8'));
        } else {
            fragmentCache.set(name, null);
        }
    }
    return fragmentCache.get(name);
}

function validateTags(html, filePath) {

    const tagRegex = /<!-- (\/?)fragment:([\w-]+) -->/g ;
    let tags = [] ;

    let match = tagRegex.exec(html) ;
    while (match !== null) {
        tags.push( {closes:match[1]==="/", name:match[2], raw:match[0]} ) ;
        match = tagRegex.exec(html) ;
    }

    if (tags.length %2 != 0) {
        throw new Error(`Malformed markers in ${filePath}: Odd number of tags (${tags.length}). Unmatched tag present.`);
    };

    for (let i=0 ; i<tags.length; i+=2) {
        if (tags[i].closes) {
            throw new Error(`Malformed markers in ${filePath}: Unexpected closing tag '${tags[i].raw}'.`);
        } else if (!tags[i+1].closes) {
            throw new Error(`Malformed markers in ${filePath}: Found nested tag '${tags[i+1].raw}' inside '${tags[i].raw}'`);
        } else if (tags[i].name !== tags[i+1].name) {
            throw new Error(`Malformed markers in ${filePath}: Unexpected closing tag '${tags[i+1].raw}'.`);
        }
    }
}

function processHtmlFile(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');

    try {
        validateTags(html, path.relative(__dirname, filePath));
    } catch (err) {
        console.error(`[ERROR] ${err.message}`);
        return;
    }

    const fragmentRegex = /<!-- fragment:([\w-]+) -->[\s\S]*?<!-- \/fragment:\1 -->/g;

    const updatedHtml = html.replace(fragmentRegex, (match, fragmentName) => {

        if (IS_STRIP_MODE) {
            return `<!-- fragment:${fragmentName} -->\n<!-- /fragment:${fragmentName} -->`;
        }

        const content = getFragment(fragmentName);

        if (content === null) {
            const warnMsg = `[WARN] Fragment '${fragmentName}' referenced in ${path.relative(__dirname, filePath)} does not exist.`;
            console.warn(warnMsg);
            return match; 
        } else {
            return `<!-- fragment:${fragmentName} -->\n${content}\n<!-- /fragment:${fragmentName} -->`;
        }
    });

    if (html !== updatedHtml) {
        fs.writeFileSync(filePath, updatedHtml, 'utf8');
        console.log(`Updated: ${path.relative(__dirname, filePath)}`);
    }
}

function processDirectory(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
            if (['node_modules', '.git', '.github', 'assets'].includes(entry.name)) continue;
            if (path.resolve(fullPath) === FRAGMENTS_DIR) continue;
            processDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            processHtmlFile(fullPath);
        }
    }
}

processDirectory(__dirname);
console.log('Build finished.');