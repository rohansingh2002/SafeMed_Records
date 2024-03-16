const router = require('express').Router();
const { isAuthenticatedUser } = require('../middlewares/auth');
const doctorController = require('./../controllers/doctorController');

router.post('/register', doctorController.register);
router.post('/login', doctorController.login);

router.use(isAuthenticatedUser);

router.get('/getAllTickets', doctorController.getAllTickets);
router.post('/uploadFile', doctorController.uploadFile);
router.get('/getFiles', doctorController.getFiles);


router.get('/getVaultRecords', doctorController.getRecords)
router.get('/getRecordFiles', doctorController.getRecordFiles);
module.exports = router