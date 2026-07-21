const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcrypt'); //encryption tool
const {getLoggedInUser} = require('../utils/auth'); //tells us who is making the request
const {buildProductView} = require('../utils/product'); //tells us who is making the request

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

/*DISPLAY (all) - list every user (admin only). passwords are never sent back.*/
const getAllUsers = async (req, res) => {
    try {
        const requester = getLoggedInUser(req);
        if (!requester) {
            return res.status(401).json({message: "Please log in first."});
        }
        if (!requester.isAdmin) {
            return res.status(403).json({message: "Only admins can view all users."});
        }

        const users = await User.find();

        /*strip the password out of every user before sending them out*/
        const safeUsers = [];
        for (const u of users) {
            const obj = u.toObject();
            delete obj.password;
            safeUsers.push(obj);
        }

        res.status(200).json({count: safeUsers.length, users: safeUsers});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

/*DISPLAY (one) - get a single user by id (must be logged in). password is not sent.*/
const getUserById = async (req, res) => {
    try {
        const requester = getLoggedInUser(req);
        if (!requester) {
            return res.status(401).json({message: "Please log in first."});
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({message: "User not found."});
        }

        const products = await Product.find({
            donatedBy: user._id
        })

        const safeUser = {
            ...user.toObject(),
            password: undefined,
            products,
        }

        res.status(200).json({user: safeUser});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

/*UPDATE - edit a user (you can only edit yourself, unless you're an admin)*/
const updateUser = async (req, res) => {
    try {
        const requester = getLoggedInUser(req);
        if (!requester) {
            return res.status(401).json({message: "Please log in first."});
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({message: "User not found."});
        }

        /*a normal user may only edit their own account, an admin may edit anyone*/
        if (!user._id.equals(requester.id) && !requester.isAdmin) {
            return res.status(403).json({message: "You can only edit your own account."});
        }

        /*update the simple fields if they were sent*/
        if (req.body.fullName !== undefined) user.fullName = req.body.fullName;
        if (req.body.email !== undefined) user.email = req.body.email;
        if (req.body.city !== undefined) user.city = req.body.city;
        if (req.body.phone !== undefined) user.phone = req.body.phone;

        /*if a new password was sent, scramble it before saving (same as register)*/
        if (req.body.password !== undefined) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        /*only an admin is allowed to change the isAdmin flag (stops users making themselves admin)*/
        if (req.body.isAdmin !== undefined && requester.isAdmin) {
            user.isAdmin = req.body.isAdmin;
        }

        await user.save();

        const safeUser = user.toObject();
        delete safeUser.password;
        res.status(200).json({message: "User updated successfully", user: safeUser});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

/*DELETE - remove a user (you can only delete yourself, unless you're an admin)*/
const deleteUser = async (req, res) => {
    try {
        const requester = getLoggedInUser(req);
        if (!requester) {
            return res.status(401).json({message: "Please log in first."});
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({message: "User not found."});
        }

        if (!user._id.equals(requester.id) && !requester.isAdmin) {
            return res.status(403).json({message: "You can only delete your own account."});
        }

        await user.deleteOne();
        res.status(200).json({message: "User deleted successfully"});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

module.exports = {registerUser, getAllUsers, getUserById, updateUser, deleteUser}; //export functions
