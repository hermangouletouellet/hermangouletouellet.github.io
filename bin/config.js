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