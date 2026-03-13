import mongoose from 'mongoose'

const AlertSchema = new mongoose.Schema(
  {
    division:        { type: String, required: true, index: true },
    location:        { type: String, required: true },
    sensorId:        { type: String, required: true },
    riskLevel:       { type: String, enum: ['MODERATE','DANGER'], required: true },
    issues:          [{ type: String }],
    parameters: {
      ph:            Number,
      turbidity:     Number,
      bacteria:      String,
      chemical:      String,
      rainfall:      Number,
      temperature:   Number,
      tds:           Number,
    },
    aiAnalysis:      { type: String, default: '' },
    measures:        [{ type: String }],
    responsibleAuth: { type: String, default: 'Division Health Officer' },
    acknowledged:    { type: Boolean, default: false, index: true },
    resolvedAt:      { type: Date },
    timestamp:       { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
)

AlertSchema.index({ riskLevel: 1, timestamp: -1 })
AlertSchema.index({ acknowledged: 1, timestamp: -1 })

export default mongoose.models.Alert ||
  mongoose.model('Alert', AlertSchema)