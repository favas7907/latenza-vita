/**
 * Latenza Vita — IoT Water Quality Sensor Simulator
 *
 * Simulates 15 monitoring stations across 5 municipal divisions.
 * Sends realistic water quality readings every 30 seconds.
 * Scenario distribution: 60% safe · 25% moderate · 15% danger
 */

require('dotenv').config()
const axios = require('axios')

const API_URL     = process.env.API_URL     || 'http://localhost:3000'
const INTERVAL_MS = parseInt(process.env.INTERVAL_MS || '30000')

// ── Station registry ──────────────────────────────────────────────
const STATIONS = [
  // North Division — industrial corridor
  { division: 'North Division', location: 'Ward 12 — Korattur Industrial Area', sensorId: 'LV-N01' },
  { division: 'North Division', location: 'Ward 15 — Ambattur SIDCO Estate',    sensorId: 'LV-N02' },
  { division: 'North Division', location: 'Ward 18 — Padi Junction',            sensorId: 'LV-N03' },
  // South Division — residential / IT corridor
  { division: 'South Division', location: 'Ward 23 — Adyar Riverbank',          sensorId: 'LV-S01' },
  { division: 'South Division', location: 'Ward 25 — Velachery Lake Zone',      sensorId: 'LV-S02' },
  { division: 'South Division', location: 'Ward 28 — Sholinganallur IT Park',   sensorId: 'LV-S03' },
  // East Division — port / fishing zone
  { division: 'East Division',  location: 'Ward 31 — Royapuram Harbour',        sensorId: 'LV-E01' },
  { division: 'East Division',  location: 'Ward 34 — Tondiarpet Slum Cluster',  sensorId: 'LV-E02' },
  { division: 'East Division',  location: 'Ward 37 — Manali Petrochemical Zone',sensorId: 'LV-E03' },
  // West Division — agricultural fringe
  { division: 'West Division',  location: 'Ward 41 — Virugambakkam',            sensorId: 'LV-W01' },
  { division: 'West Division',  location: 'Ward 44 — Valasaravakkam',           sensorId: 'LV-W02' },
  { division: 'West Division',  location: 'Ward 47 — Porur Lake Inlet',         sensorId: 'LV-W03' },
  // Central Division — core city
  { division: 'Central Division', location: 'Ward 51 — Anna Nagar Tower',       sensorId: 'LV-C01' },
  { division: 'Central Division', location: 'Ward 54 — T. Nagar Market',        sensorId: 'LV-C02' },
  { division: 'Central Division', location: 'Ward 57 — Nungambakkam High Road', sensorId: 'LV-C03' },
]

// ── Reading generators ────────────────────────────────────────────
const rnd = (min, max, dec = 1) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(dec))

function generateReading(station, scenario) {
  const base = { ...station }

  if (scenario === 'safe') {
    return {
      ...base,
      ph:          rnd(6.8, 8.2),
      turbidity:   rnd(0.3, 3.5),
      bacteria:    'None',
      chemical:    'Safe',
      rainfall:    rnd(0, 12),
      temperature: rnd(16, 26),
      tds:         rnd(120, 380),
    }
  }

  if (scenario === 'moderate') {
    return {
      ...base,
      ph:          Math.random() > 0.5 ? rnd(5.8, 6.5) : rnd(8.5, 9.3),
      turbidity:   rnd(5, 14),
      bacteria:    Math.random() > 0.5 ? 'Low' : 'Medium',
      chemical:    Math.random() > 0.65 ? 'Trace' : 'Safe',
      rainfall:    rnd(30, 65),
      temperature: rnd(25, 33),
      tds:         rnd(420, 700),
    }
  }

  // danger
  return {
    ...base,
    ph:          Math.random() > 0.5 ? rnd(4.2, 5.9) : rnd(9.2, 10.8),
    turbidity:   rnd(18, 95),
    bacteria:    'High',
    chemical:    Math.random() > 0.4 ? 'Contaminated' : 'Trace',
    rainfall:    rnd(75, 160),
    temperature: rnd(29, 40),
    tds:         rnd(650, 1150),
  }
}

function pickScenario() {
  const n = Math.random()
  if (n < 0.60) return 'safe'
  if (n < 0.85) return 'moderate'
  return 'danger'
}

// ── Send a single reading ─────────────────────────────────────────
async function sendReading(data) {
  try {
    const res = await axios.post(`${API_URL}/api/sensor-data`, data, {
      timeout: 10000,
    })
    const { riskLevel, riskScore } = res.data.reading
    const alertTag = res.data.alert
      ? `  🚨 ALERT [${res.data.alert.riskLevel}]`
      : ''

    const icon =
      riskLevel === 'DANGER'   ? '🔴' :
      riskLevel === 'MODERATE' ? '🟡' : '🟢'

    console.log(
      `${icon} ${data.sensorId.padEnd(8)} | ${data.division.padEnd(20)} | ` +
      `pH:${String(data.ph).padEnd(5)} Turb:${String(data.turbidity).padEnd(6)} ` +
      `Bact:${data.bacteria.padEnd(7)} TDS:${String(data.tds).padEnd(6)} | ` +
      `${riskLevel.padEnd(10)} score:${riskScore}${alertTag}`
    )
  } catch (err) {
    console.error(`❌ ${data.sensorId}: ${err.message}`)
  }
}

// ── Full cycle: all stations ──────────────────────────────────────
async function runCycle(stressMode = false) {
  const now = new Date().toLocaleTimeString()
  console.log(`\n${'─'.repeat(80)}`)
  console.log(`[${now}]  Latenza Vita IoT Cycle — ${STATIONS.length} sensors`)
  console.log(`${'─'.repeat(80)}`)

  // In stress mode force some danger readings for demo purposes
  for (const station of STATIONS) {
    const scenario = stressMode && Math.random() > 0.4
      ? 'danger'
      : pickScenario()
    const reading = generateReading(station, scenario)
    await sendReading(reading)
    await new Promise(r => setTimeout(r, 350)) // stagger to avoid overwhelming API
  }
}

// ── Entry point ───────────────────────────────────────────────────
async function main() {
  const once   = process.argv.includes('--once')
  const stress = process.argv.includes('--stress')

  console.log('\n🌊  Latenza Vita IoT Water Quality Simulator')
  console.log(`📡  API endpoint : ${API_URL}`)
  console.log(`📍  Stations     : ${STATIONS.length} across 5 divisions`)
  console.log(`⏱   Interval     : ${once ? 'single run' : `${INTERVAL_MS / 1000}s`}`)
  if (stress) console.log('⚡  Stress mode  : ON (elevated danger scenarios)')
  console.log()

  // Wait for API to be ready
  let retries = 0
  while (retries < 5) {
    try {
      await axios.get(`${API_URL}/health`, { timeout: 3000 })
      console.log('✅  API is ready\n')
      break
    } catch {
      retries++
      console.log(`⏳  Waiting for API… (attempt ${retries}/5)`)
      await new Promise(r => setTimeout(r, 3000))
    }
  }

  await runCycle(stress)

  if (!once) {
    setInterval(() => runCycle(stress), INTERVAL_MS)
  }
}

main().catch(err => {
  console.error('Fatal simulator error:', err)
  process.exit(1)
})