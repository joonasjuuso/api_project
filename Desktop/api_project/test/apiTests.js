const { assert } = require('chai');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('../server');
const address = "http://localhost:3000"
chai.use(chaiHttp);

let token;

describe('ItemApi tests', function() {

    before(function() {
        server.start();
    })

    after(function() {
        server.close();
    })

    function getDefaultParamsForOneItem(res) {
        if((res.body.title == "yes") &&
                    (res.body.description == "yes") && 
                    (res.body.category == "kirja") && 
                    (res.body.location == "Oulu") && 
                    (res.body.images[0] == "2" && res.body.images[1] == "2") && 
                    (res.body.price == "555") && 
                    (res.body.date == "2021") && 
                    (res.body.deliverytype == "Pickup") && 
                    (res.body.username == "yes")  && 
                    (res.body.sellernumber == "0501234567")  && 
                    (res.body.selleremail == "yes@yes.com")) {
                        return true;
                    } else {
                        throw new Error("data not received"); 
                    }
    }

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
                    (res.body[0].category == "kirja") && 
                    (res.body[0].location == "Oulu") && 
                    (res.body[0].images[0] == "2" && res.body[0].images[1] == "2") && 
                    (res.body[0].price == "555") && 
                    (res.body[0].date == "2021") && 
                    (res.body[0].deliverytype == "Pickup") && 
                    (res.body[0].username == "yes") && 
                    (res.body[0].sellernumber == "0501234567") && 
                    (res.body[0].selleremail == "yes@yes.com")) {
                        done();
                    } else {
                        assert.fail("Data not received");
                    }
            })
        })
        it('should return 1 item based on category', function(done) {
            chai.request(address)
            .get('/items/kirja')
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);

                if(getDefaultParamsForOneItem(res)) {
                    done();
                }
            })
        })
        it('should return 1 item based on location', function(done) {
            chai.request(address)
            .get('/items/Oulu')
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);

                if(getDefaultParamsForOneItem(res)) {
                    done();
                }
            })
        })
        it('should return 1 item based on date', function(done) {
            chai.request(address)
            .get('/items/2021')
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);

                if(getDefaultParamsForOneItem(res)) {
                    done();
                }
            })
        })
        it('should fail with wrong parameter in item', function(done) {
            chai.request(address)
            .get('/items/Kuopio')
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(404);

                try {
                    getDefaultParamsForOneItem(res);
                } catch(error) {
                    expect(error.message).to.be.equal("data not received");
                    done();
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
                token = res.body.token;
                expect(err).to.be.null;
                expect(res).to.have.status(200);

                expect(res.body).to.be.not.empty;

                done();
            })
        })
        it('should return on duplicate username', function(done) {
            chai.request(address)
            .post('/signup')
            .send({ 
                username: "joonas", 
                password: "yes", 
                email: "joonas@gmail.com"
            })
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.be.empty;

                done();
            })
        })
    })

    describe("POST login and set items", function() {
        it('should login and set items', function(done) {
            chai.request(address)
            .post('/login')
            .auth('yes', 'yes')
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(201);

                token = res.body.token;
                let item = { title: "yes",
                description: "yes",
                category: "kirja",
                location: "Oulu",
                images: ["yksi", "kaksi"], 
                price: "555",
                date: "2021",
                deliverytype: "Pickup",
                username: "yes",
                sellernumber: "0501234567",
                selleremail: "yes@yes.com"}

                chai.request(address)
                .post('/items')
                .send(item)
                .set({Authorization: 'Bearer ' + token})
                .end(function(err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    done();
                })
                done();
            })
        })
    })
    
    describe("PUT signup and add a listing and modify that listing", function() {
        it('should modify the set listing', function(done) {
            chai.request(address)
            .post('/signup')
            .send({ 
                username: "joonass", 
                password: "yes", 
                email: "joonas@gmaail.com"
            })
            .end(function(err, res) {
                token = res.body.token;
                expect(err).to.be.null;
                expect(res).to.have.status(200);

                expect(res.body).to.be.have.property('token');

                token = res.body.token;
                let item ={ title: "yes",
                description: "yes",
                category: "kirja",
                location: "Oulu",
                images: ["yksi", "kaksi"], 
                price: "555",
                date: "2021",
                deliverytype: "Pickup",
                username: "joonass",
                sellernumber: "0501234567",
                selleremail: "yes@yes.com"}

                chai.request(address)
                .post('/items')
                .send(item)
                .set({Authorization: 'Bearer ' + token})
                .end(function(err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);

                    chai.request(address)
                    .get('/items')
                    .end(function(err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);

                        if(server.items[2] == item) {
                            chai.request(address)
                            .put('/items/' + server.items[2].itemid)
                            .send( { title: "moooo" })
                            .set({Authorization: 'Bearer ' + token})
                            .end(function(err, res) {
                                expect(err).to.be.null;
                                expect(res).to.have.status(200);
                                done();
                            })
                        }
                        else {
                            assert.fail();
                        }
                    })
                })
            })
        })
    })
})
