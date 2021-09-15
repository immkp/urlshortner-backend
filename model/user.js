const mongoose=require('mongoose')

const userSchema=mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
   resetLink:{
       data:String,
       default:''
   }
})

module.exports=mongoose.model('User',userSchema)