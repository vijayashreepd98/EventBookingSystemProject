const feedback = require('../models/feedbackModel.js');


exports.newFeedback =(feedbacks) =>{
    return new feedback({
        feedback: feedbacks
      });
}