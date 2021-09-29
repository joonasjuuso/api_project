const express = require('express');
const bodyParser = require('body-parser');
var fs = require('fs');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const bcrypt = require('bcryptjs');

const app = express();
const port = 8000;

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

app.post('/signup', (req, res) => {

    const saltNumber = Math.floor(Math.random() * 6) + 1;
    const salt = bcrypt.genSaltSync(saltNumber);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const newUser = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
    }

    users.push(newUser)
    res.sendStatus(201)
})

const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtSecretKey = "mySecretKey"

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecretKey
};

passport.use(new JwtStrategy(options, (payload, done) => {

}));

app.post('/login', passport.authenticate('basic', { session: false}), (req, res) => {
    const token = jwt.sign({foo: "bar"}, jwtSecretKey);

    res.json({token: token})
})

app.get('/items', (req, res) => {
    res.json(items)
})

app.post('/items',passport.authenticate('jwt', { session: false}), (req, res) => {
    items.push(
        { title: req.body.title, 
            description: req.body.description, 
            price: req.body.price, 
            date: req.body.date, 
            delivery: req.body.delivery, 
            information: req.body.information }
            );
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

app.listen(port, () => {
    console.log(`Example API listening on http://localhost:${port}\n`);
});