const mongoose = require('mongoose');

// eslint-disable-next-line prefer-destructuring
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, required: true },
  description: String,
});

// Virtual for this category instance URL.
CategorySchema.virtual('url').get(function () {
  return `/category/${this._id}`;
});

module.exports = mongoose.model('Category', CategorySchema);
