export {};

const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  title: {
    type: String, // String is shorthand for {type: String}
    required: true,
  },

  completed: {
    type: Boolean,
  },

  createdAt: {
    type: String,
  },

  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model('Todo', TodoSchema);
