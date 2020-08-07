const eventStatus = require('../models/likeModel.js');

exports.createNewStatus = (eventName,userName,status) =>{
    return new eventStatus({
          eventName: eventName,
          userName: userName,
          status:status,
        });
}



exports.gettingEventStatus =(eventName,userName) =>{
    return eventStatus.findOne( {eventName: eventName,userName: userName 
    });
}


exports.eventStatusUpdate = (userName,eventName,status,like) =>{
    return eventStatus.findOneAndUpdate({
        userName: userName, 
        eventName: eventName
      }, {
        status: status,
        likes: like 
      });
}


exports.deleteStatus = (eventName) =>{
    return eventStatus.deleteMany({
        eventName:eventName
      });
}


exports.viewEventStatus = (status,eventName) =>{
    return eventStatus.find({
        status:status,
        eventName:eventName
      });
}