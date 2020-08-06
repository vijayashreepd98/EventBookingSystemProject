const bookedTickets = require('../models/ticketModel.js');


exports.bookingTicket = (userName,eventName,numberOfTicket,today,cost,paid,image,description)=>{
    return new  bookedTickets( {
        userName: userName,
        eventName: eventName,
        noOfTicket: numberOfTicket,
        bookingTime: today,
        cost:cost,
        paid:paid,
        image:image,
        description:description
      });
}

exports.getBookedTickets = (userName,status) =>{
    return bookedTickets.find( {userName: userName,
        status: status
      }, {
        eventName: 1,
        userName: 1,
        noOfTicket :1,
        bookingTime: 1,
        cost: 1,
        paid: 1,
        image:1
      }); 
}



exports.updatingTicketHistory = (userName) =>{
    
    return bookedTickets.updateMany({
        userName: userName 
        
      }, {
        status: 1
    });
    
}

exports.getSoldTicket = (eventName,description,image)=> {
    return bookedTickets.find({eventName:eventName,
        description:description,
        image:image
      });
}