const express = require('express');
const router = express.Router();
const cors = require('cors');
const readLater = require('../models/readLaterList');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('../models/UserSchema');
const auth = require('../middlewares/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require("dotenv").config();

router.use(cors());
router.use(bodyParser.json())


// >>>>>>>>>>>>>>>>>>> Adding to Bookmarks List <<<<<<<<<<<<<<<<<<<<<<<<< 

router.post("/add-bookmarks", (req, res) => {
    token = req.headers.authorization.split(" ")[1]
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    let userid = verified.id;
    console.log("hit api");
    console.log("request",req.body);
    readLater.create({
        user:userid,
        title: req.body.selectedArticle.title,
        url: req.body.selectedArticle.url,
        publishedAt: req.body.selectedArticle.publishedAt,
        urlToImage: req.body.selectedArticle.urlToImage
    }, (err, result) => {
        if (err) {
            res.send({err: err.message})
        };
        res.send({message:"Success"});
    })
});

// >>>>>>>>>>>>>>>>>>> Delete Bookmarks List <<<<<<<<<<<<<<<<<<<<<<<<< 

router.delete("/delete-showing", (req, res) => {
    token = req.headers.authorization.split(" ")[1]
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const byId = {_id:req.body._id};
    readLater.findOneAndDelete({byId}, (err, result) => {
        if (err) throw err
        res.send({message:"Deleted ", result})
    })
})

// >>>>>>>>>>>>>>>>>>> View Bookmarks List <<<<<<<<<<<<<<<<<<<<<<<<< 

router.get("/view-bookmarks", (req , res) => {
    token = req.headers.authorization.split(" ")[1]
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    console.log("Verified: " , JSON.stringify(verified))
    let userid = verified.id;
    // let token = req.body.token;
    console.log(token);
    // let jwtsecretkey = process.env.JWT_SECRET;
    // const verified = jwt.verify(token, jwtsecretkey)
    // console.log(user, req.body);
    if (verified) {
        console.log(`Verified ${verified}`);
    } else {
        res.send({token})
    }
    readLater.find({user:userid}, (err, result) => {
        if (err) throw err;
        res.send(result)
    })
});

// >>>>>>>>>>>>>>>>>>> Deleting Bookmarks List <<<<<<<<<<<<<<<<<<<<<<<<< 

router.delete("/delete-bookmarks", (req, res) => {
    const byId = {_id:req.body._id};
    console.log(req.body._id)
    readLater.deleteOne(byId, (err, result) => {
        // console.log("Movie deleted");
        if (err) throw err;
        if (result == null) {
            res.send({message: "News Not Deleted"})
        }r
        res.send({message:"Delete Successful"})
    })
});

// >>>>>>>>>>>>>>>>>>> Login and SignUp Api <<<<<<<<<<<<<<<<<<<<<<<<< 

router.post('/login', async(req, res)=> {
    try {
        const {email, password} = req.body;
        //Validate
        if(!email || !password) {
            return res.status(400).json({message: "Not all fields have been entered", code:997})
        }
        //Checking email and compare to database
        const user = await User.findOne({email:email});
        if (!user) {
            return res.status(400).json({message: "No account is registered with this email", code:999});
        }
        //Checking password and comparing with hashed pass in database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({message: "Invalid email or password", code:998})
        }
        //Creating the jwt token 
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        });
    }catch (e) {
        res.status(500).json({err: e.message})
    }
  })

router.post('/signup', async(req, res)=> {
    try {
      const {firstName,lastName,email,password,passwordCheck} = req.body;
      //Validate
      // Status code 400 means bad request
      // Status code 500 means internal server error
      if (!email || !password || !passwordCheck || !firstName || !lastName) {
        return res.status(400).json({message: "Not all fields have been entered"})
      }
      //Checking to ensure password length is at least 5char
      if (password.length < 5) {
        return res.status(400).json({message: "The password needs to be at least 5 characters long"})
      }
      //Comparing the password 
      if(password !== passwordCheck) {
        return res.status(400).json({message: "Password do not match"})
      }
      //Checking database and running an email check to ensure no duplicate emails
      const existingEmail = await User.findOne({email: email});
      if (existingEmail) {
        return res.send({message: "Email exists"})
      }
      //Using bcrypt to hash password
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
      //Creating out new user notice password value is passwordHash not password
      const newUser = new User({
        email: email,
        password: passwordHash,
        firstName: firstName,
        lastName: lastName
      });
      const savedUser = await newUser.save();
      res.json(savedUser);
      //Catching errors
    }catch (error) {
        res.status(500).json({err: error.message})
    }
  })

router.delete("/delete", auth, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.user);
        res.json(deletedUser);
    } catch (e) {
        res.status(500).json({err : e.message});
    }
});

// validating if user is logged in by boolean check most useful for front-end
router.post("/tokenValid", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if(!token) return res.json(false);

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if(!verified) return res.json(false);

        const user = await User.findById(verified.id);
        if (!user) return res.json(false);

        return res.json(true);
    }catch (e) {
        res.status(500).json({err : e.message});
    }
});

// >>>>>>>>>>>>>>>>>>> Postman Testing <<<<<<<<<<<<<<<<<<<<<<<<< 


/* const newsListData = () => {

    fetch('https://newsapi.org/v2/everything?q=business&apiKey=8bae802e8a7a4725873c57ce4b74f37d')
            .then(res=>res.json())
            .then(json=> res.send(json.articles)
            ).catch(e => {
                console.log(e);
            })
} */

router.get('/get-news', async(req, res) => {
    fetch('https://newsapi.org/v2/everything?q=business&apiKey=8bae802e8a7a4725873c57ce4b74f37d')
            .then(res=>res.json())
            .then(json=> {
                    let result = json.articles
                    res.send(result)
                }
            ).catch(e => {
                console.log(e);
            })
})


module.exports = router;