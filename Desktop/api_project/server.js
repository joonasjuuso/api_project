const express = require('express');
const app = express();
const port = 8000;


const items = [ {
    title: "",
    description: "",
    category: "",
    location: "",
    images: "",
    price: "",
    date: "",
    delivery: "",
    information: ""
 }]
app.get('/', (req, res) => {
  res.send("Hello");
})

app.get('/items', (req, res) => {

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