let mongoose = require('mongoose');

let feedbackModel = mongoose.model('feedback', {
  
  userName : {
    type:String,
    
  },
  feedback : {
    type: String
    
  }
});
module.exports =feedbackModel ;
