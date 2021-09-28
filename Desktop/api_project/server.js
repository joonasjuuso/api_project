const express = require('express');
const app = express();
const port = 8000;


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
  res.send("Hello");
})

app.get('/items', (req, res) => {
    res.json(dogs)
})

app.post('/items', (req, res) => {
    res.send(dogs)
})

app.get('/items/:category', (req, res) => {
    const category = items.find(item => item.category === req.params.category)
})

app.get('/items/:location', (req, res) => {
    const location = items.find(item => item.location === req.params.location)
})

app.get('/items/:date', (req, res) => {
    const date = items.find(item => item.date === req.params.date)
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