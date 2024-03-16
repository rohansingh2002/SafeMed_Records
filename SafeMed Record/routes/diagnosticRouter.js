const router = require('express').Router();
const { isAuthenticatedUser } = require('../middlewares/auth');
const diagnosticController = require('./../controllers/diagnosticController');

router.post('/register', diagnosticController.register);
router.post('/login', diagnosticController.login);

router.use(isAuthenticatedUser);
router.get('/getAllTickets', diagnosticController.getAllTickets);
router.post('/uploadFile', diagnosticController.uploadFile);
router.get('/getFiles', diagnosticController.getFiles);

module.exports = router