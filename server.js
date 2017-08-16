const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const models = require('./db').models;
const User = models.User;
const Award = models.Award;
const bodyParser = require('body-parser')
const path = require('path')

app.set('view engine', 'html')
app.engine('html', require('swig').renderFile)

app.listen(port, ()=>{
  console.log(`listening on port ${port}`)
  User.sync({force : true})
    .then(()=> { return User.create({name : "qian"})})
    .then(()=> { return User.create({name : "bob"})})
    .then(()=>{Award.sync({ force : true })})
})

//Logging
app.use(require('morgan')('dev'))

//Body Parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Method override
app.use(require('method-override')('_method'))

//Routes
app.get('/', (req,res) => res.render('index'))
app.use('/users', require('./routes/routes'))

//Static
app.use(express.static(path.join(__dirname, 'public')));
