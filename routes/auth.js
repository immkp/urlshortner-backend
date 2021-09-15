const express=require('express')
const bcrypt=require('bcrypt')
const jwt =require('jsonwebtoken')
const _ =require('lodash')
const nodemailer =require('nodemailer')
const User=require('../model/user')
const { authenticate } = require('../utils/authorize')
const jwtAccKey = process.env.JWT_ACC_KEY || ''

const router=express.Router()

router.get('/', (req,res)=>{
    res.send("API running")
})

//registration route
router.post('/register',async (req,res)=>{
    const {email,password}=req.body
    const user=await User.findOne({email:email})

    if(user) return res.json({"message":"User already present"})

    const token = jwt.sign({ email, password }, jwtAccKey, { expiresIn: '20m' })

    registrationMail(email,token,res)
   

})

//Account activation route
router.post('/account-activation', (req,res)=>{
    const {token}=req.body
    
    if(token){
        jwt.verify(token,process.env.JWT_ACC_KEY,async function(err, decodedToken){
            if(err){
                return res.status(400).json({error:"Incorrect or expried link"})
            }else{
                console.log(decodedToken)
                const {email,password}=decodedToken
                const user= await User.findOne({email:email})

                if(user)  return res.json({"message":"User already present"})
                
                let newUser= await User({email,password})
                
                const salt= await bcrypt.genSalt(10)
                const hashed=await  bcrypt.hash(password,salt)

                newUser.password=hashed
                await newUser.save()
                res.json({"message":"User created successfully",user})
    
            }
        })
    }else{
        return res.json({error:"something went wrong"})
    }
})

//login route
router.post('/login',async (req,res)=>{
    let user=await User.findOne({email:req.body.email})
    
    if(!user) return res.json({message: "Invalid Email or Password"})
    const {_id,email}=user
    if(user)
    {
        let isPasswordMatched=await bcrypt.compare(req.body.password,user.password)
        if(!isPasswordMatched){
            return res.json({message: "Invalid Email or Password"})
        }else{
            const token =jwt.sign({_id,email},'secretkey')
            res.json({token,success:"Login Sucessfull"})
        }
    }
})

//admin route
router.get('/products',authenticate, (req,res)=>{
    res.json({message:"authencticated with jwt"})
})

//forget password sends link to the mail
router.put('/forget-password',(req,res)=>{
    const {email}=req.body

    User.findOne({email},(err,user)=>{
        if(err || !user){
            return res.json({error:"User with this email does not exist"})
        }

        const token=jwt.sign({_id:user._id}, process.env.RESET_PASSWORD_KEY, {expiresIn:'20m'})
        

        return user.updateOne({resetLink:token},(err,success)=>{
            if(err){
                return res.status(400).json({error:"reset password link error"})
            } else{
                forgetPasswordMail(email, token,res)
            }
        })
    })
})

//reset password
router.put('/reset-password',async (req,res)=>{
    const {resetLink, newPass}=req.body 
    const salt= await bcrypt.genSalt(10)
    const hashed=await bcrypt.hash(newPass,salt)
    console.log(hashed)
    if(resetLink){
        jwt.verify(resetLink,process.env.RESET_PASSWORD_KEY, (err,decodedData)=>{
            console.log(decodedData)
            if(err){
                return res.status(401).json({
                    error:'Incorrect token or it is expired'
                })
            }
            User.findOne({resetLink},(err,user)=>{
                if(err || !user){
                    return res.status(400).json({error:'User with this token does not exist.'})
                }

                const obj={
                    password:hashed,
                    resetLink:''
                }

                user=_.extend(user,obj);
                user.save((err,result)=>{
                    if(err){
                        return res.status(400).json({error:"reset password error"})
                    }else{
                        return res.status(200).json({message:"Your password has been changed."})
                    }
                })
            })
        })
    }else{
        return res.status(401).json({error:'Authentication error!'})
    }
})

//registration mail
try{
    function registrationMail(email,token,res) {
        let transporter = nodemailer.createTransport({
           service: "gmail", 
            auth: {
                user: process.env.EMAIL, // generated ethereal user
                pass: process.env.PASS, // generated ethereal password
            },
        });
    
        // send mail with defined transport object
        let info =  transporter.sendMail({
            from: process.env.EMAIL, // sender address
            to: email, // list of receivers
            subject: "Account Activation Link", // Subject line
            text: "Hello ", // plain text body
            html: `
                    <h2>Please click on given link to activate your account</h2>
                    <p>${process.env.CLIENT_URL}/authentication/activate/${token}</P>
            `, // html body
        });
    
        // verify connection configuration
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log("Mailed!!");
                res.json({message:"email is sent to eamil account. Please validate your account."})
            }
        });
    
    }
}
catch(err){
    console.log("error while sending mail",err)
}

//forget password mail
try{
    function forgetPasswordMail(email,token,res) {
        let transporter = nodemailer.createTransport({
           service: "gmail", 
            auth: {
                user: process.env.EMAIL, // generated ethereal user
                pass: process.env.PASS, // generated ethereal password
            },
        });
    
        // send mail with defined transport object
        let info =  transporter.sendMail({
            from: process.env.EMAIL, // sender address
            to: email, // list of receivers
            subject: "Password Reset Link", // Subject line
            text: "Hello ", // plain text body
            html: `
                    <h2>Please click on given link to reset your password</h2>
                    <p>${process.env.CLIENT_URL}/resetpassword/${token}</P>
            `, // html body
        });
    
        // verify connection configuration
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
            } else {
                res.json({message:"Email has been sent, kindly follow the instruction"})
                console.log("Mailed!!");
            }
        });
    
    }
}
catch(err){
    console.log("error while sending mail",err)
}



module.exports=router