const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

//For unauthorized users
const allowedPaths = ["/api/login","/api/register"]

//For logged in users
const notAllowedPaths = ["/api/login","/api/register"]

const verifyToken = async (req,res,next) =>{
    try {
        const bearerHeader = req.headers["authorization"]
        if(!bearerHeader){
            if(allowedPaths.includes(req.path))
                return next()
            return res.status(401).send("Unauthorized")
        }
        const bearerToken = bearerHeader.split(' ')
        if(bearerToken.length != 2){
            return res.status(400).send("Bad request")
        }
        const verify = await jwt.verify(bearerToken[1],process.env.JWT_SECRET_KEY,(err,decoded)=>{
            if(allowedPaths.includes(req.path) && err)
                return next()
            else if(err){
                return res.status(401).send("Unauthorized")
            }
            else if(decoded && notAllowedPaths.includes(req.path)){
                return res.status(200).send("Already logged in")
            }
            else if(decoded){
                req.accountId = decoded.accountId
                return next()
            }
        })  
    } catch (error) {
        console.log(error)
        res.status(500).send("Server error")
    }
    
}

module.exports = verifyToken