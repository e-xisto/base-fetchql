
module.exports = {
    server: {
        host: 'SERVER_HOSTNAME',
        token: 'API_BEARER_TOKEN'
    },
    paths: {
        input: './PATH_TO_QUERIES_FILES',
        output: './PATH_TO_OUTPUT_FILES'
    },
    env: {
        iterableValue: ['Value1', 'Value2', '...'],
        fixedValue: 'Value'
    }
}

