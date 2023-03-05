// eslint-disable-next-line import/no-default-export
module.exports = {
    env: {
        node: true,
    },
    root: true,
    plugins: ['prettier', '@typescript-eslint/eslint-plugin'],
    extends: [
        // JS base
        'eslint:recommended',
        // TS
        'plugin:@typescript-eslint/recommended',
        // Prettier
        'prettier',
    ],
    rules: {
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                accessibility: 'explicit',
                overrides: {
                    accessors: 'explicit',
                    constructors: 'no-public',
                    methods: 'explicit',
                    properties: 'off',
                    parameterProperties: 'explicit',
                },
            },
        ],
        '@typescript-eslint/no-explicit-any': 'off',
        // == and != restrictions
        eqeqeq: 1,
        // Production rules
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        // Comment formatting
        'spaced-comment': ['error', 'always', { exceptions: ['-', '+'] }],
        // Fixing false positive end of line error after git
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
            },
        ],
    },
};
