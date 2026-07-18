/*import the tools*/
require('dotenv').config();
const express = require ('express');
const mongoose = require ('mongoose');

/*initialize the app*/
const app = express();
const PORT = 3000;

app.use(express.json()); //teach express how to read json

/*import and use user routes*/
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

/*import and use auth (login), product and category routes*/
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

/*connect to mongodb*/
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Successfully connected to the ShareIt MongoDB Database!");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
    });

/*create a route*/
app.get('/', (req,res) => {
    res.send("hello team a! shareit is alive!");
});

/*turn on the server*/
app.listen(PORT, () => {
    console.log(`server is actively running on on http://localhost:${PORT}`);
});