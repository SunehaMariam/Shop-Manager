const router = require('express').Router();
const c = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

// Poora companies module sirf superadmin ke liye
router.use(protect, authorize('superadmin'));

router.route('/').get(c.getCompanies).post(c.createCompany);
router.route('/:id').get(c.getCompany).put(c.updateCompany).delete(c.deleteCompany);
router.put('/:id/admin-password', c.resetAdminPassword);

module.exports = router;
