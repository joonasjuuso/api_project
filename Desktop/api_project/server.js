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

// some default items
const items = [ 
    {
        itemid: uuidv4(),
        //itemid: "1",
        title: "yes",
        description: "yes",
        category: "kirja",
        location: "Oulu",
        images: ["2","2"],
        price: "555",
        date: 12400,
        deliverytype: "Pickup",
        username: "yes",
        sellernumber: "0501234567",
        selleremail: "yes@yes.com"
    },
    {
        itemid: "2",
        title: "aaaa",
        description: "sdsdadsades",
        category: "joku",
        location: "Helsinki",
        images: ["2","2"],
        price: "55567555",
        date: 234524,
        deliverytype: "Delivery",
        username: "2323",
        sellernumber: "0507654321",
        selleremail: "asd@asd.com"
    }];

const users = [
    {
        userId: "u1",
        username: "yes",
        password: "yes",
        email: "yes",
        streetaddress:"Merikoskenkatu x",
        postalcode: "90500",
        city: "Oulu"
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
           res.send('Username or password incorrect');
           return false;
        })
        if(searchResult != undefined) {
            done(null, searchResult);
        } else {
            done(null,false);
        }
    }
))

function startsWithCapital(word) {
    return word.charAt(0) === word.charAt(0).toUpperCase();
}

// custom passport method for authentication when logged in or signed up
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

// for serverTests
function setToTesting() {
    testing = true;
}

function generateUser(req) {
    const saltNumber = Math.floor(Math.random() * 6) + 1;
    const salt = bcrypt.genSaltSync(saltNumber);
    var userid,password, username, email,streetaddress,postalcode,city;

    if(testing) {
        username = "joonas";
        password = "moro";
        email = "joonas@gmail.com";
        streetaddress = "esimerkkitie 56",
        postalcode = "90123"
        city = "Oulu"
    } else {
        username = req.body.username
        password = req.body.password;
        email = req.body.email;
        streetaddress = req.body.streetaddress;
        postalcode = req.body.postalcode;
        city = req.body.city;
    }

// use bcrypt to create a secure password and store it in local db
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = {
        userid: uuidv4(),
        username: username,
        password: hashedPassword,
        email: email,
        streetaddress: streetaddress,
        postalcode: postalcode,
        city: city
    }

    return newUser;
}

function generateItem() {
    var itemid = uuidv4(), title, description, category, location, price, date, deliverytype, username,sellernumber,selleremail;
    var images = [];

    if(testing) {
        userid = itemid;
        title = "testi";
        description = "testi";
        category = "testi";
        location = "Suomi";
        images = ["yksi", "kaksi"]
        price = "0";
        date = "2021";
        deliverytype = "Pickup";
        username = "Joonas";
        sellernumber = "05022222222"
        selleremail = "j@gmail.com"
    } else {
        itemid = uuidv4();
        title = req.body.title;
        description = req.body.description;
        category = req.body.category;
        location = req.body.location;
        images = req.body.images;
        price = req.body.price;
        date = req.body.date;
        deliverytype = req.body.deliverytype;
        username = req.body.username;
        sellernumber = req.body.sellernumber;
        selleremail = req.body.selleremail;
    }
    var checkLocation = startsWithCapital(location);
    var checkCategory = startsWithCapital(category);
    if(checkLocation == false) {
        res.send('Please, write the name of your location with the ' +
        'first letter as capital letter');
        return false;
    }

    if(checkCategory == true) {
        res.send('Please, write the name of your category with the ' +
        'first letter as non-capital letter');
    }
    if(!date.match(/^\d/)) {
        res.send('Please enter date in number format');
        return false;
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
            deliverytype: deliverytype,
            username: username,
            sellernumber: sellernumber,
            selleremail: selleremail}
            );
}

app.get('/', (req, res) => {
    res.send("Please sign in"); // main screen
  })

app.post('/signup', (req, res) => {

    //check if empty data is present
    if(req.body.username == undefined || req.body.password == undefined || req.body.email == undefined || req.body.streetaddress == undefined || req.body.city == undefined || req.body.postalcode == undefined) {
        newUser = generateUser(req)
    } else {
        res.send('Please enter your information');
        return false;
    }

    // check for existing users
    const searchResult = users.find(user => {
        if(user.username == req.body.username)  {
            console.log("username in use");
            res.send('Username in use');
            return false;
        } else if(user.email == req.body.email) {
            console.log("email in use");
            res.send('Email in use');
            return false;
        }
    })

    newUser = generateUser(req);

    //generate JWT token
    const token = generateAccessToken( {username: newUser.username })

    users.push(newUser)

    res.json(token);
    res.sendStatus(201)
})

// not in use
/* app.get('/users', authenticateToken, (req, res) => {
    res.json(users)

}); */

// login and signup is done via http-basic, but after logging in,
// the process of scrolling through pages and checking authorization
// is done via JWT
app.post('/login', passport.authenticate('basic', { session: false }), (req, res) => {
    const token = generateAccessToken(req.body.username)
    console.log(req.body.username)
    res.json(token)
})

app.get('/items', (req, res) => {
    res.json(items)
})

app.post('/items', authenticateToken, (req, res) => {
    if(!(req.body.username != undefined || req.body.password != undefined || req.body.email != undefined || req.body.streetaddress != undefined || req.body.city != undefined || req.body.postalcode != undefined)) {
            res.sendStatus(400).send("All input is required");
        }
    generateItem(req, res);
    res.sendStatus(201);
})

app.get('/items/:input', (req, res) => {
    if(req.params.input.match(/^\d/))
    {
        const date = items.find(item => item.date === req.params.input)
        if(date == undefined) {
            res.sendStatus(404)
        } else {
            res.json(date)
        }
    }
    else if(startsWithCapital(req.params.input)) {
        const location = items.find(item => item.location === req.params.input)
        if(location == undefined) {
            res.sendStatus(404)
        } else {
            res.json(location)
    }
    }
    else {
        const category = items.find(item => item.category === req.params.input)
        if(category == undefined) {
            res.sendStatus(404)
        } else {
            res.json(category)
        }
    }
})

app.put('/items/:id',  (req, res) => {

    const item = items.find(item => item.id === req.params.id)
    if(item !== undefined) {
    if(req.body.title != undefined)
    {
        item.title = req.body.title;
    }

    else if (req.body.description != undefined)
    {
        item.description = req.body.description;
    }

    else if(req.body.category != undefined)
    {
        item.category = req.body.category;
    }

    else if(req.body.location != undefined)
    {
        item.location = req.body.location;
    }

    else if(req.body.images  != undefined)
    {
        item.images = req.body.images;
    }

    else if(req.body.price != undefined)
    {
        item.price = req.body.price;
    }

    else if(req.body.date != undefined)
    {
        item.date = req.body.date;
    }

    else if(req.body.deliverytype != undefined)
    {
        item.deliverytype = req.body.deliverytype;
    }
    else if(req.body.username!= undefined)
    {
        item.username = req.body.username;
    }
    else if(req.body.sellernumber !=undefined)
    {
        item.username = req.body.sellernumber;
    }
    else if(req.body.selleremail !=undefined)
    {
        item.selleremail = req.body.sellernumber;
    }
    res.send(item);
    }
 else{
    res.send("Item not found",404);
    }

});

app.delete('/items/:id', (req, res) => {

    const { id } = req.params;
    
    const item = items.find(item => item.id === req.params.id)
    if (item !== undefined) 
    {
        items.splice(item,1);
        console.log(item)
        return res.send("Item deleted",200);
    }
   else{
       return res.send("Item not found", 404);
   }
   });

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