const User = require('../models/User');
const bcrypt = require('bcrypt'); //to compare the typed password against the scrambled one
const jwt = require('jsonwebtoken'); //to hand the user a login token

/*
 * login (needed for sections 25-27):
 * checks the email + password, and if they match, gives back a token
 * that the user sends with future requests to prove they're logged in.
 */
const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body; //grab the login details from the request

        /*find the user by their email*/
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message: "Invalid email or password."}); //vague on purpose, safer
        }

        /*compare the typed password with the scrambled one in the db*/
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({message: "Invalid email or password."});
        }

        /*build a token that carries who they are + whether they're an admin*/
        const token = jwt.sign(
            {id: user._id, isAdmin: user.isAdmin},
            process.env.JWT_SECRET,
            {expiresIn: '7d'} //token is good for a week
        );

        res.status(200).json({
            message: "Logged in successfully",
            token, //the client saves this and sends it back in the "Authorization" header (raw, no "Bearer " prefix)
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

module.exports = {loginUser};
