import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  candidateId: {
    type: String,
    required: true,
  },
  games: {
    minesweeper: {
      type: Object,
      default: null,
    },
    'unblock-me': {
      type: Object,
      default: null,
    },
    'water-capacity': {
      type: Object,
      default: null,
    },
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  completedAt: {
    type: Date,
  },
  trialMode: {
    minesweeper: {
      type: Boolean,
      default: false,
    },
    'unblock-me': {
      type: Boolean,
      default: false,
    },
    'water-capacity': {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Transform _id to id
assessmentSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('Assessment', assessmentSchema);
