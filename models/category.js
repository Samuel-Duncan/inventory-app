const mongoose = require('mongoose');

// eslint-disable-next-line prefer-destructuring
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    enum: ['PC Games', 'Console Games', 'Mobile Games'],
    default: 'PC Games',
  },
  description: String,
  items: [{ type: Schema.ObjectId, ref: 'Item' }],
});

// Virtual for this category instance URL.
CategorySchema.virtual('url').get(function () {
  return `/inventory/category/${this._id}`;
});

module.exports = mongoose.model('Category', CategorySchema);
