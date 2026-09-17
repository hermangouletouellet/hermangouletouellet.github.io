import path from 'path';
import { fileURLToPath } from 'url';

export const ROOT_DIR = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)), '..'
);

export const PATHS = {
    root: ROOT_DIR,
    data: path.join(ROOT_DIR, 'data/'),
    newsfeed: path.join(ROOT_DIR, 'content/', 'newsfeed/'),
    fragments: path.join(ROOT_DIR, 'fragments'),
    assets: path.join(ROOT_DIR, 'assets/'),
    source: path.join(ROOT_DIR, 'source/'),
};

export const BEAUTIFY_OPTIONS = {
    indent_size: 4,
    wrap_line_length: 0,
    preserve_newlines: true,
    extra_liners: [],
    inline: ['a', 'span', 'em', 'strong']
};