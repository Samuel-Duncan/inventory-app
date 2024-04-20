const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const Item = require('../models/item');
const Category = require('../models/category');

// Display list of all Items
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({}, { name: 1 })
    .sort({ name: 1 })
    .populate('categories', { name: 1 })
    .exec();

  console.log(allItems);
  res.render('item_list', { title: 'Item List', item_list: allItems });
});

// Display detail page for a specific Item
exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate('categories').exec();

  if (item === null) {
    const err = new Error('Item not found');
    err.status = 404;
    return next(err);
  }

  res.render('item_detail', {
    title: item.name,
    item,
  });
});

// Display Item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();
  res.render('item_form', {
    title: 'Create Game',
    categories: allCategories,
  });
});

// Handle Item create on POST.
exports.item_create_post = [
  // Convert the categories to an array
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category = typeof req.body.category === 'undefined' ? [] : [req.body.category];
    }
    next();
  },

  // Validate and sanitize fields
  body('name')
    .trim() // Trim leading/trailing whitespace
    .notEmpty()
    .withMessage('Item name is required.')
    .isLength({ min: 3, max: 50 })
    .withMessage('Item name must be between 3 and 50 characters.')
    .escape(), // Basic sanitization to prevent XSS,
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Item description is required.')
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters.')
    .escape(), // Consider extending max length if needed,
  body('price')
    .isNumeric()
    .withMessage('Item price must be a number.')
    .notEmpty()
    .withMessage('Item price is required.')
    .custom((value) => value >= 0 || 'Item price must be non-negative'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Item quantity must be a whole number (minimum 1).')
    .notEmpty()
    .withMessage('Item quantity is required.'),
  body('categories.*').escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // Create an Item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      quantity: req.body.quantity,
      categories: req.body.category,
    });

    if (!errors.isEmpty()) {
      const allCategories = await Category.find().sort({ name: 1 }).exec();

      allCategories.forEach((category) => {
        category.checked = item.categories.includes(category._id) ? 'true' : undefined;
      });
      res.render('item_form', {
        title: 'Create Game',
        categories: allCategories,
        item,
        errors: errors.array(),
      });
    } else {
      await item.save();
      // Update relevant categories (after successful save)
      const updatedCategories = await Promise.all(
        item.categories.map(async (categoryId) => await Category.findByIdAndUpdate(
          categoryId,
          { $push: { items: item._id } },
          { new: true }, // Return the updated document
        )),
      );
      res.redirect(item.url);
    }
  }),
];

// Display Item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Item delete GET');
});

// Handle Item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Item delete POST');
});

// Display Item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Item update GET');
});

// Handle Item update on POST.
exports.item_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Item update POST');
});
