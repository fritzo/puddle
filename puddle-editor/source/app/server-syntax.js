'use strict';
var assertNode = require('assert');
module.exports = {
    loadStatement:(function () {
        var switch_ = {
            'ASSERT': function (body) {
                return {'name': null, 'code': body};
            },
            'DEFINE': function (body) {
                var varName = body.split(' ', 2);
                assertNode.deepEqual(varName[0], 'VAR');
                var name = varName[1];
                var code = body.slice(4 + name.length + 1);
                return {'name': name, 'code': code};
            }
        };
        return function (string) {
            var prefix = string.split(' ', 1)[0];
            var body = string.slice(prefix.length + 1);
            return switch_[prefix](body);
        };
    })(),
    dumpStatement : function (statement) {
        //TODO this is an API difference hot-fix
        //syntax.compiler.dumpLine should give output compatible
        //with analyst and server-syntax?
        delete statement.token;
        if (!statement.name) {
            statement.name = null;
        }

        if (statement.name === null) {
            return 'ASSERT ' + statement.code;
        } else {
            return 'DEFINE VAR ' + statement.name + ' ' + statement.code;
        }
    }
};