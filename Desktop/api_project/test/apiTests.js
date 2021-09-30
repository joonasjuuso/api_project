const { assert } = require('chai');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('../server');
const address = "http://localhost:3000"
chai.use(chaiHttp);


describe('ItemApi tests', function() {

    before(function() {
        server.start();
    })

    after(function() {
        server.close();
    })

    describe('GET items', function() {
        it('should return all items', function(done) {
            chai.request(address)
            .get('/items')
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);

                let found = false;

                if((res.body[0].title == "yes") &&
                    (res.body[0].description == "yes") && 
                    (res.body[0].category == "23") && 
                    (res.body[0].location == "4444") && 
                    (res.body[0].images[0] == "2" && res.body[0].images[1] == "2") && 
                    (res.body[0].price == "555") && 
                    (res.body[0].date == "124") && 
                    (res.body[0].delivery == "23") && 
                    (res.body[0].information == "2323")) {
                        done();
                    } else {
                        assert.fail("Data not received"); 
                    }
            })
        })
    })

    describe("POST signup", function() { 
        it('should create a user', function(done) {
            chai.request(address)
            .post('/signup')
            .send({ 
                username: "joonas", 
                password: "yes", 
                email: "joonas@gmail.com"
            })
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);

                expect(res.body).to.be.not.empty;
                expect(res.body.length).to.be.above(100);

                done();
            })
        })
    })
})
