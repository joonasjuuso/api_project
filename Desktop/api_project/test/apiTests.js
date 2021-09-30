const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('../server');
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
            chai.request('http://localhost:3000')
            .get('/items')
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            })
        })
    })
})
