const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const Category = require('../models/category');
const Item = require('../models/item');

// Display list of all Categories
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find({})
    .sort({ name: -1 })
    .exec();

  res.render('category_list', {
    title: 'Category List',
    category_list: allCategories,
  });
});

// Display detail page for a specific Category
exports.category_detail = asyncHandler(async (req, res, next) => {
  // get details of categories
  const category = await Category.findById(req.params.id).populate('items').exec();

  if (category === null) {
    // No results
    const err = new Error('Category not found');
    err.status = 404;
    return next(err);
  }

  res.render('category_detail', {
    title: category.name,
    category,
  });
});

// Display Category create form on GET.
exports.category_create_get = (req, res, next) => {
  res.render('category_form', { title: 'Create Category' });
};

// Handle Category create on POST.
exports.category_create_post = [
  body('name')
    .trim() // Trim leading/trailing whitespace
    .notEmpty()
    .withMessage('Category name is required.')
    .escape(),
  body('description')
    .trim() // Trim leading/trailing whitespace
    .optional()
    .escape(), // Description is optional, but you can add validations if needed

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      res.render('category_form', {
        title: 'Create Category',
        category,
        errors: errors.array(),
      });
    } else {
      // Check if Category with same name already exists
      const categoryExists = await Category
        .findOne({ name: req.body.name })
        .collation({ locale: 'en', strength: 2 })
        .exec();
      if (categoryExists) {
        // category exists redirect to its detail page
        res.redirect(categoryExists.url);
      } else {
        await category.save();
        res.redirect(category.url);
      }
    }
  }),
];

// Display Category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // get details of category and all their items (in parallel)
  const [category, allItemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ categories: req.params.id }, 'name description').exec(),
  ]);

  if (category === null) {
    // no results
    res.redirect('/inventory/categories');
  }

  res.render('category_delete', {
    title: 'Delete Category',
    category,
    category_items: allItemsInCategory,
  });
});

// Handle Category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  // get details of category and all their items (in parallel)
  const [category, allItemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ categories: req.params.id }, 'name description').exec(),
  ]);

  if (allItemsInCategory.length > 0) {
    // Category has items, render in same way as for get route
    res.render('category_delete', {
      title: 'Delete Category',
      category,
      category_items: allItemsInCategory,
    });
  } else {
    // category has no items. delete object and redirect to the list of categories
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect('/inventory/categories');
  }
});

// Display Category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Category update GET');
});

// Handle Category update on POST.
exports.category_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Category update POST');
});
