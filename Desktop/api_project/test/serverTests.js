var assert = require('assert');
const server = require('../server');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

describe('Server tests', function() {
    describe('Create user', function() {
        it('should create a user', function() {
            server.setToTesting();
            const user = server.generateUser("moro");
            assert.equal(bcrypt.compareSync("moro",user.password), true)
        })
    })
    describe('Create item', function() {
        it('should create an item', function() {
            server.setToTesting();
            server.generateItem();
            assert.equal((server.items[2].title == "testi") && 
            (server.items[2].description == "testi") && 
            (server.items[2].category == "testi") && 
            (server.items[2].location == "Suomi") && 
            (server.items[2].images[0] == "yksi" && server.items[2].images[1] == "kaksi") && 
            (server.items[2].price == "0") && 
            (server.items[2].date == "2021") &&
            (server.items[2].delivery == "Pickup") && 
            (server.items[2].information == "Joonas"), true)
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