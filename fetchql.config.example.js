
module.exports = {
    server: {
        debug: false,
        host: 'SERVER_HOSTNAME',
        perPage: 100,
        token: 'API_BEARER_TOKEN'
    },
    paths: {
        input: './PATH_TO_QUERIES_FILES',
        output: './PATH_TO_OUTPUT_FILES'
    },
    env: {
        iterableValue: ['Value1', 'Value2', '...'],
        fixedValue: 'Value'
    },
    plugins: [],
    queries: {}
}

