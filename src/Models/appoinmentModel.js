const { default: mongoose } = require("mongoose");

const appointmentSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    },
    docId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Doctors"
    },
    slotDate:{
        type:Date,
        required:true
    },
    slotTime:{
        type:String,
        required:true
    },
    userData:{
        type:Object,
        required:true
    },
    docData:{
        type:Object,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    cancelled:{
        type:Boolean,
        default:false
    },
    payment:{
        type:Boolean,
        required:true,
        default:false,
    },
})
const Appointment=mongoose.model("Appointment",appointmentSchema);
module.exports=Appointment;