/**
 * SSE Mock stream generator and parser utilities for DYAD E2E tests.
 */

export function createMockSSEStream(events) {
  const chunks = [];
  for (const ev of events) {
    chunks.push(`event: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`);
  }
  return chunks.join('');
}

export function parseSSEText(rawText) {
  const events = [];
  const lines = rawText.split('\n');
  let currentEvent = {};
  let currentData = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentData) {
        try {
          const parsed = JSON.parse(currentData);
          events.push(parsed);
        } catch {
          events.push({ raw: currentData });
        }
        currentData = '';
        currentEvent = {};
      }
      continue;
    }

    if (line.startsWith('event:')) {
      currentEvent.type = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      const dataContent = line.slice(5).trim();
      currentData = currentData ? currentData + '\n' + dataContent : dataContent;
    }
  }

  if (currentData) {
    try {
      events.push(JSON.parse(currentData));
    } catch {
      events.push({ raw: currentData });
    }
  }

  return events;
}

export function generateStandardCorridorLifecycleEvents(corridorId = 'test-corridor', corridorName = 'Test Corridor') {
  const now = Date.now();
  return [
    {
      type: 'plan_initiated',
      timestamp: now,
      corridor_id: corridorId,
      corridor_name: corridorName
    },
    {
      type: 'telemetry',
      timestamp: now + 50,
      stage: 'dataset_discovery',
      message: 'Inspecting datasets in modal volume...',
      subagents_count: 5
    },
    {
      type: 'subagents_spawned',
      timestamp: now + 100,
      subagents: [
        'Agent 1: Structured Output Spatial Visualizer',
        'Agent 2: Demographics & Equity Specialist',
        'Agent 3: Economic & Land-Value Specialist',
        'Agent 4: Mobility & Congestion Specialist',
        'Agent 5: Ecological Risk Specialist'
      ],
      count: 5
    },
    {
      type: 'visualizer_features',
      timestamp: now + 250,
      features_count: 3,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[77.62, 12.91], [77.63, 12.91], [77.63, 12.92], [77.62, 12.92], [77.62, 12.91]]]
            },
            properties: { name: 'Lake Buffer Zone', status: 'FLAGGED' }
          }
        ]
      },
      message: 'Extracted 3 spatial features intersecting corridor buffer.'
    },
    {
      type: 'subagent_completed',
      timestamp: now + 400,
      subagent: 'demographics',
      execution_time_seconds: 0.35,
      summary: 'Demographic catchment parsed: 42,000 residents.'
    },
    {
      type: 'dossier',
      timestamp: now + 800,
      dossier: {
        corridor_id: corridorId,
        corridor_name: corridorName,
        overall_viability_score: 82.5,
        executive_summary: 'Viable corridor connecting major employment center.',
        demographics: {
          catchment_population_500m: 18500,
          catchment_population_1500m: 72000,
          equity_index_score: 78.4,
          underserved_transit_ratio: 0.28,
          density_per_sqkm: 12500
        },
        economic: {
          tech_parks_within_1km: 3,
          commercial_centers_within_1km: 4,
          hospitals_within_1km: 2,
          annual_farebox_revenue_inr_cr: 145.2,
          economic_multiplier_index: 2.8,
          estimated_tod_yield_inr_cr: 320.0
        },
        mobility: {
          peak_hour_travel_time_saved_minutes: 24.5,
          arterial_congestion_reduction_pct: 26.0,
          feeder_route_coverage_score: 81.0,
          daily_projected_ridership: 110000
        },
        ecological: {
          lake_buffer_infringements_30m: 1,
          rajakaluve_crossings_50m: 1,
          ktfd_compliance_status: 'FLAGGED',
          flood_vulnerability_grade: 'MODERATE',
          tree_canopy_loss_risk_score: 42.0
        },
        risk_warnings: [
          {
            risk_id: 'risk-lake-01',
            category: 'ECOLOGICAL',
            severity: 'HIGH',
            headline: 'KTFD Act 30m Lake Buffer Infringement',
            description: 'Viaduct alignment passes within 22m of Bellandur lake statutory buffer.',
            mitigation_step: 'Shift pier placement 15m south or use portal frame viaduct design.'
          }
        ],
        policy_recommendations: [
          'Mandate KTFD environmental NOC prior to civil tendering.',
          'Introduce feeder bus loops connecting interior tech hubs.'
        ],
        suggested_stations: [
          {
            station_id: 'st-01',
            name: 'Central Silk Board Interchange',
            coordinates: [77.6245, 12.9176],
            typology: 'ELEVATED',
            estimated_daily_boardings: 45000,
            interchange_with: 'Yellow Line',
            priority: 'MANDATORY'
          },
          {
            station_id: 'st-02',
            name: 'Agara Junction',
            coordinates: [77.6450, 12.9210],
            typology: 'ELEVATED',
            estimated_daily_boardings: 32000,
            interchange_with: null,
            priority: 'HIGH'
          },
          {
            station_id: 'st-03',
            name: 'Sarjapur Wipro Gate',
            coordinates: [77.6890, 12.9230],
            typology: 'ELEVATED',
            estimated_daily_boardings: 38000,
            interchange_with: null,
            priority: 'MANDATORY'
          }
        ]
      }
    },
    {
      type: 'done',
      timestamp: now + 850,
      message: '[DONE]'
    }
  ];
}
