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


/*USER REGISTRATION PAGE*/
exports.registration = async function(req, res)  {
  let name = req.body.username;    
  let password = req.body.password;
  let registered = await customerModel.findOne({name:name});
  if(registered){
    res.send("USER ALREADY EXISTS!!!...");
  } else {
    let events = await eventList.find({
    },{
      eventName:1
    });

    /*CREATING DEFAULT EVENT STATUS FOR AVAILABLE EVENTS FOR  NEW CUSTOMER*/
    for(let i=0;i<events.length;i++){
      let newUser = await new eventStatus({
        eventName: events[i].eventName,
        userName: name,
        status: false,
      });
      newUser.save();
    }
    let register = new customerModel({
      name: name,
      password: password
    });
      
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
  let today = day.getDate()+'/'+(day.getMonth()+1)+'/'+day.getFullYear()+'@ '+day.getHours()+
    ':'+day.getMinutes()+':'+day.getSeconds();    const events = await eventList.find( { 
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
  if (events) {
    res.render('userEventView.hbs', {
      events:events,
      username:req.query.username
      });
    }
}



/*USER LOGIN VALIDATION CHECKING*/
exports.login = async(req,res)=> {
  let name = req.body.name;
  let password = req.body.password;
  let user = await customerModel.findOne( {
    name:name,
    password: password
  });
  /*IF ENETERED USER NAME IS ALREADY AVAILABLE*/
  if(user){
    res.send("success");
  } else {
    res.send("fail")
  }
}


/*VIEWING VIEW MORE DETAILS OF PERTICULR EVENT WHICH CONATIND LIKES , COMMENTS  , BOOKING PERTICULAR EVENT*/
exports.viewMore = async(req,res) =>{
  let comments = await commentList.find({ eventName: req.query.eventName,
    eventId:req.query.eventId
  });
  const  allEvents  = await  eventStatus.findOne( {eventName: req.query.eventName,userName: req.query.username 
  });
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
  let event = await eventList.findOneAndUpdate({
    _id: req.body.id
  }, {
    likes: req.body.like
  });
  let status;
  /*IF LIKE BUTTON COLOR IS "BLUE" THEN EVENT STAUS WILL BE TRUE ELSE FALSE*/
  if(req.body.status === "blue"){
    status = true;
  } else {
    status = false;
  }
  let activity = await eventStatus.findOneAndUpdate({
    userName: req.body.userName, 
    eventName: req.body.eventName
  }, {
    status: status,
    likes: req.body.like 
  });
}


/*ADDING COMMENT TO PERTICULAR EVENT*/
exports.addComment = async(req, res) => {
  let addComment = new commentList({
    eventName: req.body.eventName,
    eventId: req.body.eventId,
    userName: req.body.userName,
    comments: req.body.comments,
    time: req.body.times
  });
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
  if  (today  > datetimes) {
    return res.jsonp([{message:"event already ended"}]);
    }
  if  (req.body.number<=0) {
    return res.jsonp([{message:"Please provide valid number!!!.."}]);
  }
  let event = await eventList.findOne( { 
    eventName: req.query.eventName
  });
  if (req.body.number > event.maxNoOfTicket) {
    return res.jsonp([{message:"You cant book more ticket..Avalable ticket is "+event.maxNoOfTicket}]);
  }
  let newNoOfTicket = event.maxNoOfTicket - req.body.number;
  let updateTicket = await eventList.findOneAndUpdate({
    eventName: req.query.eventName
  }, {
    maxNoOfTicket : newNoOfTicket
  });
  
  if (updateTicket) {
    console.log('updated successfully!!!');
    } else {
    console.log('failed to update the ticket count!!!');
  }
  let soldTicket = new  bookedTickets( {
    userName: req.query.username,
    eventName: req.query.eventName,
    noOfTicket: req.body.number,
    bookingTime: today,
    cost:req.query.cost,
    paid:req.query.cost*req.body.number,
    image:req.query.image,
    description:req.query.description
  });
  soldTicket.save().then(() => {
    return  res.jsonp([{message:"ticket booked successfuly!!.."}]);
  }).catch(() => {
    return res.jsonp([{message:'ticket booking failed!!!...'}]);
  });
}


/*USER VIEWING HIS PAST PURCHASED EVENT TICKET*/
exports.soldTicket = async(req,res) => {
  let soldTicket = await bookedTickets.find( {userName: req.query.username
  }, {
    eventName: 1,
    userName: 1,
    noOfTicket :1,
    bookingTime: 1,
    cost: 1,
    paid: 1,
    image:1
  }); 
  let events = req.query.events;
  res.render('purchasedTickets.hbs',{
    soldTicket:soldTicket,
    username:req.query.username,
  });
}