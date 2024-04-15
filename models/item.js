const mongoose = require('mongoose');

// eslint-disable-next-line prefer-destructuring
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
});

const ItemSchema = new Schema({
  name: {
    type: String,
    minLength: [3, 'Item name must be 3 or more characters.'],
    maxLength: [50, 'Item name must not exceed 50 characters.'],
    required: [true, 'Item name is required.'],
  },
  description: { type: String, minLength: 50, maxLength: 280 },
  price: { type: Number, required: [true, 'Item price is required.'] },
  quantity: {
    type: Number,
    min: [1, 'Item quantity must be 1 or more.'],
    required: [true, 'Item quantity is required.'],
  },
  images: [ImageSchema],
  category: { type: Schema.ObjectId, ref: 'Category' },
});

// Virtual for this item instance URL.
ItemSchema.virtual('url').get(function () {
  return `/inventory/item/${this._id}`;
});

module.exports = mongoose.model('Item', ItemSchema);
