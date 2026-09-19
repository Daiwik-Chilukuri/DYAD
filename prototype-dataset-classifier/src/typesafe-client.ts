/**
 * TypeSafe AI System One (Jev) Client
 * Direct REST implementation targeting https://api.typesafe.ai/v1/systemone
 */

import * as fs from 'fs';
import * as path from 'path';

// Helper to load .env manually if dotenv is not installed
export function loadEnv(envPath?: string) {
  const candidatePaths = [
    envPath,
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'prototype-dataset-classifier/.env'),
    typeof import.meta !== 'undefined' && (import.meta as any).dirname
      ? path.resolve((import.meta as any).dirname, '../.env')
      : null,
  ].filter(Boolean) as string[];

  for (const target of candidatePaths) {
    if (fs.existsSync(target)) {
      const lines = fs.readFileSync(target, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const key = trimmed.slice(0, idx).trim();
          let val = trimmed.slice(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key] && val) {
            process.env[key] = val;
          }
        }
      }
      break;
    }
  }
}

export interface QuestionChoice {
  type: 'choice';
  instructions: string;
  criteria: Record<string, string | null>;
}

export interface QuestionNoul {
  type: 'noul';
  instructions: string;
  criteria?: {
    true?: string;
    false?: string;
  };
}

export interface QuestionScore {
  type: 'score';
  instructions: string;
  criteria: string[];
}

export type Question = QuestionChoice | QuestionNoul | QuestionScore;

export interface ChoiceAnswer {
  type: 'choice';
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface NoulAnswer {
  type: 'noul';
  noul: number;
}

export interface ScoreAnswer {
  type: 'score';
  score: number;
  confidence: number;
  probabilities: Record<string, number>;
}

export type Answer = ChoiceAnswer | NoulAnswer | ScoreAnswer;

export interface SystemOneResponse {
  model: string;
  answers: Record<string, Answer>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class TypeSafeClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(options?: { apiKey?: string; baseUrl?: string; model?: string }) {
    loadEnv();
    this.apiKey = options?.apiKey || process.env.TYPESAFE_API_KEY || process.env.JEV_API_KEY || '';
    this.baseUrl = options?.baseUrl || 'https://api.typesafe.ai/v1/systemone';
    this.model = options?.model || 'jev-latest';
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async evaluate(state: any, questions: Record<string, Question>): Promise<SystemOneResponse> {
    if (!this.hasApiKey()) {
      throw new Error(
        'Missing TYPESAFE_API_KEY or JEV_API_KEY. Please add your key to prototype-dataset-classifier/.env'
      );
    }

    const payload = {
      state,
      model: this.model,
      questions,
    };

    const startTime = Date.now();
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const elapsedMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TypeSafe API Error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as SystemOneResponse;
    (data as any).latencyMs = elapsedMs;
    return data;
  }

  public async ping(): Promise<{ ok: boolean; latencyMs: number; message: string }> {
    try {
      const result = await this.evaluate('Testing connection to TypeSafe API', {
        test_ping: {
          type: 'noul',
          instructions: 'Is this message readable?',
        },
      });
      return {
        ok: true,
        latencyMs: (result as any).latencyMs || 0,
        message: `Successfully connected to ${result.model}. Response received in ${(result as any).latencyMs}ms.`,
      };
    } catch (err: any) {
      return {
        ok: false,
        latencyMs: 0,
        message: err.message,
      };
    }
  }
}
