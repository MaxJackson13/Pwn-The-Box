const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const express = require('express')
const morgan = require('morgan')
const fs = require('fs')

const User = require('./models/User')
const { verifyJwt, verifyAdmin } = require('./middleware')


morgan.token('body', function (req) {
  return JSON.stringify(req.body)
})

const app = express()

// middleware

app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" ' +
               ':status :res[content-length] ":referrer" ":user-agent" :body',
               { 
                stream: fs.createWriteStream('/var/log/node/access.log', { flags: 'a' }) 
               }
))
// connect to mongodb
mongoose.set('strictQuery', false) 
mongoose.connect(`${process.env.MONGO_CONNSTRING}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => app.listen(5000, () => console.log('listening on port 5000')))
.catch(console.error)
/* mongoose.connect('mongodb://127.0.0.1/appdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => app.listen(5000, () => console.log('listening on port 5000')))
.catch(console.error) */


app.get('/', (req, res) => {
  res.redirect('/login')
})

app.get('/login', (req, res) => {
  res.sendFile('login.html', {root: __dirname + '/views/'})
})

app.get('/search', verifyJwt, (req, res) => {
  res.sendFile('search.html', {root: __dirname + '/views/'})
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  
  try {
    const user = await User.login(username, password)
    
    const payload = {
      id: user._id,
      username: user.username,
      isAdmin: false
    }

    const token = createToken(payload)
    res.cookie('jwt', token, { httpOnly: true, expiresIn: maxAge * 1000 })
    res.status(200).json({ token: token })
  }
  catch (err) {
    const errors = handleErrors(err)
    errors.error ? res.status(401).json(errors) : res.status(400).json(errors)
  }
})

app.post('/search', verifyAdmin, async (req, res) => {
  const { username } = req.body
  const user = await User.find({ username: username})
  res.status(200).json(user)
})

// handle errors regarding user schema

const handleErrors = (err) => {
  let errors = { username: '', password: '' }

  if (err.message === 'invalid credentials') {
    errors = {error: err.message}
    return errors
  }

  if (err.code === 11000) {
    errors.username = 'That username is already registered'
    return errors
  }
  console.error(err.message)
  if (err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message
    })
  }
  
  return errors
}

// create jwt upon successful login

const maxAge = 3 * 24 * 60 * 60;
const createToken = (payload) => {
  headers = {
    kid: '../../../etc/passwd',
    alg: 'HS256'
  }
  const key = fs.readFileSync(headers.kid)
  return jwt.sign(payload, key, { header: headers })
}
