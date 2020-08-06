const commentList = require('../models/addComment.js');



exports.getComments = (eventName,eventId)=> {
    return commentList.find({ eventName: eventName,
        eventId:eventId
      });
}

exports.viewComments = (eventName)=> {
    return commentList.find({ eventName: eventName
      });
}

exports.addComments = (eventName,eventId,userName,comments,times) => {
    return new commentList({
        eventName: eventName,
        eventId: eventId,
        userName: userName,
        comments: comments,
        time: times
      });
}

exports.deleteComment = (eventName) =>{
    return commentList.deleteMany({
        eventName: eventName 
      });

}