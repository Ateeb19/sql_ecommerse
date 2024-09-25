const jwt = require('jsonwebtoken');
require('dotenv').config({path: './.env'});

const AuthenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if(!token) {
        return res.status(403).json({message: "token is required"});
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err) {
            return res.json({message: "token expire or invalid token", status: false});
        }else
        req.user = user;
        next();
    })
}

module.exports = AuthenticateToken;