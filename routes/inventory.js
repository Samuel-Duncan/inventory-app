const express = require('express');

const router = express.Router();

const homePageController = require('../controllers/homePageController');
const categoryController = require('../controllers/categoryController');
const itemController = require('../controllers/itemController');

/* GET inventory page. */
router.get('/', homePageController.index);

// CATEGORY ROUTES //
// GET request for creating a Category.
// NOTE This must come before routes that display Category (uses id).
router.get('/category/create', categoryController.category_create_get);

// POST request for creating Book.
router.post('/category/create', categoryController.category_create_post);

// GET request to delete Category
router.get('/category/:id/delete', categoryController.category_delete_get);

// POST request to delete Category
router.post('/category/:id/delete', categoryController.category_delete_post);

// GET request to update Category
router.get('/category/:id/update', categoryController.category_update_get);

// POST request to update Category.
router.post('/category/:id/update', categoryController.category_update_post);

// GET request for one category
router.get('/category/:id', categoryController.category_detail);

// GET request for list of all Category items
router.get('/categories', categoryController.category_list);

// ITEM ROUTES //
// GET request for creating an Item.
// NOTE This must come before routes that display Item (uses id).
router.get('/item/create', itemController.item_create_get);

// POST request for creating Item.
router.post('/item/create', itemController.item_create_post);

// GET request to delete Item
router.get('/item/:id/delete', itemController.item_delete_get);

// POST request to delete Item
router.post('/item/:id/delete', itemController.item_delete_post);

// GET request to update Item
router.get('/item/:id/update', itemController.item_update_get);

// POST request to update Item.
router.post('/item/:id/update', itemController.item_update_post);

// GET request for one item
router.get('/item/:id', itemController.item_detail);

// GET request for list of all Items
router.get('/items', itemController.item_list);

module.exports = router;
