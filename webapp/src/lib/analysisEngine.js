/**
 * Latenza Vita — Water Quality Analysis Engine
 * Rule-based risk scoring aligned with WHO / BIS IS-10500 standards
 */

// ─── Safe reference ranges ─────────────────────────────────────────
export const SAFE_RANGES = {
  ph:          { min: 6.5, max: 8.5 },
  turbidity:   { max: 4   },           // WHO: 1 NTU  /  EPA: 4 NTU
  tds:         { max: 500 },           // BIS IS-10500
  temperature: { min: 5,  max: 30  },
}

/**
 * analyzeReading
 * Accepts raw sensor values, returns { riskLevel, riskScore, issues }
 */
export function analyzeReading({
  ph, turbidity, bacteria, chemical,
  rainfall, temperature, tds,
}) {
  let score = 0
  const issues = []

  // ── pH ──────────────────────────────────────────────────────────
  if      (ph < 5.0 || ph > 10.0) { score += 35; issues.push('Critical pH — immediate danger')     }
  else if (ph < 6.0 || ph > 9.0)  { score += 22; issues.push('Severely abnormal pH')               }
  else if (ph < 6.5 || ph > 8.5)  { score += 12; issues.push('pH outside safe range (6.5–8.5)')    }

  // ── Turbidity ───────────────────────────────────────────────────
  if      (turbidity > 100) { score += 32; issues.push('Extreme turbidity — possible flooding')     }
  else if (turbidity > 25)  { score += 25; issues.push('Very high turbidity')                       }
  else if (turbidity > 10)  { score += 18; issues.push('High turbidity (>10 NTU)')                  }
  else if (turbidity > 4)   { score += 8;  issues.push('Elevated turbidity (>4 NTU)')               }

  // ── Bacteria ────────────────────────────────────────────────────
  if      (bacteria === 'High')   { score += 38; issues.push('Severe bacterial contamination')      }
  else if (bacteria === 'Medium') { score += 22; issues.push('Moderate bacterial contamination')    }
  else if (bacteria === 'Low')    { score += 9;  issues.push('Low-level bacterial presence')        }

  // ── Chemical ────────────────────────────────────────────────────
  if      (chemical === 'Contaminated') { score += 32; issues.push('Chemical contamination detected') }
  else if (chemical === 'Trace')        { score += 12; issues.push('Trace chemical presence')         }

  // ── TDS ─────────────────────────────────────────────────────────
  if      (tds > 1200) { score += 22; issues.push('Critically high TDS (>1200 mg/L)')               }
  else if (tds > 900)  { score += 14; issues.push('High TDS (>900 mg/L) — unacceptable')            }
  else if (tds > 500)  { score += 8;  issues.push('Elevated TDS (>500 mg/L)')                       }

  // ── Rainfall ────────────────────────────────────────────────────
  if      (rainfall > 120) { score += 16; issues.push('Extreme rainfall — flooding risk')           }
  else if (rainfall > 60)  { score += 9;  issues.push('Heavy rainfall — contamination risk')        }
  else if (rainfall > 30)  { score += 4;  issues.push('Moderate rainfall — monitor closely')        }

  // ── Temperature ─────────────────────────────────────────────────
  if      (temperature > 38) { score += 12; issues.push('Critical water temperature (>38°C)')       }
  else if (temperature > 32) { score += 7;  issues.push('High temperature — accelerates bacteria')  }

  // ── Clamp & classify ───────────────────────────────────────────
  score = Math.min(score, 100)

  const riskLevel =
    score <= 14 ? 'SAFE'
    : score <= 45 ? 'MODERATE'
    : 'DANGER'

  return { riskLevel, riskScore: score, issues }
}

/**
 * getEmergencyMeasures
 * Returns ordered list of actions based on detected issues and risk
 */
export function getEmergencyMeasures(issues, riskLevel) {
  const measures = []

  // Universal DANGER actions
  if (riskLevel === 'DANGER') {
    measures.push('IMMEDIATE: Issue boil-water advisory to all residents in the zone')
    measures.push('IMMEDIATE: Halt water distribution from this station')
    measures.push('Deploy emergency mobile water tankers within 2 hours')
    measures.push('Notify District Collector and Chief Medical Officer')
    measures.push('Dispatch rapid-response field team for on-site sampling')
    measures.push('Coordinate with State Disaster Management Authority if flooding involved')
  } else {
    measures.push('Issue precautionary boil-water advisory for affected wards')
    measures.push('Escalate monitoring frequency to every 15 minutes')
    measures.push('Notify Division Health Officer and Water Works Superintendent')
  }

  // Issue-specific actions
  const hasIssue = (keyword) =>
    issues.some(i => i.toLowerCase().includes(keyword))

  if (hasIssue('bacteria') || hasIssue('bacterial')) {
    measures.push('Increase chlorination at distribution points immediately')
    measures.push('Flush distribution mains with high-concentration chlorine solution')
    measures.push('Inspect all network joints and storage tanks for breaches')
  }

  if (hasIssue('turbidity')) {
    measures.push('Activate backup filtration units at treatment plant')
    measures.push('Inspect and clean all intake screens and coagulant dosing equipment')
    measures.push('Trace upstream sources of suspended-solids discharge')
  }

  if (hasIssue('chemical')) {
    measures.push('Identify and seal suspected chemical discharge source upstream')
    measures.push('Deploy activated-carbon emergency filtration skids')
    measures.push('Test for heavy metals (lead, arsenic), nitrates, and pesticides')
    measures.push('Engage CPCB / State Pollution Control Board for industrial inspection')
  }

  if (hasIssue('ph')) {
    measures.push('Adjust pH correction chemicals (lime / CO₂) at treatment plant')
    measures.push('Inspect catchment area for acid-rain effects or industrial effluents')
  }

  if (hasIssue('tds')) {
    measures.push('Activate reverse-osmosis or electrodialysis treatment modules')
    measures.push('Investigate industrial effluent discharge in upstream catchment')
  }

  if (hasIssue('rainfall') || hasIssue('flooding')) {
    measures.push('Pre-position dewatering pumps and flood-response equipment')
    measures.push('Resample every 2 hours until turbidity returns below 4 NTU')
  }

  // Deduplicate while preserving order
  return [...new Set(measures)]
}

/**
 * getAuthority — returns the escalation contact for a given risk level
 */
export function getAuthority(riskLevel) {
  if (riskLevel === 'DANGER')   return 'District Collector + Chief Medical Officer + CPCB'
  if (riskLevel === 'MODERATE') return 'Division Health Officer + Water Works Superintendent'
  return 'Local Water Works Officer'
}