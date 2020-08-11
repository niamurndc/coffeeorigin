const express = require('express');
const expressLayout = require('express-ejs-layouts');
const { urlencoded } = require('body-parser');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// local storage
if (typeof localStorage === "undefined" || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

mongoose.connect('mongodb://localhost/coffeeorigin')
  .then(() => console.log('connected'))
  .catch(err => console.log(err));

const Coffee = require('./models/coffee');
const User = require('./models/user');

const app = express();

app.use(expressLayout);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static(__dirname+'/public'))

app.get('/', (req, res) => {
  res.render('index');
});

// check authenticate middleware
const checkAuth = function(req, res, next){
  if(localStorage.getItem('uname')){
    next();
  }else{
    res.redirect('/');
  }
}

// get coffee route
app.get('/coffee', checkAuth, (req, res) => {
  Coffee.find({}, (err, coffees) => {
    if(err) throw err;
    res.render('coffee', {coffees});
  });
});

app.get('/view/:id', checkAuth, (req, res) => {
  const id = req.params.id;
  let coffee = Coffee.findById(id, (err, coffee) => {
    if(err) throw err;
    res.render('view', {coffee});
  });
});

app.get('/create', (req, res) => {
  res.render('create');
});

// order coffee route

app.post('/create', (req, res) => {
  let coffee = new Coffee();

  coffee.name = req.body.name;
  coffee.category = req.body.category;
  coffee.special = req.body.special;

  coffee.save(err => {
    if(err) throw err;
    res.redirect('/');
  })
});

// delete coffee

app.get('/delete/:id', checkAuth, (req, res) => {
  const id = req.params.id;
  let coffee = Coffee.findById(id, (err, coffee) => {
    if(err) throw err;
    coffee.deleteOne();
    res.redirect('/coffee');
  });
});

// login route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  username = req.body.username;
  pass = req.body.password;

  User.findOne({username: username, password: pass})
    .then(user => {
      if(user){
        localStorage.setItem('uname', user.username);
        res.redirect('/coffee');
      }else{
        res.redirect('/login');
      }
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/logout', checkAuth, (req, res) => {
  localStorage.removeItem('uname');
  res.redirect('/');
});


app.listen(3030, () => console.log('server running on 3030'));