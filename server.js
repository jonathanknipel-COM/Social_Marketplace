/*import the tools*/
require('dotenv').config();
const express = require ('express');
const mongoose = require ('mongoose');

/*initialize the app*/
const app = express();
const PORT = 3000;

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