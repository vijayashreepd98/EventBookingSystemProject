let mongoose = require('../../base/mongoose');

let addEventModel = mongoose.model('addEvents', {
  eventName: {
    type:String,  
    trim:true,
    required: true
  },
  description : {
    type :String,
    trim :true,
    required :true
  },
  maxNoOfTicket:{
    type: Number,
    required :true
  },
  
  bookingStartTime : {
    type:Date,
    required: true
  },
  bookingEndTime: {
    type:Date,
    required:true
  },
  cost: {
    type:Number,
    required:true
  },
  likes:{
    type:Number,
    default:1
  },
  image:{
    type:String,
    data: Buffer, 
    contentType: String 
    
  },
  totalTicket:{
    type:Number,
    required:true
  }
});
module.exports = addEventModel;
