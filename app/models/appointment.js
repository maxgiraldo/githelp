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
    option1: {
      date: Date,
      confirmed: { type: Boolean, default: false }
    },
    option2: {
      date: Date,
      confirmed: { type: Boolean, default: false }
    },
    option3: {
      date: Date,
      confirmed: { type: Boolean, default: false }
    }
  },
  time: { // in UTC
    type: Date
  },
  duration: {
    type: Number,
    required: true
  },
  confirmed: { // by merchant
    type: Boolean,
    default: false
  },
  topic: String,
  message: String,
  totalCost: Number, // to customer
  completionTime: Number, // in minutes
  editor: []
});


// use projections when embedded documents get too big
// when a document gets too big beyond 16mb, then it gets
// saved to another disk
// so make sure embedded documents does not get out of hand

// atomic transactions
// when you can't have things happen half the time
// like money transactions


// make indexes on user._id
// if you create an index it creates a b tree

// b tree is a specific type of tree that is not a binary ree
//  binary tree can only have 0 1 or 2 children

// b tree can have an unlimited number of children
// use ensureIndex

mongoose.model('Appointment', AppointmentSchema);
