const express = require('express');
const session = require("express-session");
const bodyParser = require('body-parser');
const handlebars     = require('handlebars');
const multer = require('multer');
const app = express();
adminRouter  = express.Router();
userRouter  = express.Router();
redirectRouter = express.Router();
const port = process.env.PORT || 3000;


let user = require('./src/db/routes/userRouter.js');
let admin = require('./src/db/routes/adminRouter.js');
let redirect = require('./src/db/routes/redirectRouter.js');

app.use(express.urlencoded({extended:true}));
app.use(express.json()); 


app.set('view engine', 'hbs');

app.use(express.static('./uploads/'));


//UPLAODING FILE TO SPECIFIED LOCATION
let storage = multer.diskStorage({
  destination:function(req,file,cb) {
    cb(null, 'uploads/');
    },
  filename:function(req,file,cb){
    cb(null,file.originalname);
  }
});

let upload = multer({
  storage:storage
});



// HOME PAGE
let sess;
app.get('/' ,(req, res) => {
  res.sendfile( './views/home.html');
});

//ADMIN LOGIN PAGE
app.get('/adminLogin',(req, res) => {
  res.sendfile('./views/adminLogin.html');
});

//ADMIN LOGIN CREDENTIAL VALIDATION
app.post('/adminLogin',admin.login);
  
//ADMIN HOME PAGE CONATINING LIST OF EVENTS
app.get('/adminHome',admin.adminHome);

//USER REGISTRATION PAGE
app.get('/userRegistration',(req, res) => {
  res.sendfile('./views/userRegistration.html');
});

//UPADTING USER CREDENTIAL IN DATABASSE
app.post('/userRegistration', user.registration);

//ADMIN ADDING NEW EVENTS
app.get('/adminAddingEvent',(req,res) =>{
 res.sendfile('./views/addingEvent.html')
});


// ADDING EVENT DETAILS TO DATABASE
app.post('/adminAddingEvent',upload.single('img'), admin.addingEvent);

//ADMIN EDDITING EXISTING EVEN DETAILS
app.get('/editEvent', admin.editEvent);

//UPADTING EVENT DETAILS IN DATABASE
app.post('/editEvent' , admin.edittedEvent);

//DELETING EVENT
app.post('/deleteEvent', admin.deleteEvent);

//USER HOME PAGE
app.get("/userHomePage",user.userHomePage);

//USER LOGIN 
app.get('/userLogin',(req, res) => {
  res.sendfile('./views/userLogin.html');
  
});

//VALIDATING USR CREDENTIAL
app.post('/userLogin',user.login);

//USER VIEWING MORE INFORMATION OF PERTICULAR EVENT
app.get('/viewMore',user.viewMore);

//REDIRECTING  FROM BOOKING EVENT DETAILS TO USER HOME PAGE
app.get('/bookingToHome',redirect.bookingToHome);

//EVENT STATUS UPFDATED FOR PERTICULAR EVENT WITH RESPECT TO PERTICULAR EVENT
app.post('/liked',user.liked);

//STORING USER INSERTED COMMET INTO DATABASE WITH USERNAME
app.post('/addComment', user.addComment);

//USER BUYING EVENT TICKET
app.get('/buyTicket',user.buyTicket);

 //UPDATING BOOKED TICKET IN DATABASE
app.post('/bookedTicket',user.bookingTicket);

 //VIEWING SOLD TICKET LIST
app.get('/soldTicketList', user.soldTicket);

//REDIRECTING BUTTON FROM PURCHASE HISTORY TO USER HOMW PAGE
app.get('/purchaseToHome',redirect.purchaseToHome);


//REDIRECTING BUTTON FROM VIEW MORE PAGE TO USER HOME PAGE
app.get('/viewMoreToHome',redirect.viewMoreToHome);

// REDIRECTING FROM BOOKING PAGE TO VIEW MORE PAGE 
app.get('/bookingToviewMore',redirect.bookingToviewMore);

//REDIRECTING FROM ADMIN EVENT ADDING TO EVENT LIST
app.get('/eventAddingToEventlist',redirect.eventAddingToeventList);

//REDIRECTING FROM EDITING TO ADMIN HOME
app.get('/editingToHome',redirect.editingToHome);
 
//ADMIN VIEWING EVENT STATUS CONTAINS NUMBER OF LIKES, COMMENTS , PURCHASED TICKETS
app.get("/eventStatus",admin.eventStatus);

//REDIRECTING FROM EVENT DETAILS TO EVENT LIST PF ADMIN PAGE
app.get('/eventdetailsToeventList',redirect.eventdetailsToeventList);

app.get('/logout',(req,res)=>{
  res.redirect('/');
});


app.use('/userRegistration',userRouter);

app.use('/adminLogin',adminRouter);

app.use(express.json()); 


app.listen(port , () => {
  console.log('server is up to port :' + port);
});