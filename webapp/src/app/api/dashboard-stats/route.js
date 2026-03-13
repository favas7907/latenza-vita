import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import SensorReading from '@/lib/models/SensorReading'
import Alert from '@/lib/models/Alert'

export async function GET() {
  try {
    await connectDB()

    const [
      stationIds,
      totalReadings,
      activeAlerts,
      dangerAlerts,
      riskDistribution,
      avgPhAgg,
      divisionStats,
      recentReadings,
      hourlyTrend,
    ] = await Promise.all([

      // Unique stations
      SensorReading.distinct('sensorId'),

      // Total reading count
      SensorReading.countDocuments(),

      // Unacknowledged alerts
      Alert.countDocuments({ acknowledged: false }),

      // Unacknowledged DANGER alerts
      Alert.countDocuments({ riskLevel: 'DANGER', acknowledged: false }),

      // Risk distribution (latest per sensor)
      SensorReading.aggregate([
        { $sort: { timestamp: -1 } },
        { $group: { _id: '$sensorId', riskLevel: { $first: '$riskLevel' } } },
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
      ]),

      // Average pH across all readings
      SensorReading.aggregate([
        { $group: { _id: null, avg: { $avg: '$ph' } } },
      ]),

      // Per-division averages
      SensorReading.aggregate([
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id:           '$division',
            riskLevel:     { $first: '$riskLevel' },
            avgPh:         { $avg:   '$ph' },
            avgTurbidity:  { $avg:   '$turbidity' },
            avgTds:        { $avg:   '$tds' },
            stationCount:  { $addToSet: '$sensorId' },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // 10 most recent readings
      SensorReading.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .lean(),

      // Hourly reading count for trend chart (last 12 hours)
      SensorReading.aggregate([
        {
          $match: {
            timestamp: {
              $gte: new Date(Date.now() - 12 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%H:00',
                date: '$timestamp',
              },
            },
            count: { $sum: 1 },
            danger: {
              $sum: { $cond: [{ $eq: ['$riskLevel', 'DANGER'] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalStations:    stationIds.length,
        totalReadings,
        activeAlerts,
        dangerAlerts,
        averagePh:        avgPhAgg[0]?.avg?.toFixed(2) || 'N/A',
        riskDistribution,
        divisionStats:    divisionStats.map(d => ({
          ...d,
          stationCount: d.stationCount.length,
          avgPh:        parseFloat((d.avgPh || 0).toFixed(2)),
          avgTurbidity: parseFloat((d.avgTurbidity || 0).toFixed(2)),
          avgTds:       parseFloat((d.avgTds || 0).toFixed(0)),
        })),
        recentReadings,
        hourlyTrend,
      },
    })
  } catch (err) {
    console.error('[dashboard-stats]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}