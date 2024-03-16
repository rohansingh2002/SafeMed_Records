const router = require('express').Router();
const { isAuthenticatedUser } = require('../middlewares/auth');
const patientController = require('./../controllers/patientController');

router.post('/register', patientController.register);
router.post('/login', patientController.login);

router.use(isAuthenticatedUser);

router.get('/getAllTickets', patientController.getAllTickets);
router.post('/uploadFile', patientController.uploadFile);
router.get('/getFiles', patientController.getFiles);

router.post('/createVaultRecord', patientController.createRecord);
router.get('/getVaultRecords', patientController.getRecords);
router.post('/grantRecordAccess', patientController.grantAccess);
router.post('/revokeRecordAccess', patientController.revokeAccess);
router.post('/uploadRecordFile', patientController.uploadRecordFile);
router.get('/getRecordFiles', patientController.getRecordFiles);

module.exports = router