var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PublicSchema = new Schema({
  merchant: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  customer: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  payment: {
    customer: {type: Schema.ObjectId,
            ref: "User"},
    merchant: {type: Schema.ObjectId,
            ref: "User"},
    totalAmount: String,
    merchantShare: String,
    githelpShare: String,
    balancedId: String,
    created: {
      type: Date,
      default: Date.now
    },
    status: String,
  },
  apptppm: String,
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
  confirmedDate: {
    type: Date
  },
  confirmed: { // need this as check against someone reconfirming an already confirmed apptment
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: 'pending'
  },
  topic: String,
  message: {
    subject: String,
    details: String
  },
  totalCost: Number, // to customer
  completionTime: Number, // in minutes
  editor: []
});


mongoose.model('Public', PublicSchema);