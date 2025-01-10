const config = {
    type: 'app',
    name: 'data-migration',
    id: 'a4cd3827-e717-4e09-965d-ab05df2591e5',
    title: 'Data Migration',

    minDHIS2Version: '2.39',

    pwa: {
        enabled: true,
        caching: {
            patternsToOmitFromAppShell: [/.*/],
        },
    },

    entryPoints: {
        app: './src/AppWrapper.js',
        plugin: './src/PluginWrapper.js',
    },
}

module.exports = config
