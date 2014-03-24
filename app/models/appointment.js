var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AppointmentSchema = new Schema({
  merchant: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  customer: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  payment:{
    type: Schema.ObjectId,
    ref: 'Payment'
  },
  date: {
    type: Date
  },
  duration: String,
  topic: String,
  message: String
});

mongoose.model('Appointment', AppointmentSchema);
