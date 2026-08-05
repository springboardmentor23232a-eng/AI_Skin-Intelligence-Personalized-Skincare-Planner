const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();



// Register User

router.post("/register", async(req,res)=>{

    try{

        const {name,email,password,role}=req.body;


        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );


        if(existingUser.rows.length > 0){

            return res.status(400).json({
                message:"Email already exists"
            });

        }



        const hashedPassword = await bcrypt.hash(password,10);



        const result = await pool.query(

            "INSERT INTO users(name,email,password,role,provider) VALUES($1,$2,$3,$4,$5) RETURNING *",

            [
                name,
                email,
                hashedPassword,
                role,
                "LOCAL"
            ]

        );


        res.json({

            message:"Registration successful",

            user:result.rows[0]

        });


    }

    catch(error){

        res.status(500).json({
            message:"Server Error",
            error:error.message
        });

    }

});





// Login User

router.post("/login", async(req,res)=>{


    try{


        const {email,password}=req.body;



        const result = await pool.query(

            "SELECT * FROM users WHERE email=$1",

            [email]

        );



        if(result.rows.length===0){


            return res.status(400).json({

                message:"User not found"

            });

        }




        const user=result.rows[0];



        const validPassword = await bcrypt.compare(

            password,

            user.password

        );




        if(!validPassword){


            return res.status(400).json({

                message:"Wrong password"

            });

        }





        const token = jwt.sign(

            {

                id:user.id,

                email:user.email,

                role:user.role

            },


            process.env.JWT_SECRET,


            {

                expiresIn:"1h"

            }

        );





        res.json({

            message:"Login successful",


            token,


            user:{


                id:user.id,

                name:user.name,

                email:user.email,

                role:user.role


            }


        });



    }


    catch(error){


        res.status(500).json({

            message:"Server Error",

            error:error.message

        });


    }



});



module.exports = router;