const customerModel = require('../models/registerModel.js');


exports.getCustomer = (name)=>{
    return customerModel.findOne({name:name});
}


exports.createNewUser =(name,password) =>{
    return new customerModel({
        name: name,
        password: password
      });
}



exports.getAllUser =()=>{
    return customerModel.find({
          
    },{
      name:1
    });
}


