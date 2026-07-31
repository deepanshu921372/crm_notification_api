const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['company', 'contact'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'targetModel' },
    role: {
      type: String,
      enum: ['owner', 'sales_rep', 'support', 'viewer'],
      default: 'viewer'
    },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

assignmentSchema.virtual('targetModel').get(function () {
  return this.targetType === 'company' ? 'Company' : 'Contact';
});

assignmentSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
