const jwt = require("jsonwebtoken");


function authenticateToken(req,res,next){

    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];


    if(!token){

        return res.status(401).json({
            message:"Access denied. Token missing"
        });

    }


    jwt.verify(token, process.env.JWT_SECRET, (err,user)=>{


        if(err){

            return res.status(403).json({
                message:"Invalid Token"
            });

        }


        req.user = user;

        next();


    });


}



function authorizeRoles(...roles){

    return (req,res,next)=>{


        if(!roles.includes(req.user.role)){

            return res.status(403).json({
                message:"You don't have permission"
            });

        }


        next();

    }

}



module.exports={
    authenticateToken,
    authorizeRoles
};