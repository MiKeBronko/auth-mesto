// require('dotenv').config();

// console.log(process.env.NODE_ENV);
const express = require('express');

const helmet = require('helmet');

const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const users = require('./routes/users');
const cards = require('./routes/cards');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

app.use(limiter);
app.use(helmet());


app.post('/signup', createUser);
app.post('/signin', login);

app.use(auth);

app.use('/', users);
app.use('/', cards);

const { PORT = 3000 } = process.env;

app.use('*', (req, res) => {
  res.status(404).send({ message: 'Запрашиваемый ресурс не найден' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
