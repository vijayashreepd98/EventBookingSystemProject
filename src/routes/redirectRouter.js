const express = require('express');
const hbs = require('hbs');
const app = express();

const customerModel = require('../models/registerModel.js');
const eventList = require('../models/eventModel.js');
const commentList = require('../models/addComment.js');
const eventStatus = require('../models/likeModel.js');
const bookedTickets = require('../models/ticketModel.js');
const eventMongoLib = require('../mongoLib/eventMongoLib.js');
const eventStatusMongoLib = require('../mongoLib/eventStatusMongoLib.js');
const commentMongoLib = require('../mongoLib/commentMongoLib.js');



app.set('view engine', 'hbs');

hbs.registerHelper('if_eq', function(a, b, opts) {
  if(a%b==0&&a!=0)
    return opts.fn(this);
  else
    return opts.inverse(this);
});

hbs.registerHelper('json',function(context){
  return JSON.stringify(context);
});



/*REDIRECTNG FROM EVENT BOOKING TO USER HOME PAGE*/
exports.bookingToHome = async function(req,res){
  let comments  = await commentMongoLib.getComments(req.query.eventName,req.query.eventId);
  let events = await eventStatusMongoLib.gettingEventStatus( req.query.eventName,req.query.username );
    
  if (events.length===0) {
    let newUser = eventStatusMongoLib.createNewStatus(req.query.eventName, req.query.username,false);
    newUser.save().then(( ) => {
      console.log("success");
    }).catch(()=>{
      console.log("Failed");});
    }

    let allEvents = await eventStatusMongoLib.gettingEventStatus(req.query.eventName, req.query.username );
  
    let color1, color2;
    if(!allEvents){
     return  res.send("try again");
    }
    if (allEvents[0].status === true) {
      color1 = "blue";
      color2 = "black"
    } else {
      color1 = "black";
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
      status: allEvents[0].status,
      color1: color1,
      color2: color2,
      image:req.query.image
  
    });
    
}


/*REDIRECTING FROM PURCHASED HISTORY PAGE TO USER HOME PAGE*/
exports.purchaseToHome = async function(req,res) {
 
  let events =await eventMongoLib.getAllEvents();
      
  if (events) {
    return res.render('userEventView.hbs', {
      events:events,
      username:req.query.username,
      status:req.query.status,
      today:new Date()
    });
  } 
             
}



/*REDIRECTING FROM VIEW MORE PAGE TO USER HOME PAGE*/
exports.viewMoreToHome = async function(req,res) {
  let events = await eventMongoLib.getAllEvents();
  let today = new Date();  
  if (events) {
    return res.render('userEventView.hbs', {
      events:events,
      username:req.query.username,
      status:req.query.status,
      today:today
    });
  }       
           
}



/*REDIRECTING FROM TICKET BOOKING PAGE TO  USER HOME PAGE*/
exports.bookingToviewMore = async function(req,res) {
  let comments = await commentMongoLib.getComments(req.query.eventName,req.query.eventId);
  let events = await eventStatusMongoLib.gettingEventStatus(req.query.eventName,req.query.username );
  
  if (events.length===0) {
    let newUser = eventStatusMongoLib.createNewStatus(req.query.eventName,req.query.username,false);
    newUser.save().then(( ) => {
      console.log("success");
    }).catch(()=>{
      console.log("sory");
    });
  }

  let eventLists = await eventMongoLib.getLikes(req.query.eventName);
  let allEvents = await eventStatusMongoLib.gettingEventStatus(req.query.eventName, req.query.username );

    
  let color1, color2;
  if(!allEvents){
    return  res.send("try again");
  }
  if (allEvents.status === true) {
    color1 = "blue";
    color2 = "black"
  } else {
    color1 = "black";
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
    likes: eventLists.likes,
    status: allEvents.status,
    color1: color1,
    color2: color2,
    image:req.query.image
  
   });  
  }



  /*REDIRECTING FROM EVENT ADDING PAGE TO ADMIN EVENT LIST PAGE*/
exports.eventAddingToeventList = async function(req,res) {
  let events = await eventMongoLib.getAllEvents();
  if (events) {
    res.render('eventView.hbs',{
    events: events
    });
  }
}


/*REDIRECTING FROM EDITING PAGE TO ADMIN HOME PAGE*/
exports.editingToHome = async function(req,res) {
  let events = await eventMongoLib.getAllEvents();
  if (events) {
    res.render('eventView.hbs',{
      events: events
    });
  } 
}



/*REDIRECTING FROM EVENTSTATUS DETAILS TO ADMIN HOME PAGE*/
exports.eventdetailsToeventList = async function(req,res ){
  let events = await eventMongoLib.getAllEvents();

  if (events) {
    res.render('eventView.hbs',{
      events: events
    });
    
  }
}