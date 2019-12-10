const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;

const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.findUser = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'Пользователь не найден' });
      }
      return res.send({ data: user });
    })
    .catch((err) => res.status(500).send({ message: err.mesage }));
};

const handlecreateError = (res) => {
  res
    .status(401)
    .send({ message: 'Не все поля заполнены' });
};

// eslint-disable-next-line consistent-return
module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  if (!name || !about || !avatar || !req.body.email || !req.body.password) {
    return handlecreateError(res);
  }

  const { email } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name, about, avatar, email: req.body.email, password: hash,
    }))
    .then((user) => res.status(201).send({
      _id: user._id, name, about, avatar, email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(404).send({ message: err.message });
      } else {
        res.status(500).send(err);
      }
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { runValidators: true })
    .then((user) => {
      if (!user) {
        return res.staus(404).send({ message: 'Пользователь не найден' });
      }
      return res.send(user);
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.updateAva = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { runValidators: true })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err) {
        return res.status(404).json({ message: 'please check your avatar link  !' });
      }
      return res.status(500).json({ message: err.message });
    });
};


module.exports.login = (req, res) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, NODE_ENV === 'dev' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' }),
      });
    })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      res.status(401).send({ message: err.message });
    });
};
