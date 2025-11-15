import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: {  // ✅ Add custom id field
    type: String,
    unique: true,
    required: true,
  },
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
  },
  role: {
    type: String,
    enum: ['applicant', 'admin', 'employee', 'client'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Transform to remove MongoDB _id
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('User', userSchema);
