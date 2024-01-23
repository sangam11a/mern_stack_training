const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//models
const userModel = require('../models/userModel.cjs');
const foodModel = require("../models/foodModel.cjs")

function verifyToken(req,res,next)
{

    if(req.headers.authorization!==undefined)
    {
        let token =  req.headers.authorization.split(" ")[1];

        jwt.verify(token,"nutrifyapp",(err,data)=>{
            if(!err)
            {
                next();
            }
            else 
            {
                res.status(403).send({message:"Invalid Token"})
            }
        })

    
    }
    else 
    {
        res.send({message:"Please send a token"})
    }
    
}


mongoose.connect('mongodb://localhost:27017/nutrify')
.then(()=>{
    console.log("Database connected successfully");

})
.catch((err)=>{
    console.log('Error in database connection : ');
});


const app = express();

app.use(express.json());



app.post('/register',async (req,res)=>{
    let user = req.body;
   
        bcrypt.genSalt(10,(err,salt)=>{
            if(!err){
                bcrypt.hash(user.password,salt,async(err, hpass)=>{
                    if(!err){
                        user.password = hpass;
                        console.log(hpass);
                        try{
                            let doc = await userModel.create(user);
                            res.status(201).send({message:"User registered"});
                        }
                        catch(err){
                            console.log(err);
                            res.status(500).send({message:"SOme problem in user registration"});
                        }
                    }
                    else{
                        console.log(err);
                    }
                });
            }
        })
    


});

app.post("/login", async(req, res)=>{
    let userCred = req.body;
    console.log(userCred);
    try{
        const user = await userModel.findOne({email:userCred.email});
        if(user != null){
            console.log("got here",user)
            let hpass;
            // bcrypt.hash(user.password,salt,async(err, hpass)=>{
            //     hpass = hpass;
            // },
            bcrypt.compare(userCred.password,user.password,(err, success)=>{
                if(success == true){
                    console.log(success);
                    jwt.sign({email:userCred.email}, "nutrifyapp", (err, token)=>{
                        console.log(token);
                        if(!err){
                            res.send({message:"Login success", token:token});
                        }
                    });
                }
                else{
                    console.log(err)
                    res.status(403).send({message:"Incorrect password"});
                }
            })
        }
        else{
            res.status(404).send({message:"User not found"});
        }
    }
    catch(err){
        console.log(err);
        res.status(500).send({message:"SOme problem "});
    }
});

app.get("/foods", verifyToken, async(req, res)=>{
    try{
        let foods = await foodModel.find();
        res.send(foods);

    }
    catch(err){
        console.log(err);
        res.status(500).send({message:"SOme problem reading food model"});
    }
});


app.listen(8000,()=>{
    console.log("Server is up and running");
})

