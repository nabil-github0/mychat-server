const pool = require("../db");
const bcrypt = require("bcrypt");
const {v4 : uuid4} = require("uuid");
const { jwtSign, jwtVerify, getJwt } = require("./jwt/jwtAuth");
require("dotenv").config()

module.exports.handleLogin = (req,res) => {
    const token = getJwt(req);

    if(!token) {
        res.json({loggedIn:false});
        return;
    }

    jwtVerify(token, process.env.JWT_SECRET)
    .then(() => {
        res.json({loggedIn:true, token})
    }).catch(err => {
        console.log(err)
        res.json({loggedIn:false})
    })
}

module.exports.attemptLogin = async (req,res) => {
    const potentialLogin = await pool.query(
        "SELECT id,username,passhash,userid FROM users u WHERE u.username=$1", [req.body.username])

    if(potentialLogin.rowCount > 0) {
        const isSamePass = await bcrypt.compare(req.body.password, potentialLogin.rows[0].passhash);
    
        if(isSamePass) {
            jwtSign({
                username:req.body.username,
                id:potentialLogin.rows[0].id,
                userid:potentialLogin.rows[0].userid
            }, process.env.JWT_SECRET, 
            {
                expiresIn:"7d"
            }).then(token => {
                res.json({loggedIn:true, token})
            }).catch(err => {
                console.log(err);
                res.json({loggedIn:false, status: "Something went wrong, try again later"})
            }) 
        }else {
        console.log("Not good")
        res.json({loggedIn:false,status:"Wrong username or password"})
        } }else {
        console.log("Not good")
        res.json({loggedIn:false,status:"Wrong username or password"})
    }
}

module.exports.attemptRegister = async (req,res) => {
    const existingUser = await pool.query("SELECT username FROM users WHERE username = $1", 
    [req.body.username]);

    if(existingUser.rowCount === 0) {
        const hashedPass = await bcrypt.hash(req.body.password, 10);
        const newUserQuery = await pool.query(
            "INSERT INTO users(username,passhash,userid) VALUES($1,$2,$3) RETURNING id,username,userid",
            [req.body.username, hashedPass,uuid4()]
            );
             jwtSign({
                username:req.body.username,
                id:newUserQuery.rows[0].id,
                userid:newUserQuery.rows[0].userid
            }, process.env.JWT_SECRET, 
            {
                expiresIn:"7d"
            }).then(token => {
                res.json({loggedIn:true, token})
            }).catch(err => {
                console.log(err);
                res.json({loggedIn:false, status: "Something went wrong, try again later"})
            }) 
    }else {
        res.json({loggedIn:false, status:"Username already taken"})
    }
}