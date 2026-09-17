const router = require('express').Router();
const c = require('../controllers/shopController');
const { protect, authorize, tenantScope } = require('../middleware/auth');

router.use(protect, tenantScope);

router.route('/').get(c.getShops).post(authorize('admin'), c.createShop);
router
  .route('/:id')
  .get(c.getShop)
  .put(authorize('admin'), c.updateShop)
  .delete(authorize('admin'), c.deleteShop);

module.exports = router;
