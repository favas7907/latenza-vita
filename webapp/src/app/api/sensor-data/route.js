/**
 * POST /api/sensor-data
 * Receives IoT readings → analyzes → stores → triggers alerts
 */

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import SensorReading from '@/lib/models/SensorReading'
import { analyzeReading } from '@/lib/analysisEngine'
import { generateAlert } from '@/lib/alertGenerator'

export async function POST(request) {
  try {
    await connectDB()
    const body = await request.json()

    const {
      division, location, sensorId,
      ph, turbidity, bacteria, chemical,
      rainfall, temperature, tds,
    } = body

    // Basic validation
    if (!division || !location || !sensorId) {
      return NextResponse.json(
        { error: 'Missing required fields: division, location, sensorId' },
        { status: 400 }
      )
    }

    // ── Step 1: Analysis ──────────────────────────────────────────
    const { riskLevel, riskScore, issues } = analyzeReading({
      ph, turbidity, bacteria, chemical,
      rainfall, temperature, tds,
    })

    // ── Step 2: Persist reading ───────────────────────────────────
    const reading = await SensorReading.create({
      division, location, sensorId,
      ph, turbidity, bacteria, chemical,
      rainfall, temperature, tds,
      riskLevel, riskScore, issues,
    })

    // ── Step 3: Generate alert if needed ──────────────────────────
    let alert = null
    if (riskLevel !== 'SAFE') {
      alert = await generateAlert(reading, riskLevel, issues)
    }

    return NextResponse.json(
      {
        success: true,
        reading: { id: reading._id, riskLevel, riskScore, issues },
        alert:   alert ? { id: alert._id, riskLevel } : null,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[sensor-data]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}