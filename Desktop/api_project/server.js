const express = require('express');
const bodyParser = require('body-parser');
var fs = require('fs');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtSecretKey = require('./secrets.json')

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

const options = {

    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecretKey.jwtKey
};

passport.use(new BasicStrategy(
    (username, password, done) => {
        const searchResult = users.find(user => {
           if(user.username = username)  {
               console.log("username true")
               if(bcrypt.compareSync(password, user.password)) {
                   console.log("password true")
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

function generateAccessToken(username) {
    return jwt.sign({username: username}, jwtSecretKey.jwtKey, {expiresIn: '1800s'});
}

function authenticateToken(req, res, next) {
    const bearerHeader = req.headers['authorization']
    if ( typeof bearerHeader !== 'undefined') { 
        const bearerToken = bearerHeader.split(' ')[1]
        jwt.verify(bearerToken, jwtSecretKey.jwtKey, (err, user) => {
            if(err) {
                res.sendStatus(403)
            } else {
                req.user = user
                next();
            }
        })
    } else {
        res.sendStatus(403)
    }
}

function setToTesting() {
    testing = true;
}

function generateUser(req) {
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

function generateItem() {
    var itemid = uuidv4(), title, description, category, location, price, date, delivery, information;
    var images = [];
    if(testing) {
        userid = itemid;
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
        userid = uuidv4();
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

app.get('/', (req, res) => {
    res.send("Please sign in");
  })

app.post('/signup', (req, res) => {
    newUser = generateUser(req)

    const searchResult = users.find(user => {
        if(user.username == req.body.username)  {
            console.log("username in use");
            res.send('Username in use');
            return false;
        }
    })

    const token = generateAccessToken( {username: newUser.username })

    users.push(newUser)

    res.json(token);
    res.sendStatus(201)
})
app.get('/users', authenticateToken, (req, res) => {
    res.json(users)

});
app.post('/login', passport.authenticate('basic', { session: false }), (req, res) => {
    const token = generateAccessToken(req.body.username)
    console.log(req.body.username)
    res.json(token)
})

app.get('/items', (req, res) => {
    res.json(items)
})

app.post('/items', authenticateToken, (req, res) => {
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