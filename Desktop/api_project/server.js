const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8000;

app.use(bodyParser.json())

const items = [ {
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
    }]
app.get('/', (req, res) => {
  res.send("Please sign in");
})

app.post('/', (req, res) => {

})

app.get('/items', (req, res) => {
    res.json(items)
})

app.post('/items', (req, res) => {
    items.push(
        { title: req.body.title, description: req.body.description, 
            price: req.body.price, date: req.body.date, 
            delivery: req.body.delivery, 
            information: req.body.information }
            )
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

/* Header reader */

const users = [
  {}];

function headerDemoMW(req, res, next) {
  const userId = parseInt(req.get('user-id'));
  const userInfo = users.find(user => user.id === userId);
  req.userInfo = userInfo;
  next();
}

app.get('/header-demo', headerDemoMW, (req, res) => {
  const userInfo = req.userInfo;
  res.json(userInfo);
});


app.listen(port, () => {
    console.log(`Example API listening on http://localhost:${port}\n`);
});