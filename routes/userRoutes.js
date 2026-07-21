const express = require('express');
const router = express.Router();
const {
    registerUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/userController');

/*--- section 21/22: create a user (register) ---*/
router.post('/register', registerUser);

/*--- section 22: display / update / delete users (auth is checked inside the controllers) ---*/
router.get('/', getAllUsers);       //admin only
router.get(
'/:id', getUserById);    //any logged-in user
router.put('/:id', updateUser);     //self or admin
router.delete('/:id', deleteUser);  //self or admin

module.exports = router;
