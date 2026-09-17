const router = require('express').Router();
const c = require('../controllers/productController');
const { protect, authorize, tenantScope } = require('../middleware/auth');

router.use(protect, tenantScope);

router.route('/').get(c.getProducts).post(authorize('admin', 'staff'), c.createProduct);
router
  .route('/:id')
  .put(authorize('admin', 'staff'), c.updateProduct)
  .delete(authorize('admin'), c.deleteProduct);

module.exports = router;
