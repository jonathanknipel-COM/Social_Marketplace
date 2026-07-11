require('dotenv').config();
const express = require ('express');
const mongoose = require ('mongoose');

const app = express();
const PORT = 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Successfully connected to the ShareIt MongoDB Database!");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
    });

app.get('/', (req,res) => {
    res.send("hello team a! shareit is alive!");
});

app.listen(PORT, () => {
    console.log(`server is actively running on on http://localhost:${PORT}`);
});