import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Alert from '@/lib/models/Alert'

// GET /api/alerts
export async function GET(request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)

    const page  = parseInt(searchParams.get('page')  || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const risk  = searchParams.get('risk')
    const ack   = searchParams.get('acknowledged')

    const filter = {}
    if (risk)             filter.riskLevel     = risk
    if (ack !== null && ack !== undefined && ack !== '')
      filter.acknowledged = ack === 'true'

    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Alert.countDocuments(filter),
    ])

    return NextResponse.json({ success: true, data: { alerts, total } })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/alerts — acknowledge an alert
export async function PATCH(request) {
  try {
    await connectDB()
    const { id } = await request.json()
    const alert = await Alert.findByIdAndUpdate(
      id,
      { acknowledged: true, resolvedAt: new Date() },
      { new: true }
    )
    return NextResponse.json({ success: true, data: alert })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}