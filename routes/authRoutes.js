const express = require('express');
const router = express.Router();
const {loginUser} = require('../controllers/authController');

/*login route - hands back a token used by the protected routes*/
router.post('/login', loginUser);

module.exports = router;
