module.exports = {
    parser: 'postcss-scss',
    plugins: [
        require('postcss-sassy-import')(),
        require('autoprefixer')({
            cascade: false
        }),
        require('postcss-pxtorem')({
            root_value: 16,
            replace: true,
            propWhiteList: ['font', 'font-size', 'line-height', 'letter-spacing'],
            media_query: true
        })
    ]
}