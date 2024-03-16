const router = require('express').Router();
const { isAuthenticatedUser } = require('../middlewares/auth');
const hospitalController = require('./../controllers/hospitalController');

router.post('/register', hospitalController.register);
router.post('/login', hospitalController.login);

router.use(isAuthenticatedUser);

router.post('/addDoctor', hospitalController.addDoctor);
router.get('/getAllDoctors', hospitalController.getAllDoctors);

router.post('/addDiagnostic', hospitalController.addDiagnostic);
router.get('/getAllDiagnostics', hospitalController.getAllDiagnostics);

router.post('/createTicket', hospitalController.createTicket);
router.get('/getAllTickets', hospitalController.getAllTickets);

router.post('/uploadFile', hospitalController.uploadFile);
router.get('/getFiles', hospitalController.getFiles);

module.exports = router