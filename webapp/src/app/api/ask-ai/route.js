import { NextResponse } from 'next/server'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001'

export async function POST(request) {
  let body = {}
  try {
    body = await request.json()
    const { question } = body

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const res = await fetch(`${AI_SERVICE_URL}/ai/ask`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ question: question.trim() }),
      signal:  AbortSignal.timeout(30000),
    })

    if (!res.ok) throw new Error(`AI service responded with ${res.status}`)

    const data = await res.json()
    return NextResponse.json({ success: true, data })

  } catch (err) {
    console.warn('[ask-ai] Falling back to built-in answers:', err.message)
    return NextResponse.json({
      success: true,
      data: {
        question: body?.question || '',
        answer:   getBuiltInAnswer(body?.question || ''),
      },
    })
  }
}

function getBuiltInAnswer(q) {
  const ql = q.toLowerCase()

  if (ql.includes('ph'))
    return 'Safe pH for drinking water is 6.5–8.5 (WHO / BIS IS-10500). ' +
           'Below 6.5 = acidic (leaches heavy metals from pipes). ' +
           'Above 8.5 = alkaline (bitter taste, scaling). ' +
           'pH outside 5–10 requires immediate supply shutdown.'

  if (ql.includes('turbidity'))
    return 'Turbidity measures suspended particles. ' +
           'WHO limit: 1 NTU. EPA limit: 4 NTU. ' +
           'High turbidity (>10 NTU) indicates runoff, algae, or industrial discharge. ' +
           'Treatment: coagulation → flocculation → sedimentation → sand filtration.'

  if (ql.includes('bacteria') || ql.includes('coliform'))
    return 'Zero coliform bacteria per 100 mL is the WHO standard. ' +
           'Detection requires: immediate boil-water advisory, chlorination boost, ' +
           'network flushing, and lab confirmation within 2 hours.'

  if (ql.includes('tds') || ql.includes('dissolved solid'))
    return 'TDS (Total Dissolved Solids): ' +
           '<300 mg/L = excellent, 300–600 mg/L = good, ' +
           '600–900 mg/L = fair, >1200 mg/L = unacceptable. ' +
           'High TDS indicates industrial effluents or natural mineral deposits. ' +
           'Treatment: reverse osmosis, distillation, electrodialysis.'

  if (ql.includes('chemical') || ql.includes('contamination'))
    return 'Chemical contamination (arsenic, lead, nitrates, pesticides) ' +
           'requires immediate supply shutdown. ' +
           'Deploy activated-carbon filtration and reverse osmosis. ' +
           'Engage State Pollution Control Board for industrial inspection. ' +
           'Do not use boiling — it concentrates most chemical contaminants.'

  if (ql.includes('emergency') || ql.includes('measures') || ql.includes('action'))
    return 'Emergency protocol (DANGER): ' +
           '1) Issue boil-water advisory. ' +
           '2) Stop distribution from affected zone. ' +
           '3) Deploy mobile tankers within 2 hours. ' +
           '4) Notify District Collector and CMO. ' +
           '5) Dispatch field team for sampling. ' +
           '6) Test every 2 hours until resolved.'

  if (ql.includes('rainfall') || ql.includes('flood'))
    return 'Heavy rainfall (>50 mm) causes turbidity spikes and bacterial contamination ' +
           'through surface runoff. Flooding can cause sewage overflow into supply lines. ' +
           'Monitor for delayed contamination 6–12 hours post-event. ' +
           'Post-flood: mandatory resampling before restoring supply.'

  if (ql.includes('temperature'))
    return 'Ideal water temperature: 10–15°C. ' +
           'Above 30°C accelerates bacterial growth by up to 50%. ' +
           'High temperature reduces dissolved oxygen and increases health risk. ' +
           'Monitor temperature alongside bacterial counts in summer months.'

  if (ql.includes('cholera') || ql.includes('typhoid') || ql.includes('disease'))
    return 'Common waterborne diseases: ' +
           'Cholera (Vibrio cholerae) — severe diarrhea, dehydration. ' +
           'Typhoid (Salmonella typhi) — fever, abdominal pain. ' +
           'Hepatitis A — liver infection, jaundice. ' +
           'Cryptosporidiosis — resistant to chlorination, needs UV treatment. ' +
           'Prevention: chlorination, UV disinfection, proper sewage separation.'

  return 'Latenza Vita monitors water quality against WHO and BIS IS-10500 standards. ' +
         'Key parameters: pH (6.5–8.5), turbidity (<4 NTU), TDS (<500 mg/L), ' +
         'zero coliform bacteria, temperature (5–30°C). ' +
         'Any deviation triggers automated risk scoring and authority notification.'
}