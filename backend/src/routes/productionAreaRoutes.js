const router = require('express').Router();
const c = require('../controllers/productionAreaController');
const { protect, authorize, tenantScope } = require('../middleware/auth');

router.use(protect, tenantScope);

router.route('/').get(c.getAreas).post(authorize('admin'), c.createArea);
router.route('/:id').put(authorize('admin'), c.updateArea).delete(authorize('admin'), c.deleteArea);

module.exports = router;
