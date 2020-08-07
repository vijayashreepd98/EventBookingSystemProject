const feedback = require('../models/feedbackModel.js');


exports.newFeedback =(feedbacks,userName) =>{
  return new feedback({
    feedback: feedbacks,
    userName : userName
  });
}

exports.getFeedback = () =>{
  return feedback.find( { 
       
  }, {
    feedback :1,
    userName:1
  });
}

exports.deleteFeedback = () =>{
  return feedback.deleteMany();
}