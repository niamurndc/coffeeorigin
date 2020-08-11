const mongoose = require('mongoose');

let coffeeSchema = new mongoose.Schema({
  name: {
    type: String
  },
  category: {
    type: String
  },
  special: {
    type: Array 
  }
});

let Coffee = module.exports = mongoose.model('Coffee', coffeeSchema);