const express = require('express');
const mongoose = require('mongoose');
const readLater = require('./models/readLaterList')
const cors = require('cors');
const router = require('./routes/route');
const jwt = require('jsonwebtoken');
const {expressjwt} = require('express-jwt');
require("dotenv").config();
const User = require('./models/UserSchema')


const JWT_SECRET = 'disjfnnwongeinfoinwogwefoenfoinwfignwonegwgf'

const app = express();
const PORT = process.env.PORT || 1090
app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(
    expressjwt({
        secret: JWT_SECRET,
        algorithms: ["HS256"],
    }).unless({ path: ["/sign-in","/","/login", "/get-news", "/sign-up", "/signup"] })
)
app.use('/', router);


mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


app.listen(PORT,() => {
    console.log(`Server is running on ${PORT}`);
})