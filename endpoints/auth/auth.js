const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const fs = require('fs')
const uuid = require('uuid')
const bcrypt = require('bcrypt')

const pool = require('../../db/db.js')

//Middleware
const verifyToken = require('../../middleware/verifyToken.js')

dotenv.config()


module.exports = (app) => {
    //https://www.section.io/engineering-education/how-to-build-authentication-api-with-jwt-token-in-nodejs/
    app.post('/api/register', async (req,res)=>{
        try {
            const { email, password } = req.body

            if(!(email && password))
                return res.status(400).send("Bad request")
            
            const promisePool = pool.promise()
            const [rows] = await promisePool.execute("SELECT * FROM accounts WHERE email = ?;",  [email.toLowerCase()])
            
            if(rows.length > 0){
                return res.status(409).send("Email is taken")
            } 
            
            const ecnryptedPassword = await bcrypt.hash(password, 10)

            const account = {
                id: uuid.v4(),
                email: email.toLowerCase(),
                password: ecnryptedPassword,
            }
            
            pool.execute("INSERT INTO accounts (id,email,password) VALUES (?,?,?);",[account.id,account.email,account.password])
            const token = jwt.sign(
                {id:account.id},process.env.JWT_SECRET_KEY,{algorithm: 'RS256',expiresIn: "1h"}
            )

            res.status(200).send({token: token})
        } catch (error) {
            console.log(error)
            res.status(500).send("Server error")
        }
    })
    app.post('/api/login',verifyToken, async (req,res)=>{
        try {
            const { email, password } = req.body

            if(!(email && password))
                return res.status(400).send("Bad request")
            
            const promisePool = pool.promise()
            const [rows] = await promisePool.execute("SELECT * FROM accounts WHERE email = ?;",  [email.toLowerCase()])
            
            if(rows.length == 0){
                return res.status(409).send("No account found, want to register instead?")
            }
            const account = rows[0]

            if(!(await bcrypt.compare(password,account.password)))
                return res.status(401).send("Password wrong")
            

            const token = jwt.sign(
                {id:account.id},process.env.JWT_SECRET_KEY,{algorithm: 'RS256',expiresIn: "1h"}
            )

            res.status(200).send({token: token})
        } catch (error) {
            console.log(error)
            res.status(500).send("Server error")
        }
    })
    /* app.delete('/api/logout', verifyToken, async (req,res)=>{
        try {
            
        } catch (error) {
            console.log(error)
            res.status(500).send("Server error")
        }
    }) */
}