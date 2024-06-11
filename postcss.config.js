// postcss.config.js
module.exports = {
    plugins: {
        'postcss-pxtorem': {
            rootValue: 192,
            propList: ['*'],
            selectorBlackList: ['.ignore', '.no-rem']
        },
    },
};