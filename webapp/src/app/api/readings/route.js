import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import SensorReading from '@/lib/models/SensorReading'

export async function GET(request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)

    const page     = parseInt(searchParams.get('page')     || '1')
    const limit    = parseInt(searchParams.get('limit')    || '30')
    const division = searchParams.get('division')
    const risk     = searchParams.get('risk')
    const sensor   = searchParams.get('sensor')

    const filter = {}
    if (division) filter.division  = division
    if (risk)     filter.riskLevel = risk
    if (sensor)   filter.sensorId  = new RegExp(sensor, 'i')

    const [readings, total] = await Promise.all([
      SensorReading.find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SensorReading.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      data: {
        readings,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}