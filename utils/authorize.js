const jwt=require('jsonwebtoken')
const authenticate = async (req,res,next)=>{
    try {
        const headerToken = await req.headers["authorization"];
        if(!headerToken){
            return res.sendStatus(403)
        }
        const bearer = headerToken.split(" ");
        
        const bearerToken = bearer[1];
        if(!bearerToken){
            return res.sendStatus(403);
        }
        jwt.verify(bearerToken,'secretkey', (err,decoded)=>{
            if(err){
                return res.sendStatus(401)
            }
            if(decoded){
                console.log("DECOD",decoded )
                const auth = decoded;
                req.body.auth = auth;
                next();
            }
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(401)
    }
}

module.exports={ authenticate};