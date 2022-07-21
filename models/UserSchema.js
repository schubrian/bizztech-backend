const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');


const userDetailsList = new mongoose.Schema({
    //_id: String,
    firstName:{
        type:String,
        require:[true, "Can't be blank"]
    },
    lastName:{
        type:String,
        require:[true, "Can't be blank"]
    },
    email:{
        type:String,
        lowercase: true,
        unique: true,
        require:[true, "Can't be blank"],
        index: true,
        validate: [isEmail, "invalid email"]
    },
    password:{
        type:String,
        require:[true, "Can't be blank"]
    }
}, {minimize: false})

const userDetail = mongoose.model('userDetail', userDetailsList);
module.exports = userDetail;