/**
 * Urban Dataset Classifier Agent powered by TypeSafe Jev (System One)
 * Purpose: Rapid, typed schema inference, category classification,
 * and coordinate column mapping for uploaded datasets in DYAD.
 */

import { TypeSafeClient, type Question } from './typesafe-client.ts';

export interface DatasetClassification {
  datasetName: string;
  domain: string;
  confidence: number;
  domainProbabilities: Record<string, number>;
  hasCoordinates: boolean;
  coordinateProbability: number;
  latitudeColumn: string | null;
  longitudeColumn: string | null;
  qualityLevel: string;
  latencyMs: number;
  tokensUsed: {
    input: number;
    output: number;
  };
}

export class DatasetClassifierAgent {
  private client: TypeSafeClient;

  constructor(client?: TypeSafeClient) {
    this.client = client || new TypeSafeClient();
  }

  public async classify(
    datasetName: string,
    headers: string[],
    sampleRows: any[]
  ): Promise<DatasetClassification> {
    const state = {
      dataset_name: datasetName,
      columns: headers,
      sample_rows: sampleRows.slice(0, 3), // First 3 rows for high accuracy & low token footprint
    };

    // Construct options map for coordinate detection
    const colCriteria: Record<string, string | null> = {
      none: 'No corresponding column found',
    };
    for (const h of headers) {
      colCriteria[h] = `Column name: "${h}"`;
    }

    const questions: Record<string, Question> = {
      // 1. Domain Category Choice
      domain: {
        type: 'choice',
        instructions: 'What urban planning category best classifies this uploaded dataset?',
        criteria: {
          mobility_traffic: 'Traffic congestion, vehicle speeds, corridor travel delays, transit lines or bus frequencies',
          census_demographics: 'Municipal ward boundaries, population counts, working class demographics, census profiles',
          poi_amenities: 'Points of interest, tech parks, corporate campuses, hospitals, colleges, transit hubs',
          environmental_water: 'Lakes, water bodies, storm water drains (raja kaluves), environmental buffer zones',
          unsupported: 'Unrelated, corrupted, or unsupported data format',
        },
      },
      // 2. Geospatial Coordinate Detection (Noul probability)
      has_coordinates: {
        type: 'noul',
        instructions: 'Does this dataset contain geographical location data (latitude/longitude coordinates or spatial geometries)?',
        criteria: {
          true: 'Explicit spatial coordinates or point geometry found',
          false: 'No coordinates or geometry attributes present',
        },
      },
      // 3. Latitude Column Identification (Choice)
      lat_column: {
        type: 'choice',
        instructions: 'Which column represents the Latitude coordinate? Select "none" if not present.',
        criteria: colCriteria,
      },
      // 4. Longitude Column Identification (Choice)
      lng_column: {
        type: 'choice',
        instructions: 'Which column represents the Longitude coordinate? Select "none" if not present.',
        criteria: colCriteria,
      },
      // 5. Data Readiness & Usability (Score)
      readiness: {
        type: 'score',
        instructions: 'How ready is this dataset for immediate spatial indexing and corridor buffer analysis in DYAD?',
        criteria: [
          'Incomplete / Missing coordinates or essential attributes',
          'Viable with coordinate normalization',
          'Production ready for spatial queries',
        ],
      },
    };

    const response = await this.client.evaluate(state, questions);
    const answers = response.answers;

    const domainAnswer = answers.domain as any;
    const coordAnswer = answers.has_coordinates as any;
    const latAnswer = answers.lat_column as any;
    const lngAnswer = answers.lng_column as any;
    const readinessAnswer = answers.readiness as any;

    return {
      datasetName,
      domain: domainAnswer.choice,
      confidence: domainAnswer.confidence,
      domainProbabilities: domainAnswer.probabilities,
      hasCoordinates: coordAnswer.noul >= 0.5,
      coordinateProbability: coordAnswer.noul,
      latitudeColumn: latAnswer.choice === 'none' ? null : latAnswer.choice,
      longitudeColumn: lngAnswer.choice === 'none' ? null : lngAnswer.choice,
      qualityLevel: readinessAnswer ? `${readinessAnswer.score}/2` : 'N/A',
      latencyMs: (response as any).latencyMs || 0,
      tokensUsed: response.usage,
    };
  }
}
