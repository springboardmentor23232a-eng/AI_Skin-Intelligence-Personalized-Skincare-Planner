const express = require("express");

const router = express.Router();

const {
    authenticateToken
} = require("../middleware/auth");

const pool = require("../db");



// GET USER PROFILE

router.get("/", authenticateToken, async (req,res)=>{

    try{

        const result = await pool.query(

            "SELECT id,name,email,role,provider,created_at FROM users WHERE id=$1",

            [req.user.id]

        );


        res.json(result.rows[0]);


    }
    catch(error){

        res.status(500).json({
            message:"Server Error"
        });

    }

});




// UPDATE USER PROFILE

router.put("/", authenticateToken, async(req,res)=>{


    try{

        const {name,email}=req.body;


        const result = await pool.query(

            "UPDATE users SET name=$1,email=$2,updated_at=NOW() WHERE id=$3 RETURNING id,name,email,role",

            [
                name,
                email,
                req.user.id
            ]

        );


        res.json({

            message:"Profile Updated Successfully",

            user:result.rows[0]

        });


    }

    catch(error){

        res.status(500).json({
            message:"Server Error"
        });

    }


});



module.exports = router;