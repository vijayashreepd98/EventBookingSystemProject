const express = require('express');
const session = require('express-session');
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
const moment = require('moment');
const xlsxFile = require('read-excel-file/node');
const coockie = require('cookie-parser');

const customerModel = require('../models/registerModel.js');
const eventList = require('../models/eventModel.js');
const commentList = require('../models/addComment.js');
const eventStatus = require('../models/likeModel.js');
const bookedTickets = require('../models/ticketModel.js');
const { doesNotMatch } = require('assert');
//const { send } = require('process');
const cookieParser = require('cookie-parser');
require('../db/mongoose');
app.use(session({secret: 'vijaya',saveUninitialized: true,resave: true,
user:{
  name:""
}}));

app.set('view engine', 'hbs');
app.use(express.static("public"));


app.use(cookieParser());
hbs.registerHelper('if_eq', function(a, b, opts) {
    if(a%b==0&&a!=0)
        return opts.fn(this);
    else
        return opts.inverse(this);
});
hbs.registerHelper('json',function(context){
  return JSON.stringify(context);
});


hbs.registerHelper('dateTime',function(datetime){
  return moment(new Date(datetime)).format('DD-MM-YYYY @  HH:mm');
});

hbs.registerHelper('datetimestring',function(datetime){
  return moment(new Date(datetime)).format('YYYY-MM-DDTHH:mm');
});


let ssn;
/* ADMIN LOGIN PAGE VALIDATION */
exports.login = function(req,res){
  let name = req.body.username;
  let password = req.body.password;
  let array = [ name,password];
  
  /* VERIFYING CREDENTIAL*/
  xlsxFile('./adminBook.xlsx').then((rows) =>{
    let flag =0;
    for(let i=0;i<rows.length;i++){
      let j=0;
      if(rows[i][j]== array[j]&& rows[i][j+1]==array[j+1]){
        flag =  1;
      }
    }
   if(flag  ==  1){
      res.send("success");
    } else {
      res.send("fail");
    }
  });
}


/*VIEW ADMIN HOME PAGE CONTAINS LIST OF EVENTS*/
exports.adminHome = async function(req,res)  {

  /*ACCESSING ALL STORED EVENTS TO DISPLAY*/
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



  /*ADMIN ADDING NEW EVENT TO DATABASE*/
  exports.addingEvent =async function(req,res)  {
    let ename = req.body.ename;
    let edetails = req.body.edetails;
    let npeople = req.body.maxNoOfTicket;
    let bookingStartTime = req.body.stime;
    let bookingEndTime = req.body.etime;
    let cost = req.body.cost;
    let image = req.file.filename;
    /*CONVERTING DATE AND TIME TO SPECIFIED FORMAT*/
    let sdate = dateFormat(bookingStartTime,"d-mm-yyyy @ h:MM:ss");
    let edate = dateFormat(bookingEndTime,"d-mm-yyyy  @ h:MM:ss");
    /*CHECKING NEW EVENTS WITH EXISTING EVENT WITH EVENT NAME*/
    const events= await eventList.findOne({eventName:ename});
    if(events){
     return  res.send("EVENT WITH SAME NAME ALREADY PRESENT IN THE EVENT LIST....\nYOU CANNOT ADD...!!");
    }
    if(bookingStartTime>bookingEndTime){
     return res.send("EVENT BOOKING STARTING AND ENDING DATES ARE NOT PROPER \n... PLEASE DO CHECK!!..")
    }
    
  
    if(!image){
      return res.send("Please upload a file");
  
    }else{
      if (image === "" || ename === "" || edetails === "" ||npeople === "" ||bookingStartTime === "" || bookingEndTime === "" || cost === "") {
        return res.send('Please provide valid information ..All are mandatory');
      }
      let customer = await customerModel.find({
          
      },{
        name:1
      });
      /*DEFAULTLY CREATING EVENT STATUS FOR EACH CUSTOMER */
      for(let i=0;i<customer.length;i++){
        let newUser =  new eventStatus({
          eventName: ename,
          userName: customer[i].name,
          status: false,
      });
      newUser.save();
      }
      let addEventDetails = new eventList({
        eventName: ename,
        description: edetails,
        maxNoOfTicket: npeople,
        bookingStartTime: new Date(bookingStartTime),
        bookingEndTime: new Date(bookingEndTime),
        cost: cost,
        image : image,
        totalTicket:npeople
      });
      addEventDetails.save().then(() => {
        
        return res.send("EVENT ADDED SUCCESSFULLY!!!");
        }).catch(() => {
        return res.send("Sorry...Failed to add new event!!!...");
      }); 
    }
  }



  /*CALLING EDIT  FUNCTION TO EDIT ALLREADY EXISTING EVENT*/
  exports.editEvent =function(req, res)  {

    res.render('editEvent.hbs', {
      eventName: req.query.eventName,
      description: req.query.description,
      tickets: req.query.tickets,
      bookingStartTime: req.query.bookingStartTime,
      bookingEndTime: req.query.bookingEndTime,
      cost: req.query.cost
      
    });
  }


  /*STORING EDITED EVENT WITH UPDATE COMMAND*/
  exports.edittedEvent =async function(req,res) {

    let editedView = await eventList.findOneAndUpdate({
      eventName: req.body.eventName
    }, {
      description: req.body.description,
      bookingStartTime: req.body.stime,
      bookingEndTime: req.body.eetime,
      cost: req.body.cost,
      maxNoOfTicket: req.body.maxNoOfTicket
    });
    
    if (editedView) {
      return res.jsonp([{message:"updated event successfully!"}]);
    } else {
      return res.send('failure while updating!!!!');
    }
  }




  /*ADMIN DELETING PERTICULAR EVENT BY CALLING DELETE FUNCTION*/
  exports.deleteEvent = async function (req, res)  {  
    let deletedEvent = await eventList.findOneAndDelete({
      eventName: req.body.eventName,
      description:req.body.description,
      maxNoOfTicket:req.body.maxNoOfTicket,
      bookingStartTime:req.body.stime,
      bookingEndTime:req.body.eetime,
      cost:req.body.cost
  
    });
    let deletedView = await commentList.deleteMany({
      eventName: req.body.eventName 
    });
    let eventStatuss =  await eventStatus.deleteMany({
       eventName:req.body.eventName
     });
    if (deletedEvent) {
      return  res.jsonp([{message:"Event deleted successfuly!!.."}]);
    } else {
      return  res.jsonp([{message:"Failed to delete the event!!!.."}]);
   }
  
  }



  /*ADMIN VIEWING EVENT STATUS FOR PERTICULAR EVENT*/
  exports.eventStatus = async function(req,res)  {
    let soldTicket = await bookedTickets.find({eventName:req.query.eventName,
      description:req.query.description,
      image:req.query.image
    });
    let likes = await eventStatus.find({
      status:true,
      eventName:req.query.eventName
    });
    let comments =await commentList.find({
      eventName:req.query.eventName
    });
   
    res.render("eventDetails.hbs",{
      soldTicket:soldTicket,
      likes :likes,
      comments:comments,
      eventName:req.query.eventName
  
    });
  }




