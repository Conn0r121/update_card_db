const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    mana_cost: {type: String},
    cmc: {type: Number},
    type_line: {type: String},
    oracle_text: {type: String},
    colors: {type: [String]}
});

const cardModel = mongoose.model('Card', cardSchema);

module.exports = cardModel;