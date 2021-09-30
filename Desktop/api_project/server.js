const express = require('express');
const bodyParser = require('body-parser');
var fs = require('fs');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

var testing = false;

app.use(bodyParser.json());

const items = [ 
    {
        title: "yes",
        description: "yes",
        category: "23",
        location: "4444",
        images: ["2","2"],
        price: "555",
        date: "124",
        delivery: "23",
        information: "2323"
    },
    {
        title: "aaaa",
        description: "sdsdadsades",
        category: "23",
        location: "44353544",
        images: ["2","2"],
        price: "55567555",
        date: "124",
        delivery: "23",
        information: "2323" 
    }];

const users = [
    {
        username: "yes",
        password: "yes",
        email: "yes"
    }];

passport.use(new BasicStrategy(
    (username, password, done) => {
        const searchResult = users.find(user => {
           if(user.username = username)  {
               if(bcrypt.compareSync(password, user.password)) {
                   return true;
               }
           }
           return false;
        })
        if(searchResult != undefined) {
            done(null, searchResult);
        } else {
            done(null,false);
        }
    }
))

app.get('/', (req, res) => {
  res.send("Please sign in");
})

function setToTesting() {
    testing = true;
}

function generateUser() {
    const saltNumber = Math.floor(Math.random() * 6) + 1;
    const salt = bcrypt.genSaltSync(saltNumber);
    var password, username, email;

    if(testing) {
        username = "joonas";
        password = "moro";
        email = "joonas@gmail.com";
    } else {
        username = req.body.username
        password = req.body.password;
        email = req.body.email;
    }

    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = {
        userid: uuidv4(),
        username: username,
        password: hashedPassword,
        email: email
    }
    return newUser;
}

app.post('/signup', (req, res) => {

    newUser = generateUser()

    users.push(newUser)
    res.sendStatus(201)
})

const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { info } = require('console');
const jwtSecretKey = "mySecretKey"

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecretKey
};

passport.use(new JwtStrategy(options, (payload, done) => {

}));

app.get('/users', passport.authenticate('basic', { session: false}), (req, res) => {
    res.json(users)

});
app.post('/login', passport.authenticate('basic', { session: false}), (req, res) => {
    const token = jwt.sign({foo: "bar"}, jwtSecretKey);

    res.json({token: token})
})

app.get('/items', (req, res) => {
    res.json(items)
})

function generateItem() {
    var itemid, title, description, category, location, price, date, delivery, information;
    var images = [];
    if(testing) {
        itemid = uuidv4();
        title = "testi";
        description = "testi";
        category = "testi";
        location = "suomi";
        images = ["yksi", "kaksi"]
        price = "0";
        date = "2021";
        delivery = "Pickup";
        information = "Joonas";
    } else {
        itemid = uuidv4();
        title = req.body.title;
        description = req.body.description;
        category = req.body.category;
        location = req.body.location;
        images = req.body.images;
        price = req.body.price;
        date = req.body.date;
        delivery = req.body.delivery;
        information = req.body.information;
    }
    items.push(
        {   itemid: uuidv4(),
            title: title, 
            description: description,
            category: category,
            location: location,
            images: images,
            price: price,
            date: date, 
            delivery: delivery,
            information: information }
            );
}

app.post('/items',passport.authenticate('jwt', { session: false}), (req, res) => {
    if(!(req.body.title && req.body.description && req.body.price && 
        req.body.date && req.body.delivery && req.body.delivery)) {
            res.sendStatus(400).send("All input is required");
        }
    generateItem();
    res.sendStatus(201);
})

app.get('/items/:category', (req, res) => {
    const category = items.find(item => item.category === req.params.category)
    if(category == undefined) {
        res.sendStatus(404)
    } else {
        res.json(category)
    }
})

app.get('/items/:location', (req, res) => {
    const location = items.find(item => item.location === req.params.location)
    if(location == undefined) {
        res.sendStatus(404)
    } else {
        res.json(location)
    }
})

app.get('/items/:date', (req, res) => {
    const date = items.find(item => item.date === req.params.date)
    if(date == undefined) {
        res.sendStatus(404)
    } else {
        res.json(date)
    }
})

let serverInstance = null;

module.exports = {
    start: function() { 
        serverInstance = app.listen(port, () => { 
            console.log(`Example API listening on http://localhost:${port}\n`);
        })
    },
    close: function() { 
        serverInstance.close();
    },
    generateUser,
    generateItem,
    items,
    setToTesting
}