const express = require("express");

const router = express.Router();

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth");



// USER Dashboard

router.get(
"/user",
authenticateToken,
authorizeRoles("USER"),
(req,res)=>{

    res.json({
        message:"Welcome User Dashboard",
        user:req.user
    });

});



// WELLNESS COACH Dashboard

router.get(
"/coach",
authenticateToken,
authorizeRoles("WELLNESS_COACH"),
(req,res)=>{

    res.json({
        message:"Welcome Wellness Coach Dashboard",
        user:req.user
    });

});



// ADMIN Dashboard

router.get(
"/admin",
authenticateToken,
authorizeRoles("ADMIN"),
(req,res)=>{

    res.json({
        message:"Welcome Admin Dashboard",
        user:req.user
    });

});


module.exports = router;
