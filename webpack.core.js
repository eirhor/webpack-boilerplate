var path = require('path');
var PrettierWebpackPlugin = require('prettier-webpack-plugin');
var PrettierConfig = require('./.prettierrc');

var modes = {
    production: 'production',
    development: 'development',
};

var applyIncludeExclude = function(rules, include, exclude) {
    if (!rules || rules.length === 0 || !include && !exclude) {
        return;
    }

    var newRules = [];

    for (let i = 0; i < rules.length; i++) {
        var clonedRule = rules[i];

        if (include) {
            clonedRule['include'] = include;
        }

        if (exclude) {
            clonedRule['exclude'] = exclude;
        }

        newRules.push(clonedRule);
    }

    return newRules;
};

var config = function(includePaths = undefined, excludePaths = /node_modules/) {
    this._entry = {};
    this._output = {
        path: path.resolve(__dirname, ''),
        filename: '[name].js'
    };
    this._mode = modes.production;
    this._resolve = {
        modules: ["node_modules"],
        extensions: ['.js', '.jsx', '.json', '.scss', '.css']
    };
    this._include = includePaths;
    this._exclude = excludePaths;
    this._developmentRules = [

    ];
    this._productionRules = [
        {
            test: /\.jsx?$/,
            use: {
                loader: 'babel-loader',
            }
        },
        {
            test: /\.(svg|woff|woff2|eot|gif|ttf|cur|png)$/,
            use: {
                loader: 'url-loader',
                options: {
                    name: 'static/[name].[hash].[ext]',
                    limit: 10000
                }
            },
        }
    ];
    this._developmentPlugins = [
        new PrettierWebpackPlugin(PrettierConfig)
    ];
    this._productionPlugins = [];
    this._target = 'web';
};

config.prototype.addStyleConfigs = function(mode) {
    var ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
    var extractTextPlugin = new ExtractTextWebpackPlugin({
        filename: '[name].css',
    });
    var rule = {
        test: /\.s?css$/,
        use: extractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
                {
                    loader: 'css-loader'
                },
                {
                    loader: 'postcss-loader'
                },
                {
                    loader: 'sass-loader',
                    options: {
                        options: {
                            sourceMap: mode === modes.production ? false : 'inline',
                            outputStyle: mode === modes.production ? 'compressed' : 'expanded'
                        }
                    }
                }
            ]
        })
    };

    if (mode === modes.production && this._productionPlugins && this._productionRules) {
        this._productionRules.push(rule);
        this._productionPlugins.push(extractTextPlugin);
    } else if (this._developmentPlugins && this._developmentRules) {
        this._developmentRules.push(rule);
        this._developmentPlugins.push(extractTextPlugin);
    }
    return this;
}

config.prototype.pushRule = function(rule, forDevelopment) {
    if (forDevelopment && this._developmentRules) {
        this._developmentRules.push(rule);
    } else if (this._productionRules) {
        this._productionRules.push(rule);
    }
    return this;
};

config.prototype.pushPlugin = function(plugin, forDevelopment) {
    if (forDevelopment && this._developmentPlugins) {
        this._developmentPlugins.push(plugin);
    } else if (this._productionPlugins) {
        this._productionPlugins.push(plugin);
    }
    return this;
};

config.prototype.addEntry = function(key, value) {
    if (this._entry) {
        this._entry[key] = value;
    }
    return this;
};

config.prototype.setOutputPath = function(path) {
    if (this._output && this._output.path) {
        this._output.path = path;
    }
    return this;
};

config.prototype.setOutputNameFormat = function(nameFormat) {
    if (this._output && this._output.filename) {
        this._output.filename = nameFormat;
    }
    return this;
};

config.prototype.setMode = function(mode) {
    if (this._mode) {
        this.mode = mode;
    }
    return this;
};

config.prototype.pushExtension = function(extension) {
    if (this._resolve && this._resolve.extensions) {
        this._resolve.extensions.push(extension);
    }
    return this;
};

config.prototype.changeTarget = function(target) {
    if (this._target) {
        this._target = target;
    }
    return this;
};

config.prototype.getConfig = function() {
    return {
        entry: this._entry,
        output: this._output,
        mode: this._mode,
        resolve: this._resolve,
        module: {
            rules: this._mode === modes.production ? applyIncludeExclude(this._productionRules, this._include, this._exclude) : applyIncludeExclude(this._productionRules.concat(this._developmentRules), this._include, this._exclude),
        },
        plugins: this._mode === modes.production ? this._productionPlugins : this._productionPlugins.concat(this._developmentPlugins),
        watch: this._mode !== modes.production,
        context: __dirname,
        target: this._target,
    }
};

module.exports = config;