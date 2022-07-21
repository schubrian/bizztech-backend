const jwt = require("jsonwebtoken");

//Status code 401 means unauthorized

const auth = (req, res, next) => {
    try{
        //Checking x-auth-token with our jwt token
        const token = req.header("x-auth-token");
        if(!token) {
            return res.status(401).json({message: "No authentication token, authorization DENIED"})
        }
        //Grabbing out the token, passing our JWT_SECRET and checking its coordinates with our user we have selected
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) {
            return res.status(401).json({message: "Token verification failed"})
        }
        req.user = verified.id;
        next();
    }catch (e) {
        res.status(500).json({err: e.message})
    }
};

module.exports = auth;