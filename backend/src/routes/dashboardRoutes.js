const router = require('express').Router();
const { superStats, companyStats } = require('../controllers/dashboardController');
const { protect, authorize, tenantScope } = require('../middleware/auth');

router.get('/super', protect, authorize('superadmin'), superStats);
router.get('/company', protect, tenantScope, companyStats);

module.exports = router;
