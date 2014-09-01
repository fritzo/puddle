module.exports = {
    codes: [
        'ASSERT EQUAL APP VAR types.semi I I',
        'DEFINE VAR types.div APP VAR types.type K',
        'DEFINE VAR types.forall.push APP APP C I TOP',
        'DEFINE VAR util.join J',
            'ASSERT EQUAL APP APP C APP VAR util.pair BOT VAR' +
            ' util.join I',
            'ASSERT EQUAL APP APP C APP APP C VAR util.pair' +
            ' BOT VAR util.join I'
    ]
};