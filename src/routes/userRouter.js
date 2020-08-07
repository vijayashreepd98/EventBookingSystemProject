const express = require('express');
const hbs = require('hbs');
const app = express();
const moment = require('moment');


const customerModel = require('../models/registerModel.js');
const eventList = require('../models/eventModel.js');
const commentList = require('../models/addComment.js');
const eventStatus = require('../models/likeModel.js');
const bookedTickets = require('../models/ticketModel.js');
const feedback = require('../models/feedbackModel.js');
const customerMongoLib = require('../mongoLib/registrationMongoLib.js');
const eventMongoLib = require('../mongoLib/eventMongoLib.js');
const eventStatusMongoLib = require('../mongoLib/eventStatusMongoLib.js');
const commentMongoLib = require('../mongoLib/commentMongoLib.js');
const soldTicketMongoLib = require('../mongoLib/soldTicketMongoLib.js');
const feedbackMongoLib = require('../mongoLib/feedbackMongoLib.js');



app.set('view engine', 'hbs');

hbs.registerHelper('dateTime',function(datetime){
  return moment(new Date(datetime)).format('DD-MM-YYYY @  hh:mm A').min;
});

hbs.registerHelper('dateTime1',function(datetime){
  return moment(new Date(datetime)).format('DD-MM-YYYY @  hh:mm A');
});

hbs.registerHelper('if_Equal', function(value1,value2,option){
  if(value1== value2){
    return option.fn(this);
  }else{
    option.inverse(this);
  }

});

hbs.registerHelper('if_Greater1', function(value1,value2,value3,option){
  if(value1 >= value2 && value1<=value3){
    return option.fn(this);
  }else{
    option.inverse(this);
  }

});

hbs.registerHelper('if_Greater2', function(value1,value3,option){
  if(value1>value3){
    return option.fn(this);
  }else{
    option.inverse(this);
  }

});


hbs.registerHelper('if_Lesser', function(value1,value2,option){
  if(value1 <= value2){
    return option.fn(this);
  }else{
    option.inverse(this);
  }

});


hbs.registerHelper('if_eq', function(a, b, opts) {
    if(a%b==0&&a!=0)
        return opts.fn(this);
    else
        return opts.inverse(this);
});
hbs.registerHelper('json',function(context){
  return JSON.stringify(context);
});




/*USER REGISTRATION PAGE*/
exports.registration = async function(req, res)  {
  let name = req.body.username;    
  let password = req.body.password;
  let registered = await customerMongoLib.getCustomer(name,password);
  
  if(registered){
    res.send("USER ALREADY EXISTS!!!...");
  } else {
    let events = await eventMongoLib.getEventList();
    /*CREATING DEFAULT EVENT STATUS FOR AVAILABLE EVENTS FOR  NEW CUSTOMER*/
    for(let i=0;i< events.length;i++){
      let newUser =await  eventStatusMongoLib.createNewStatus(events[i].eventName,name,false);
      newUser.save();
    }
    let register = customerMongoLib.createNewUser(name,password);
    register.save().then(async() => {
      res.send("success");
    }).catch(() => {
      res.send("fail");
    });
  }
}


/*USER HOME PAGE*/
exports.userHomePage = async(req,res) =>{
  
  let day = new Date();
  /*CONVERTING DATE AND TIME TO SPECIFIC FORMAT*/
  let status= req.query.status;
  if(status ==0) {
  let today = day.getDate()+'/'+(day.getMonth()+1)+'/'+day.getFullYear()+'@ '+day.getHours()+
    ':'+day.getMinutes()+':'+day.getSeconds();  
    const events = await eventMongoLib.getActiveEvents(day);  
    
    if (events) {
      res.render('userEventView.hbs', {
        events:events,
        username:req.query.username,
        status:req.query.status,
        description:req.query.description
      });
    }
  }else if(status ==1) {
    let today = day.getDate()+'/'+(day.getMonth()+1)+'/'+day.getFullYear()+'@ '+day.getHours()+
    ':'+day.getMinutes()+':'+day.getSeconds(); 
    const events = await eventMongoLib.getUpcomingEvents(day);  
    if (events) {
      res.render('userEventView.hbs', {
        events:events,
        username:req.query.username,
        status:req.query.status,
        description:req.query.description
      });
    }

  } else{
    const events = await eventMongoLib.getAllEvents(); 
    if (events) {
      res.render('userEventView.hbs', {
        events:events,
        username:req.query.username,
        status:req.query.status,
        description:"ALL EVENTS",
        today:new Date
      });
    }

  }
}



/*USER LOGIN VALIDATION CHECKING*/
exports.login = async(req,res)=> {
  let name = req.body.name;
  let password = req.body.password;
  let user = await customerMongoLib.getCustomer(name,password)
  
  /*IF ENETERED USER NAME IS ALREADY AVAILABLE*/
  if(user){
    res.send("success");
  } else {
    res.send("fail")
  }
  
}


/*VIEWING VIEW MORE DETAILS OF PERTICULR EVENT WHICH CONATIND LIKES , COMMENTS  , BOOKING PERTICULAR EVENT*/
exports.viewMore = async(req,res) =>{
  let comments = await commentMongoLib.getComments(req.query.eventName,req.query.eventId);
  let allEvents = await eventStatusMongoLib.gettingEventStatus( req.query.eventName,req.query.username )
  let color1, color2;
  if(!allEvents){
    return  res.send("try again");
  }
  if (allEvents.status === true) {
    color1 = "blue";         /*WHEN USER ALREADY LIKED THE EVENT BEFORE THE BUTTON COLLOR SHOULD BE "BLUE"*/
    color2 = "black"
  } else {
    color1 = "black";        /*DEFAULT LIKE BUTTON COLOR "BLACK"*/
    color2 = "blue"
  }
   
  res.render('viewMore.hbs',{
    description: req.query.description,
    bookingStartTime: req.query.bookingStartTime,
    bookingEndTime: req.query.bookingEndTime,
    cost: req.query.cost,
    maxNoOfTicket: req.query.maxNoOfTicket,
    eventName:req.query.eventName,
    username: req.query.username,
    comments:comments,
    eventId:req.query.eventId,
    likes: req.query.likes,
    status: allEvents.status,
    color1: color1,
    color2: color2,
    image:req.query.image
  
   });
}



/*EVENT LIKE STATUS*/
exports.liked = async (req,res)=>{
 
  let event = await  eventMongoLib.updateEvents(req.body.id,req.body.like);
  let status;
 
  /*IF LIKE BUTTON COLOR IS "BLUE" THEN EVENT STAUS WILL BE TRUE ELSE FALSE*/
  if(req.body.status === "blue"){
    status = true;
  } else {
    status = false;
  }

  let activity = await eventStatusMongoLib.eventStatusUpdate(req.body.userName,req.body.eventName,status,req.body.like );
  
}


/*ADDING COMMENT TO PERTICULAR EVENT*/
exports.addComment = async(req, res) => {
  let addComment = commentMongoLib.addComments( req.body.eventName,req.body.eventId,req.body.userName,req.body.comments,
    req.body.times);
  
  addComment.save().then(()=>{
    res.jsonp([{time:req.body.times ,
      eventId:req.body.eventId,
      eventName:req.body.eventName,
      userName:req.body.userName,
      comments:req.body.comments
    }]);
  }).catch(()=>
  {
    console.log("sorry");
  });
}



/*USER BUYING TICKET*/
exports.buyTicket = (req,res) =>{
  res.render('userBuyTicket.hbs',{
    description: req.query.description,
    bookingStartTime: req.query.bookingStartTime,
    bookingEndTime: req.query.bookingEndTime,
    cost: req.query.cost,
    maxNoOfTicket: req.query.maxNoOfTicket,
    eventName:req.query.eventName,
    username: req.query.username,
    comments:req.query.comments,
    eventId:req.query.eventId,
    likes: req.query.likes,
    status:req.query.status,
    color1: req.query.color1,
    color2: req.query.color2,
    image:req.query.image
   });
}



/*BOOKING TICKET VALIDATTION AND UPDATE TICKET COUNT IN DATABASE*/
exports.bookingTicket = async(req,res) => {
  let day =new Date();
  let today = day.getDate()+'/'+(day.getMonth()+1)+'/'+day.getFullYear()+'@ '+day.getHours()+
          ':'+day.getMinutes()+':'+day.getSeconds();
  let datetimes = req.query.bookingEndTime;
  if  (day  > datetimes) {
    return res.jsonp([{message:"event already ended"}]);
    }
  if  (req.body.number<=0) {
    return res.jsonp([{message:"Please provide valid number!!!.."}]);
  }

  let event = await eventMongoLib.getEvents(req.query.eventName);
  
  if (req.body.number > event.maxNoOfTicket) {
    return res.jsonp([{message:"You cant book more ticket..Avalable ticket is "+event.maxNoOfTicket}]);
  }
  let newNoOfTicket = event.maxNoOfTicket - req.body.number;


  let updateTicket = await eventMongoLib.updateTicket(req.query.eventName,newNoOfTicket);
  
  if (updateTicket) {
    console.log('updated successfully!!!');
    } else {
    console.log('failed to update the ticket count!!!');
  }

  let soldTicket = soldTicketMongoLib.bookingTicket(req.query.username,req.query.eventName,
    req.body.number,today,req.query.cost,req.query.cost*req.body.number,req.query.image,req.query.description);
  
  soldTicket.save().then(() => {
    return  res.jsonp([{message:"ticket booked successfuly!!.."}]);
  }).catch(() => {
    return res.jsonp([{message:'ticket booking failed!!!...'}]);
  });
}


/*USER VIEWING HIS PAST PURCHASED EVENT TICKET*/
exports.soldTicket = async(req,res) => {
  let soldTicket = await soldTicketMongoLib.getBookedTickets(req.query.username,0);
  res.render('purchasedTickets.hbs',{
    soldTicket:soldTicket,
    username:req.query.username,
  });
}



/*CLEARING PURCHASED TICKET HISTORY*/

exports.clearHistory = async(req,res)=> {
  let updatedTicketHistory = await soldTicketMongoLib.updatingTicketHistory(req.query.username);
  let soldTicket = await soldTicketMongoLib.getBookedTickets(req.query.username,0);
  
  let events = req.query.events;
  res.render('purchasedTickets.hbs',{
    soldTicket:soldTicket,
    username:req.query.username,
  });

}


exports.feedback =(req, res) =>{
  let feedbackList = feedbackMongoLib.newFeedback(req.body.feedback,req.body.username);
  
  feedbackList.save().then(() =>{
    return res.send("Thank you .Your response has been recorded!!!..");
  }).catch(()=>{
    res.send("Sorry.. something went wrong....!!");
  });

}



