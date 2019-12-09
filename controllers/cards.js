const Card = require('../models/card');

module.exports.getCard = (req, res) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ data: cards }))
    .catch((err) => res.status(500).send({ message: err.message }));
};


module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((cards) => res.send({ data: cards }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

/**----------------------------*/
module.exports.deleteCard = (req, res) => {
  Card.findById(req.params.cardId)
    .populate('owner')
    .then((card) => {
      if (JSON.stringify(req.user._id) === JSON.stringify(card.owner._id)) {
        return Card.findByIdAndRemove(req.params.cardId)
          .then((dataCard) => res.send({ data: dataCard }));
      }
      return res.status(401).send({ message: 'Вы не можете удалить чужую карточку' });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};


module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Карточка с таким Id не найдена' });
      }
      return res
        .status(200)
        .send({ card });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Карточка с таким Id не найдена' });
      }
      return res
        .send({ card });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};
