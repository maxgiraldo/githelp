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
  payment: {
    type: Schema.ObjectId,
    ref: 'Payment'
  },
  date: {
    type: Date
  },
  time: { // in UTC
    type: Date
  },
  duration: {
    type: Number,
    required: true
  },
  confirmed: { // by merchant
    type: String,
    default: false
  },
  topic: String,
  message: String,
  editor: []
});

mongoose.model('Appointment', AppointmentSchema);
