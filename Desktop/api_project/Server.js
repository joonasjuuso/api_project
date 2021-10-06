const express = require('express');
const dotenv = require('dotenv')
dotenv.config()
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const formidable = require('express-formidable')
const path = require('path');
var fs = require('fs');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fileupload = require('express-fileupload');




cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})



const app = express();

var testing = false;
var loggedIn = "no";

app.use(cookieParser());
app.use(bodyParser.json());
app.use(formidable());
app.use(fileupload({
    useTempFiles: true
}))

app.set('port', (process.env.PORT || 80));


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
        date: "2021",
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
        date: "2021",
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
    secretOrKey: process.env.JWTKEY
};



passport.use(new BasicStrategy(
    (username, password, done) => {
        const searchResult = users.find(user => {
           if(user.username = username)  {
               console.log("username true")
               if(bcrypt.compareSync(password, user.password)) {
                   console.log("password true")
                   loggedIn = username;
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

function startsWithCapital(word) {
    return word.charAt(0) === word.charAt(0).toUpperCase();
}

// custom passport method for authentication when logged in or signed up
function generateAccessToken(username) {
    return jwt.sign(username, process.env.JWTKEY);
}

// custom-built passport for JWT, you can insert the token either in
// the bearer token in Postman or it can look it up from cookies as 
// it is stored during login or signup there.
function authenticateToken(req, res, next) {
    const bearerHeader = req.headers['authorization']
    if ( typeof bearerHeader !== 'undefined') { 
        const bearerToken = bearerHeader.split(' ')[1]
        console.log(bearerToken);
        jwt.verify(bearerToken, process.env.JWTKEY, (err, user) => {
            if(err) {
                res.sendStatus(403)
            } else {
                req.user = user
                next();
            }
        })
    } else {
        let cookie = req.cookies['tokenKey'];
        if(cookie == 'undefined') {
            res.sendStatus(403);
        } else {
            jwt.verify(cookie, process.env.JWTKEY, (err, user) => {
                if(err) {
                    res.sendStatus(403)
                } else {
                    req.user = user
                    next();
                }
            })
        }
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
    console.log(req.fields.username);
    if(testing) {
        username = "joonas";
        password = "moro";
        email = "joonas@gmail.com";
        streetaddress = "esimerkkitie 56",
        postalcode = "90123"
        city = "Oulu"
    } else {
        username = req.fields.username
        password = req.fields.password;
        email = req.fields.email;
        streetaddress = req.fields.streetaddress;
        postalcode = req.fields.postalcode;
        city = req.fields.city;
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

function generateItem(req, res) {
    var itemid = uuidv4(), title, description, category, location, price, date, deliverytype, username,sellernumber,selleremail;
    var images = [];

    let nameFromCookie = req.cookies['tokenKey'];
    var getUsername = jwt.verify(nameFromCookie, process.env.JWTKEY);
    var user = JSON.parse(JSON.stringify(getUsername));

    if(testing) {
        itemid = itemid;
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
        title = req.fields.title;
        description = req.fields.description;
        category = req.fields.category;
        location = req.fields.location;
        images = req.fields.images;
        price = req.fields.price;
        date = req.fields.date;
        deliverytype = req.fields.deliverytype;
        username = user.username;
        sellernumber = req.fields.sellernumber;
        selleremail = req.fields.selleremail;
    }
    var checkLocation = startsWithCapital(location);
    var checkCategory = startsWithCapital(category);
    if(checkLocation == false) {
        res.status(400).send('Please, write the name of your location with the ' +
        'first letter as capital letter');
    }

    if(checkCategory == true) {
        res.status(400).send('Please, write the name of your category with the ' +
        'first letter as non-capital letter');
    }
    if(!date.match(/^\d/)) {
        res.status(400).send('Please enter date in number format');
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
    res.sendFile(path.join(__dirname+'/Index.html'));
  })

app.post('/signup', (req, res) => {

    //check if empty data is present
    if(req.fields.username == undefined || req.fields.password == undefined || req.fields.email == undefined) {
        res.status(400).send('Please enter your information');
    }

    // check for existing users
    const searchResult = users.find(user => {
        if(user.username == req.fields.username)  {
            console.log("username in use");
            res.status(400).send('Username in use');
        } else if(user.email == req.fields.email) {
            console.log("email in use");
            res.status(400).send('Email in use');
            return false;
        }
    })

    newUser = generateUser(req);

    //generate JWT token
    const token = generateAccessToken( {username: newUser.username })

    users.push(newUser)
    res.cookie('tokenKey', token);
    res.json({token: token});
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
    const token = generateAccessToken(loggedIn);
    loggedIn = "no";
    console.log(req.fields.username);
    res.cookie('tokenKey', token);
    res.json(token);
    res.sendStatus(201);
})

app.get('/items', (req, res) => {
    res.json(items)
})

// remember to disable basic auth work jwt to work.
app.post('/items', authenticateToken, (req, res) => {
    
    console.log(req.fields);
    //console.log(req.file);
    if(!(req.fields.title && req.fields.description && 
        req.fields.category && req.fields.location   
        && req.fields.price && req.fields.date && req.fields.deliverytype 
        && req.fields.sellernumber && req.fields.selleremail)) {
            res.status(400).send("All input is required");
        }    
        // images not working because of some reason we couldnt figure out
        //const file = req.files.image;
        //console.log(file);
        /*
        cloudinary.uploader.upload(file.tempFilePath, function(err,result)
        {
            console.log(err)
            res.json(result.url);
            imgurl = result.url
            generateItem(req, res, imgurl);
            res.sendStatus(201);
        })*/
        generateItem(req, res);
        res.sendStatus(201);
       
    
        
      
})

app.get('/items/:input', (req, res) => {
    if(req.params.input.match(/^\d/))
    {
        const date = items.find(item => item.date === req.params.input)
        if(date == undefined) {
            res.status(404).send('Couldnt find any items with your ' +
            'given parameters');
        } else {
            res.json(date)
        }
    }
    else if(startsWithCapital(req.params.input)) {
        const location = items.find(item => item.location === req.params.input)
        if(location == undefined) {
            res.status(404).send('Couldnt find any items with your ' +
            'given parameters')
        } else {
            res.json(location)
    }
    }
    else {
        usernameItems = [];
        const category = items.find(item => item.category === req.params.input);
        for (var i = 0; i < items.length; i++) {
            const item = items.find(item => item.username === req.params.input);
            console.log(item);
            if(item == items[i]) {
                usernameItems.push(item);
            }
        }
        const user = items.find(user => user.username === req.params.input);
        if(user != undefined && usernameItems.length > 0) {
            if(category == undefined || category.username != user.username)
            {
                res.json(usernameItems);
            }
            else if (category != undefined && category.username != user.username) {
                res.json(category)
            } else {
                res.status(404).send('Something went wrong');
            }
        }
        if(category == undefined) {
            res.status(404).send('Couldnt find any items with your ' +
            'given parameters')
        } else {
            res.json(category)
        }
    }
})

app.put('/items/:id', authenticateToken, (req, res) => {
    const item = items.findIndex(item => item.itemid === req.params.id)
    if(item !== undefined) {
        let nameFromCookie = req.cookies['tokenKey'];
        var getUsername = jwt.verify(nameFromCookie, process.env.JWTKEY);
        var user = JSON.parse(JSON.stringify(getUsername));
        var itemDeleted = false;
        for (let i = 0; i < items.length; i++) {
            const getUserFromDb = items[i].username;
            console.log(getUserFromDb);
            console.log(items[i].username);
            if(req.params.id == items[i].itemid && getUserFromDb == user.username) {
                if(req.fields.title != undefined)
                {
                    item.title = req.fields.title;
                }

                if (req.fields.description != undefined)
                {
                    item.description = req.fields.description;
                }

                if(req.fields.category != undefined)
                {
                    item.category = req.fields.category;
                }

                if(req.fields.location != undefined)
                {
                    item.location = req.fields.location;
                }

                if(req.fields.images  != undefined)
                {
                    item.images = req.fields.images;
                }

                if(req.fields.price != undefined)
                {
                    item.price = req.fields.price;
                }

                if(req.fields.date != undefined)
                {
                    item.date = req.fields.date;
                }

                if(req.fields.deliverytype != undefined)
                {
                    item.deliverytype = req.fields.deliverytype;
                }
                if(req.fields.username!= undefined)
                {
                    item.username = req.fields.username;
                }
                if(req.fields.sellernumber !=undefined)
                {
                    item.username = req.fields.sellernumber;
                }
                if(req.fields.selleremail !=undefined)
                {
                    item.selleremail = req.fields.sellernumber;
                }
                res.send(item);
            }
        }
        res.send("Cannot modify a listing that is not yours", 403);
    }
 else{
    res.send("Item not found",404);
    }

});

app.delete('/items/:id', authenticateToken, (req, res) => {
    const item = items.find(item => item.itemid === req.params.id)
    if (item !== undefined) 
    {
        let nameFromCookie = req.cookies['tokenKey'];
        var getUsername = jwt.verify(nameFromCookie, process.env.JWTKEY);
        var user = JSON.parse(JSON.stringify(getUsername));
        var itemDeleted = false;
        for (let i = 0; i < items.length; i++) {
            const getUserFromDb = items[i].username;
            console.log(getUserFromDb);
            console.log(items[i].username);
            if(req.params.id == items[i].itemid && getUserFromDb == user.username) {
                items.splice(item,1);
                console.log(item)
                return res.send("Item deleted",200);
            }
        }
        return res.send("Cannot delete listing that do not belong " + 
        "to you", 403);
    }
   else{
       return res.send("Item not found", 404);
   }
   });

let serverInstance = null;

module.exports = {
    start: function() { 
        serverInstance = app.listen(app.get('port'), () => { 
            
        })
    },
    close: function() { 
        serverInstance.close();
    },
    generateUser,
    generateItem,
    items,
    setToTesting,
    startsWithCapital
}