module.exports = {
    corpus: {
        unsorted: [
                'DEFINE VAR types.exp COMP COMP COMP COMP APP CB VAR ' +
                'types.type APP CB B CB CB VAR types.type',
            'ASSERT EQUAL VAR types.div APP VAR types.type APP CI TOP',
            'DEFINE VAR types.div APP VAR types.type K'
        ].join('\n'),
        sorted: [
            'ASSERT EQUAL VAR types.div APP VAR types.type APP CI TOP',
            'DEFINE VAR types.div APP VAR types.type K',
                'DEFINE VAR types.exp COMP COMP COMP COMP APP CB VAR ' +
                'types.type APP CB B CB CB VAR types.type'
        ].join('\n'),
        nonUnique: [
            'ASSERT EQUAL VAR types.div APP VAR types.type APP CI TOP',
            'ASSERT EQUAL VAR types.div APP VAR types.type APP CI TOP'
        ].join('\n'),
        commentsTwo: [
            '# Comment here',
            '# Comment there',
            'ASSERT EQUAL VAR types.div APP VAR types.type APP CI TOP'
        ].join('\n'),
        commentsThree: [
            '# Comment here',
            '# Comment there',
            'ASSERT EQUAL VAR types.div APP VAR types.type APP CI TOP',
            '# Comment here and there'
        ].join('\n')

    },
    json: {
        nonUnique: JSON.stringify(
            {
                '14': 'ASSERT EQUAL VAR types.div APP VAR types.type ' +
                    'APP CI TOP',
                '15': 'ASSERT EQUAL VAR types.div APP VAR types.type ' +
                    'APP CI TOP'
            }
        )
    }
};