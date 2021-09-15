const express=require('express')
const Url=require('../model/urls')
const router=express.Router()


router.get('/',(req,res)=>{
    const hash=req.headers.hash
    console.log(hash)
    Url.findOne({_id:hash})
        .then((doc)=>{
            return res.json({url:doc.url})
        })
        .catch((err)=>{
            return res.status(400).json({error:"sorry this link may expire"})
        })
})
module.exports=router