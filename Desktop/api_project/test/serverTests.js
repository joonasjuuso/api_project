var assert = require('assert');
const server = require('../server');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const cookieParser = require('cookie-parser');

describe('Server tests', function() {
    describe('Create user', function() {
        it('should create a user', function() {
            server.setToTesting();
            const user = server.generateUser("moro");
            assert.equal(bcrypt.compareSync("moro",user.password), true)
        })
    })
    describe('Check first letter', function() {
        it('should return true for this string', function() {
            assert.equal(server.startsWithCapital("Moi"), true);
        })
        it('should return false for this string', function() {
            assert.equal(server.startsWithCapital("moro"), false)
        })
    })
})