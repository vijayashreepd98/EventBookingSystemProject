let mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/eventBookingSystem', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});
module.exports = mongoose;