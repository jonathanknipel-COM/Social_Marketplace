const user = require('../models/User');
const bcrypt = require('bcrypt'); //encryption tool

const registerUser = async(req, res) => {
    try {
        const {fullName, email, password, city, phone} = req.body; //extract data from incoming request

        /*check if user with this info already exists*/
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: "A user with this email already exists."});
        }
        /*encrypt password*/
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        /*create the new user obj*/
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword, //save the scrambled password, not the real one
            city,
            phone
        });

        await newUser.save(); //save the new user to the db

        res.status(201).json({message: "New user created successfully", user: newUser}); //send a success response

    } catch(error){
        res.status(500).json({message: "Server error", error: error.message}); //send an error response
    }
};

module.exports = {registerUser}; //export function
