const express = require('express');
const session = require("express-session");
const validator = require('validator');
const bodyParser = require('body-parser');
const handlebars     = require('handlebars');
const JSAlert = require("js-alert");
const dateFormat = require('dateformat');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const hbs = require('hbs');
const app = express();

const customerModel = require('C:/Users/LOGAN/Desktop/nodecourse/eventBookingSystem/src/models/registerModel.js');
const eventList = require('C:/Users/LOGAN/Desktop/nodecourse/eventBookingSystem/src/models/eventModel.js');
const commentList = require('C:/Users/LOGAN/Desktop/nodecourse/eventBookingSystem/src/models/addComment.js');
const eventStatus = require('C:/Users/LOGAN/Desktop/nodecourse/eventBookingSystem/src/models/likeModel.js');
const bookedTickets = require('C:/Users/LOGAN/Desktop/nodecourse/eventBookingSystem/src/models/ticketModel.js');
const { doesNotMatch } = require('assert');
require('../mongoose');

const { send } = require('process');

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
  let comments = await commentList.find({ eventName: req.query.eventName,
    eventId:req.query.eventId
  });
    let  events  =  await eventStatus.find( {eventName: req.query.eventName,userName: req.query.username 
  });
    
  if (events.length===0) {
    let newUser = new eventStatus({
    eventName: req.query.eventName,
    userName: req.query.username,
    status: false,
  });
    newUser.save().then(( ) => {
      console.log("success");
    }).catch(()=>{
      console.log("Failed");});
    }
    let  allEvents  =  await eventStatus.find( {eventName: req.query.eventName,userName: req.query.username 
    });
    
  
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
  let events = await eventList.find( { 
  }, {
    eventName: 1,
    description: 1,
    maxNoOfTicket: 1,
    bookingStartTime: 1,
    bookingEndTime: 1,
    cost: 1,
    likes: 1,
    image:1,
    _id: 1
  });
      
  if (events) {
    return res.render('userEventView.hbs', {
      events:events,
      username:req.query.username,
    });
  } 
             
}



/*REDIRECTING FROM VIEW MORE PAGE TO USER HOME PAGE*/
exports.viewMoreToHome = async function(req,res) {
  let events = await eventList.find( { 
  }, {
    eventName: 1,
    description: 1,
    maxNoOfTicket: 1,
    bookingStartTime: 1,
    bookingEndTime: 1,
    cost: 1,
    likes: 1,
    image:1,
    _id: 1
  });
   
  if (events) {
    return res.render('userEventView.hbs', {
      events:events,
      username:req.query.username,
    });
  }       
           
}



/*REDIRECTING FROM TICKET BOOKING PAGE TO  USER HOME PAGE*/
exports.bookingToviewMore = async function(req,res) {
  let comments = await commentList.find({ eventName: req.query.eventName,
    eventId:req.query.eventId
  });
  let  events  =  await eventStatus.find( {eventName: req.query.eventName,userName: req.query.username 
  });
    
  if (events.length===0) {
    let newUser = new eventStatus({
      eventName: req.query.eventName,
      userName: req.query.username,
      status: false,
    });
    newUser.save().then(( ) => {
      console.log("success");
    }).catch(()=>{
      console.log("sory");
    });
  }
  let eventLists = await eventList.findOne({
    eventName:req.query.eventName
  },{
    likes:1
  });
  let  allEvents  =  await eventStatus.find( {eventName: req.query.eventName,userName: req.query.username 
  });
    
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
    likes: eventLists.likes,
    status: allEvents[0].status,
    color1: color1,
    color2: color2,
    image:req.query.image
  
   });  
  }



  /*REDIRECTING FROM EVENT ADDING PAGE TO ADMIN EVENT LIST PAGE*/
exports.eventAddingToeventList = async function(req,res) {
  let events = await eventList.find( { }, {
    eventName: 1,
    description: 1,
    maxNoOfTicket: 1,
    bookingStartTime: 1,
    bookingEndTime: 1,
    cost: 1,
    image:1,
    _id: 1
  });
  if (events) {
    res.render('eventView.hbs',{
    events: events
    });
  }
}


/*REDIRECTING FROM EDITING PAGE TO ADMIN HOME PAGE*/
exports.editingToHome = async function(req,res) {
  let events = await eventList.find( { }, {
    eventName: 1,
    description: 1,
    maxNoOfTicket: 1,
    bookingStartTime: 1,
    bookingEndTime: 1,
    cost: 1,
    image:1,
    _id: 1
  });
  if (events) {
    res.render('eventView.hbs',{
      events: events
    });
  } 
}



/*REDIRECTING FROM EVENTSTATUS DETAILS TO ADMIN HOME PAGE*/
exports.eventdetailsToeventList = async function(req,res ){
  let events = await eventList.find( { }, {
    eventName: 1,
    description: 1,
    maxNoOfTicket: 1,
    bookingStartTime: 1,
    bookingEndTime: 1,
    cost: 1,
    image:1,
    _id: 1
  });
  if (events) {
    res.render('eventView.hbs',{
      events: events
    });
    
  }
}