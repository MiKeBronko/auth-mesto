const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

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
        return res.status(404).send({ message: 'Нет таких!' });
      }
      return res.send({ data: user });
    })
    .catch((err) => res.status(500).send({ message: err.mesage }));
};


module.exports.createUser = (req, res) => {
  const {
    name, about, avatar,
  } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name, about, avatar, email: req.body.email, password: hash,
    }))
    .then((user) => {
      res.status(201).send({ data: user });
    })
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
        return res.staus(404).send({ message: 'нет таких' });
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
        return res.status(404).json({ message: 'нет таких' });
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
        token: jwt.sign({ _id: user._id }, 'super-strong-secret', { expiresIn: '7d' }),
      });
    })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      res.status(401).send({ message: `контроллёр users.js: ${err.message}` });
    });
};
