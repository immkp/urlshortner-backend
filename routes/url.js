const express=require('express')
const Url=require('../model/urls')
const uniqid=require('uniqid')
const moment=require('moment')
const router=express.Router()

router.get('/test',(req,res)=>{
    res.send('Url shorten api running')
})

//api shorten
router.post('/',(req,res)=>{
    console.log(req.body)
    
    if(req.body.url){
        var urlData=req.body.url
    }
    console.log("url is:",urlData)
    //checking the url is already exists
    Url.findOne({url:urlData},(err,doc)=>{
        if(doc){
            const hash=doc._id
            res.send(hash)
            console.log('already present')
        }else{
            console.log('new entry')
            const webAddress=new Url({
                _id:uniqid(),
                url:urlData
            })
            webAddress.save((err)=>{
                if(err){
                    return console.log(err)
                }
                res.send({
                    url:urlData,
                    hash:webAddress._id,
                    status:200,
                    statusTxt:'Ok'
                })
            })
        }
    })
})

//get all urls
router.get("/allurl",(req,res)=>{
    Url.find().exec((err,urls)=>{
        if(err) return res.status(400).json({Success:"false",err})
        return res.status(200).json({Success:"true",urls:urls})  
    })
})

//per day count
router.get('/record-per-day',async (req,res)=>{
    const today = moment().startOf('day')

           const records=await Url.find({
            createdAt: {
                $gte: today.toDate(),
                $lte: moment(today).endOf('day').toDate()
            }
            })
        res.json(records.length)
    
})

//record per month
//per day count
router.get('/record-per-month',async (req,res)=>{
    const today = moment().startOf('month')
    const end=moment().endOf('month').toDate()
    console.log("today:::",today)
    console.log("end::::",end)
           const records=await Url.find({
            createdAt: {
                $gte: today.toDate(),
                $lte: moment().endOf('month').toDate()
            }
            })
        res.json(records.length)
    
})

module.exports=router