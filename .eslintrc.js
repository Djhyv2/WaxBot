module.exports = {
    env: {
        es6: true,
        node: true,
        jest: true,
    },
    extends: [
        'airbnb-base',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    rules: {
        'brace-style': [1, 'allman'], //Newline {
        yoda: [1, 'always'], //Literal on left of comparison
        'max-len': [0], //No max line length
        indent: [1, 4], //Use 4 spaces for a tab
        'spaced-comment': [1, 'never'], //Makes comments adjacent to // or /*
        'no-console': [0], //Allows console statements
        'prefer-destructuring': [0], //Does not prefer array destructuring
        'no-param-reassign': [0], //Allows Parameter reassignment
        'no-await-in-loop': [0], //Allows await in loops
    },
};
