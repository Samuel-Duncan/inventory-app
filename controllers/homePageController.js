const asyncHandler = require('express-async-handler');
const Category = require('../models/category');
const Item = require('../models/item');

// GET inventory home page.
exports.index = asyncHandler(async (req, res, next) => {
  // Get details of categories and items (in parallel)

  const [numCategories, numItems] = await Promise.all([
    Category.countDocuments({}).exec(), Item.countDocuments({}).exec(),
  ]);

  res.render('index', {
    title: 'Inventory',
    category_count: numCategories,
    item_count: numItems,
  });
});
