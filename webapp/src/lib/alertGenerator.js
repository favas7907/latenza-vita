/**
 * Latenza Vita — Alert Generator
 * Creates Alert documents and enriches them with AI analysis
 */

import { getEmergencyMeasures, getAuthority } from './analysisEngine'
import Alert from './models/Alert'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001'

export async function generateAlert(reading, riskLevel, issues) {
  // Only generate alerts for non-SAFE readings
  if (riskLevel === 'SAFE') return null

  // ── AI Analysis ─────────────────────────────────────────────────
  let aiAnalysis = ''
  try {
    const res = await fetch(`${AI_SERVICE_URL}/ai/analyze-alert`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        division:  reading.division,
        location:  reading.location,
        sensorId:  reading.sensorId,
        riskLevel,
        issues,
      }),
      signal: AbortSignal.timeout(25000),
    })
    if (res.ok) {
      const data = await res.json()
      aiAnalysis = data.analysis || ''
    }
  } catch (err) {
    console.warn('[alertGenerator] AI service unavailable:', err.message)
    aiAnalysis = buildFallbackAnalysis(issues, riskLevel)
  }

  // ── Build alert document ─────────────────────────────────────────
  const measures       = getEmergencyMeasures(issues, riskLevel)
  const responsibleAuth = getAuthority(riskLevel)

  const alert = await Alert.create({
    division:   reading.division,
    location:   reading.location,
    sensorId:   reading.sensorId,
    riskLevel,
    issues,
    parameters: {
      ph:          reading.ph,
      turbidity:   reading.turbidity,
      bacteria:    reading.bacteria,
      chemical:    reading.chemical,
      rainfall:    reading.rainfall,
      temperature: reading.temperature,
      tds:         reading.tds,
    },
    aiAnalysis,
    measures,
    responsibleAuth,
  })

  return alert
}

// ── Internal helpers ──────────────────────────────────────────────

function buildFallbackAnalysis(issues, riskLevel) {
  if (riskLevel === 'DANGER') {
    return (
      `DANGER LEVEL DETECTED — ${issues.join('; ')}. ` +
      `This water is unsafe for any human consumption or contact. ` +
      `Immediate public health intervention is mandatory. ` +
      `Stop all distribution, deploy emergency water supplies, ` +
      `and notify health authorities within 30 minutes per protocol.`
    )
  }
  return (
    `MODERATE RISK DETECTED — ${issues.join('; ')}. ` +
    `Water quality has deviated from safe thresholds. ` +
    `Preventive measures must be implemented immediately. ` +
    `Notify the division health officer and increase monitoring frequency.`
  )
}