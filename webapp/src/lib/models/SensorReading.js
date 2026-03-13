import mongoose from 'mongoose'

const SensorReadingSchema = new mongoose.Schema(
  {
    division:    { type: String, required: true, index: true },
    location:    { type: String, required: true },
    sensorId:    { type: String, required: true, index: true },
    ph:          { type: Number, required: true },
    turbidity:   { type: Number, required: true },
    bacteria:    { type: String, enum: ['None','Low','Medium','High'],          required: true },
    chemical:    { type: String, enum: ['Safe','Trace','Contaminated'],         required: true },
    rainfall:    { type: Number, required: true },
    temperature: { type: Number, required: true },
    tds:         { type: Number, required: true },
    riskLevel:   { type: String, enum: ['SAFE','MODERATE','DANGER'],            required: true },
    riskScore:   { type: Number, min: 0, max: 100 },
    issues:      [{ type: String }],
    timestamp:   { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
)

SensorReadingSchema.index({ division: 1, timestamp: -1 })
SensorReadingSchema.index({ sensorId: 1, timestamp: -1 })
SensorReadingSchema.index({ riskLevel: 1, timestamp: -1 })

export default mongoose.models.SensorReading ||
  mongoose.model('SensorReading', SensorReadingSchema)