import Config from './webpack.core.js';
import path from 'path';

let modes = {
    production: 'production',
    development: 'development',
};

module.exports = env => {
    const mode = env.production ? modes.production : modes.development;

    return new Config()
        .setMode(mode)
        .addEntry('script', path.resolve(__dirname, 'react-js/src/index.js'))
        .getConfig();
};