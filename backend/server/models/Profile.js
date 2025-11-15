import mongoose from 'mongoose'; // ✅ Changed from require

const profileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  candidateId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  collegeName: {
    type: String,
  },
  cgpa: {
    type: String,
  },
  location: {
    type: String,
  },
  interestedRoles: {
    type: [String],
    default: [],
  },
  telegramId: {
    type: String,
  },
  resumeLink: {
    type: String,
  },
  websiteLink: {
    type: String,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Transform _id to id
profileSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('Profile', profileSchema); // ✅ Changed from module.exports
