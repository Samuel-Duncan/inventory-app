/* eslint-disable no-underscore-dangle */
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'ddchqxk7d',
  api_key: '817817954873447',
  api_secret: 'woEF-W8MS7s2pDdyfl1K2ZJmS8U',
});

const upload = multer({ dest: '../public/uploads/' });
const Item = require('../models/item');
const Category = require('../models/category');

// Display list of all Items
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({}, { name: 1 })
    .sort({ name: 1 })
    .populate('categories', { name: 1 })
    .exec();

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

  upload.array('images', 10),

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
  body('categories.*')
    .escape(),
  body('images')
    .optional() // Allow the field to be empty
    .isArray() // Ensure it's an array
    .withMessage('Images must be provided as an array.')
    .custom((value) => {
      if (!value || !value.length) return; // Skip if empty

      for (const image of value) {
        if (typeof image !== 'string' || !image.trim()) {
          return Promise.reject('Invalid image URL in images array.');
        }
      }
      return true; // All URLs are valid
    }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const uploadedImages = [];

    if (req.files) {
      // eslint-disable-next-line no-restricted-syntax
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path);
          uploadedImages.push({ url: result.secure_url });
        } catch (error) {
          console.error('Error uploading image:', error);
          errors.array().push({ msg: 'Error uploading image(s). Please try again.' });
        }
      }
    }

    // Create an Item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      quantity: req.body.quantity,
      categories: req.body.category,
      images: uploadedImages,
    });

    console.log(item);

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
      // Check if Item with same name already exists
      const itemExists = await Item
        .findOne({ name: req.body.name })
        .collation({ locale: 'en', strength: 2 })
        .exec();
      if (itemExists) {
        // item exists redirect to its detail page
        res.redirect(itemExists.url);
      } else {
        await item.save();
        // Update relevant categories (after successful save)
        const updatedCategories = await Promise.all(
          // eslint-disable-next-line no-return-await
          item.categories.map(async (categoryId) => await Category.findByIdAndUpdate(
            categoryId,
            { $push: { items: item._id } },
            { new: true }, // Return the updated document
          )),
        );
        res.redirect(item.url);
      }
    }
  }),
];

// Display Item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    // no results
    res.redirect('inventory/items');
  }

  res.render('item_delete', {
    title: 'Delete Item',
    item,
  });
});

// Handle Item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();

  await Item.findByIdAndDelete(req.body.itemid);
  res.redirect('/inventory/items');
});

// Display Item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).populate('categories').exec(),
    Category.find().sort({ name: 1 }).exec(),
  ]);

  if (item === null) {
    // no results
    const err = new Error('Item not found');
    err.status = 404;
    return next(err);
  }

  allCategories.forEach((category) => {
    category.checked = category.items.includes(item._id) ? 'true' : undefined;
  });
  res.render('item_form', {
    title: 'Update Game',
    categories: allCategories,
    item,
  });
});

// Handle Item update on POST.
exports.item_update_post = [
  // Convert the categories to an array
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category = typeof req.body.category === 'undefined' ? [] : [req.body.category];
    }
    next();
  },

  upload.array('images', 10),

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
  body('categories.*')
    .escape(),
  body('images')
    .optional() // Allow the field to be empty
    .isArray() // Ensure it's an array
    .withMessage('Images must be provided as an array.')
    .custom((value) => {
      if (!value || !value.length) return; // Skip if empty

      // eslint-disable-next-line no-restricted-syntax
      for (const image of value) {
        if (typeof image !== 'string' || !image.trim()) {
          return Promise.reject('Invalid image URL in images array.');
        }
      }
      return true; // All URLs are valid
    }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    let existingImages = await Item.findById(req.params.id).select('images');

    if (!existingImages) {
      existingImages = []; // Set to empty array if item not found
    } else {
      existingImages = existingImages.images; // Extract the actual image URLs
    }

    const uploadedImages = [];

    if (req.files) {
    // ... existing upload logic (processing uploaded images)
      // eslint-disable-next-line no-restricted-syntax
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path);
          uploadedImages.push({ url: result.secure_url });
        } catch (error) {
          console.error('Error uploading image:', error);
          errors.array().push({ msg: 'Error uploading image(s). Please try again.' });
        }
      }
    }

    // Combine existing and uploaded images
    const combinedImages = [...existingImages, ...uploadedImages];

    // Create an Item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      quantity: req.body.quantity,
      categories: req.body.category,
      _id: req.params.id,
      images: combinedImages,
    });

    if (!errors.isEmpty()) {
      const allCategories = await Category.find().sort({ name: 1 }).exec();

      allCategories.forEach((category) => {
        category.checked = item.categories.includes(category._id) ? 'true' : undefined;
      });
      res.render('item_form', {
        title: 'Update Game',
        categories: allCategories,
        item,
        errors: errors.array(),
      });
    } else {
      const [updatedItem, allCategories] = await Promise.all([
        Item.findByIdAndUpdate(req.params.id, item, {}),
        Category.find().sort({ name: 1 }).exec(),
      ]);

      // eslint-disable-next-line no-unused-expressions
      allCategories.forEach(async (category) => {
        if (item.categories.includes(category._id)) {
          // Item needs to be in this category
          if (!category.items.includes(item._id)) {
            return Category.findByIdAndUpdate(
              category._id,
              { $push: { items: item._id } },
              { new: true }, // Return the updated document
            );
          }
          // Item ID already exists, do nothing (optional: log a message)
          console.log(`Item ID ${item._id} already exists in category ${category._id}`);
          return category;
        }
        // Item not selected in this category, remove from items array
        return Category.findByIdAndUpdate(
          category._id,
          { $pull: { items: item._id } },
          { new: true }, // Return the updated document (optional)
        );
      });
      res.redirect(updatedItem.url);
    }
  }),
];
