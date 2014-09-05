'use strict';
var assert = require('assert');
var Crud = require('../index.js');
var uuid = require('node-uuid');

describe('Crud instance', function () {
    this.timeout(2000);
    var crud;
    var id;
    var object;
    beforeEach(function () {
        id = uuid();
        crud = new Crud();
        object = {code: 'I\'m an object'};
    });
    describe('create', function () {
        describe('throws if ', function () {
            it('ID or Object are not passed', function () {
                assert.throws(function () {
                    crud.create();
                });
            });
            it('passed ID is not a string', function () {
                assert.throws(function () {
                    crud.create(1, object);
                });

                assert.throws(function () {
                    crud.create([], object);
                });

                assert.throws(function () {
                    crud.create({}, object);
                });
            });
            it('same ID passed twice', function () {
                var obj = {};
                var id = uuid();
                assert.throws(function () {
                    crud.create(id, obj);
                    crud.create(id, obj);
                });
            });
        });
        it('re-emits same object', function (done) {
            crud.on('create', function (newId, newObject) {
                assert.equal(newObject, object);
                assert.equal(newId, id);
                done();
            });
            crud.create(id, object);
        });
    });
    describe('remove', function () {
        describe('throws if ', function () {
            it('ID not passed', function () {
                assert.throws(function () {
                    crud.remove();
                });
            });
            it('passed ID is not a string', function () {
                assert.throws(function () {
                    crud.remove(1);
                });
                assert.throws(function () {
                    crud.remove([]);
                });
                assert.throws(function () {
                    crud.remove({});
                });
            });
            it('passed ID of non existent object', function () {
                assert.throws(function () {
                    crud.remove(id);
                });
            });
        });
        it('re-emits removed object and ID', function (done) {

            crud.on('remove', function (removedId, removedObject) {
                assert.equal(removedObject, object);
                assert.equal(removedId, id);
                done();
            });
            crud.create(id, object);
            crud.remove(id);
        });
    });
    describe('update', function () {
        describe('throws if ', function () {
            it('ID not passed', function () {
                assert.throws(function () {
                    crud.update();
                });
            });
            it('passed ID is not a string', function () {
                assert.throws(function () {
                    crud.update(1);
                });
                assert.throws(function () {
                    crud.update([]);
                });
                assert.throws(function () {
                    crud.update({});
                });
            });
            it('passed ID of non existent object', function () {
                assert.throws(function () {
                    crud.update(id);
                });
            });
            it('Object not passed', function () {
                assert.throws(function () {
                    crud.create(id,object);
                    crud.update(id);
                });
            });
        });
        it('re-emits updated object and ID', function (done) {
            var oldObject = 'Old';
            var newObject = 'New';
            crud.on('update', function (updatedId, updatedObject) {
                assert.equal(updatedObject, newObject);
                assert.equal(updatedId, id);
                done();
            });
            crud.create(id, oldObject);
            crud.update(id, newObject);
        });
    });
    describe('constructor', function () {
        it('throws if not a hash given', function () {
            var c;
            assert.throws(function () {
                c = new Crud('');
            });
            assert.throws(function () {
                c = new Crud([]);
            });
            assert.throws(function () {
                c = new Crud(1);
            });
        });
        it('throws if called without New', function () {
            assert.throws(function () {
                Crud();
            });
        });

    });
    describe('getState', function () {
        it('returns internal state', function () {
            var hash = {};
            hash[id] = object;
            var crud = new Crud(hash);
            assert.equal(crud.getState(), hash);
        });

    });
//
//    describe('chaning', function () {
//        var one;
//        var two;
//        var three;
//        beforeEach(function () {
//            one = new Crud();
//            two = new Crud();
//            three = new Crud();
//        });
//        it('Method called on one side of the chain emits on the other',
//            function (done) {
//                two.connect(one);
//                three.connect(two);
//                three.on('create', function () {
//                    done();
//                });
//                two.create(id, object);
//            });
//    });
});