const eventList = require('../models/eventModel.js');

exports.addNewEvent = (eventName,eventDetails,numberOfPeople,bookingStartTime,bookingEndTime,cost,image,totalTicket) =>{
    return new eventList({
        eventName: eventName,
        description: eventDetails,
        maxNoOfTicket: numberOfPeople,
        bookingStartTime: bookingStartTime,
        bookingEndTime: bookingEndTime,
        cost: cost,
        image : image,
        totalTicket:totalTicket
      });
}


exports.getEventList = ()=>{
    return eventList.find({
    },{
      eventName:1
    });
    
}

exports.getActiveEvents= (day)=> {
    return eventList.find( { bookingStartTime :{$lte:day},
        bookingEndTime:{$gte :day}
      }, {
      eventName: 1,
      description: 1,
      maxNoOfTicket: 1,
      bookingStartTime: 1,
      bookingEndTime: 1,
      cost: 1,
      likes: 1,
      image: 1,
      _id: 1
    });
   
}


exports.getUpcomingEvents= (day)=> {
    return eventList.find( { bookingStartTime :{$gte:day},
       
      }, {
      eventName: 1,
      description: 1,
      maxNoOfTicket: 1,
      bookingStartTime: 1,
      bookingEndTime: 1,
      cost: 1,
      likes: 1,
      image: 1,
      _id: 1
    });
   
}




exports.getAllEvents= ()=> {
    return eventList.find( { 
       
      }, {
      eventName: 1,
      description: 1,
      maxNoOfTicket: 1,
      bookingStartTime: 1,
      bookingEndTime: 1,
      cost: 1,
      likes: 1,
      image: 1,
      _id: 1
    });
   
}


exports.updateEvents = (eventId,likes) =>{
    
    return eventList.findOneAndUpdate({
        _id:eventId
      }, {
        likes: likes
      });
}

exports.updateTicket =(eventName,noOfTicket) =>{
    return  eventList.findOneAndUpdate({
        eventName: eventName
      }, {
        maxNoOfTicket : noOfTicket
      });
      
}

exports.getEvents =(eventName) =>{
    return eventList.findOne( { 
        eventName: eventName
      });
}


exports.updateEvent = (eventName,description,bookingStartTime,bookingEndTime,cost,maxNoOfTicket) =>{
    return eventList.findOneAndUpdate({
        eventName: eventName
      }, {
        description: description,
        bookingStartTime: bookingStartTime,
        bookingEndTime: bookingEndTime,
        cost: cost,
        maxNoOfTicket: maxNoOfTicket
      });
      
}



exports.eventDelete = (eventName,description,maxNoOfTicket,bookingStartTime,bookingEndTime,cost) =>{
    return eventList.findOneAndDelete({
        eventName: eventName,
        description:description,
        maxNoOfTicket:maxNoOfTicket,
        bookingStartTime:bookingStartTime,
        bookingEndTime:bookingEndTime,
        cost:cost
    
      });
}

exports.getLikes = (eventName) =>{
    return eventList.findOne({
        eventName: eventName
      },{
        likes:1
      });
}