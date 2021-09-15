const mongoose=require('mongoose')

const urlSchema=mongoose.Schema({
    _id:{
        type:String
    },
    url:{
        type:String,
        required:true
    },
    hash:{
        type:String,
    },
   date:{
       type:Date,
       default:Date.now
   }
},{
    timestamps:true
})

module.exports=mongoose.model('Url',urlSchema)