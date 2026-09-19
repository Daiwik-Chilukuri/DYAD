# TypeSafe AI System One API Reference

## Endpoint
```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

## Model
Use `"jev-latest"` (TypeSafe's flagship System One model).

## Request Format
```json
{
  "state": "Content or JSON object to evaluate",
  "model": "jev-latest",
  "questions": {
    "question_id_1": {
      "type": "choice | noul | score",
      "instructions": "Instruction prompt",
      "criteria": { ... }
    }
  }
}
```

### 1. Choice Question
Selects 1 option from a map of choices. Returns chosen option, full probability distribution, and confidence score.
```json
{
  "type": "choice",
  "instructions": "What domain best describes this dataset?",
  "criteria": {
    "mobility_traffic": "Road traffic congestion, vehicular speeds, travel delays, transit lines",
    "census_demographics": "Wards, population counts, working class demographics, socio-economic metrics",
    "poi_amenities": "Points of interest, tech parks, hospitals, universities, transit hubs",
    "environmental_water": "Lakes, water bodies, storm water drains, environmental buffer zones",
    "unsupported": "Irrelevant or unrecognized data"
  }
}
```

### 2. Noul Question
A calibrated yes/no probability evaluator (returns a value between 0.0 and 1.0).
```json
{
  "type": "noul",
  "instructions": "Does this dataset contain geographic coordinates (latitude and longitude)?",
  "criteria": {
    "true": "Dataset has explicit coordinate fields",
    "false": "No coordinate fields found"
  }
}
```

### 3. Score Question
Evaluates state against ordered descriptive levels.
```json
{
  "type": "score",
  "instructions": "Rate the completeness of the data headers for GIS mapping",
  "criteria": [
    "Unusable - lacks essential fields",
    "Partial - requires column mapping",
    "Production Ready - complete and normalized"
  ]
}
```

## Response Format
```json
{
  "model": "jev-latest",
  "answers": {
    "category": {
      "type": "choice",
      "choice": "mobility_traffic",
      "confidence": 0.98,
      "probabilities": {
        "mobility_traffic": 0.98,
        "census_demographics": 0.01,
        "poi_amenities": 0.01,
        "environmental_water": 0.0,
        "unsupported": 0.0
      }
    }
  },
  "usage": {
    "input_tokens": 120,
    "output_tokens": 24
  }
}
```
