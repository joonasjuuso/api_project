var assert = require('assert');
const server = require('../server');
const bcrypt = require('bcryptjs');

describe('Server tests', function() {
    describe('Create user', function() {
        it('should create a user', function() {
            server.setToTesting();
            const user = server.generateUser("moro");
            assert.equal(bcrypt.compareSync("moro",user.password), true)
        })
    })
})