const router = require('express').Router();
const c = require('../controllers/userController');
const { protect, authorize, tenantScope } = require('../middleware/auth');

router.use(protect, tenantScope, authorize('admin', 'superadmin'));

router.route('/').get(c.getUsers).post(c.createStaff);
router.put('/:id/toggle', c.toggleUser);
router.delete('/:id', c.deleteUser);

module.exports = router;
