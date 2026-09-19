import type {
  MetroLine,
  MetroStation,
  POIItem,
  PresetCorridor,
} from "@/types/contracts";

// Approximate Namma Metro alignments (Bengaluru). Coordinates are [lng, lat].
// Digitized approximations for prototype visualization, not survey-grade.
export const metroLines: MetroLine[] = [
  {
    id: "purple",
    name: "Purple Line",
    core: "#9D4EDD",
    glow: "#7B2CBF",
    path: [
      [77.7115, 12.9959], // Whitefield (Kadugodi)
      [77.6737, 12.9922], // Kundalahalli
      [77.6408, 12.9784], // Baiyappanahalli
      [77.6205, 12.9756], // Indiranagar
      [77.6045, 12.9757], // MG Road
      [77.5806, 12.9767], // Cubbon Park
      [77.5712, 12.9758], // Vidhana Soudha
      [77.5713, 12.9757], // Sir M Visvesvaraya
      [77.5721, 12.9756], // Majestic (interchange)
      [77.5385, 12.9486], // Mysore Road
      [77.5099, 12.9199], // Challaghatta
    ],
  },
  {
    id: "green",
    name: "Green Line",
    core: "#00F5D4",
    glow: "#06B6A4",
    path: [
      [77.5001, 13.0479], // Nagasandra
      [77.5197, 13.0284], // Peenya
      [77.5546, 13.0289], // Yeshwantpur (interchange)
      [77.5714, 12.9995], // Mahalakshmi
      [77.5721, 12.9756], // Majestic (interchange)
      [77.5738, 12.9527], // National College
      [77.5772, 12.9418], // Lalbagh
      [77.5804, 12.9231], // Jayanagar
      [77.5713, 12.9215], // RV Road (interchange)
      [77.5566, 12.8916], // Banashankari
      [77.5453, 12.8574], // Anjanapura
    ],
  },
  {
    id: "yellow",
    name: "Yellow Line",
    core: "#FFD166",
    glow: "#E0A800",
    path: [
      [77.5713, 12.9215], // RV Road (interchange)
      [77.6019, 12.9172], // Jayadeva (interchange)
      [77.6226, 12.9174], // BTM Layout
      [77.6227, 12.9172], // Central Silk Board
      [77.6484, 12.8963], // Bommanahalli
      [77.6621, 12.8845], // Hosa Road
      [77.6759, 12.8452], // Electronic City
      [77.6987, 12.8065], // Bommasandra
    ],
  },
  {
    id: "blue",
    name: "Blue Line (Airport)",
    core: "#00BBF9",
    glow: "#0284C7",
    path: [
      [77.6408, 12.9784], // Baiyappanahalli
      [77.6642, 13.0086], // KR Puram (interchange)
      [77.6889, 13.0446], // Hoodi
      [77.7076, 13.0846], // Mahadevapura
      [77.6712, 13.1986], // Yelahanka
      [77.7066, 13.1979], // Airport City
    ],
  },
];

export const metroStations: MetroStation[] = [
  { id: "whitefield", name: "Whitefield", line: "purple", coordinates: [77.7115, 12.9959], isInterchange: false },
  { id: "baiyappanahalli", name: "Baiyappanahalli", line: "purple", coordinates: [77.6408, 12.9784], isInterchange: true },
  { id: "mg-road", name: "MG Road", line: "purple", coordinates: [77.6045, 12.9757], isInterchange: false },
  { id: "majestic", name: "Majestic (Nadaprabhu)", line: "purple", coordinates: [77.5721, 12.9756], isInterchange: true },
  { id: "yeshwantpur", name: "Yeshwantpur", line: "green", coordinates: [77.5546, 13.0289], isInterchange: true },
  { id: "rv-road", name: "RV Road", line: "green", coordinates: [77.5713, 12.9215], isInterchange: true },
  { id: "jayanagar", name: "Jayanagar", line: "green", coordinates: [77.5804, 12.9231], isInterchange: false },
  { id: "jayadeva", name: "Jayadeva Hospital", line: "yellow", coordinates: [77.6019, 12.9172], isInterchange: true },
  { id: "silk-board", name: "Central Silk Board", line: "yellow", coordinates: [77.6227, 12.9172], isInterchange: false },
  { id: "electronic-city", name: "Electronic City", line: "yellow", coordinates: [77.6759, 12.8452], isInterchange: false },
  { id: "kr-puram", name: "KR Puram", line: "blue", coordinates: [77.6642, 13.0086], isInterchange: true },
];

export const pois: POIItem[] = [
  { id: "ecospace", name: "Ecospace Business Park", category: "corporate", coordinates: [77.6871, 12.9276] },
  { id: "manyata", name: "Manyata Tech Park", category: "corporate", coordinates: [77.6207, 13.0446] },
  { id: "itpl", name: "ITPL / ITPB", category: "corporate", coordinates: [77.7365, 12.9865] },
  { id: "bagmane", name: "Bagmane Tech Park", category: "corporate", coordinates: [77.6672, 12.9852] },
  { id: "rmz-ecoworld", name: "RMZ Ecoworld (Sarjapur)", category: "corporate", coordinates: [77.6835, 12.9247] },
  { id: "manipal", name: "Manipal Hospital", category: "healthcare", coordinates: [77.6484, 12.9583] },
  { id: "narayana", name: "Narayana Health City", category: "healthcare", coordinates: [77.6836, 12.8065] },
  { id: "stjohns", name: "St. John's Medical", category: "healthcare", coordinates: [77.6206, 12.9309] },
  { id: "iisc", name: "IISc Bengaluru", category: "education", coordinates: [77.5665, 13.0219] },
  { id: "pes", name: "PES University", category: "education", coordinates: [77.5354, 12.9351] },
  { id: "christ", name: "Christ University", category: "education", coordinates: [77.6045, 12.9345] },
  { id: "majestic-hub", name: "Majestic Bus Terminal", category: "transit", coordinates: [77.5721, 12.9776] },
  { id: "yeshwantpur-rail", name: "Yeshwantpur Rail Jn", category: "transit", coordinates: [77.5546, 13.0247] },
  { id: "vidhana", name: "Vidhana Soudha", category: "civic", coordinates: [77.5906, 12.9794] },
  { id: "highcourt", name: "Karnataka High Court", category: "civic", coordinates: [77.5921, 12.9779] },
];

export const presetCorridors: PresetCorridor[] = [
  {
    id: "sarjapur-spine",
    name: "Sarjapur Tech Spine",
    originStationId: "silk-board",
    terminusName: "Sarjapur (RMZ Ecoworld)",
    terminusCoordinates: [77.6835, 12.9247],
  },
  {
    id: "ec-connector",
    name: "Electronic City Connector",
    originStationId: "jayadeva",
    terminusName: "Electronic City Phase 2",
    terminusCoordinates: [77.6759, 12.8452],
  },
  {
    id: "hoskote-link",
    name: "Hoskote Link",
    originStationId: "kr-puram",
    terminusName: "Hoskote",
    terminusCoordinates: [77.7982, 13.0707],
  },
];

export const poiCategoryColor: Record<POIItem["category"], string> = {
  corporate: "#22D3EE",
  healthcare: "#EF4444",
  education: "#F59E0B",
  transit: "#A855F7",
  civic: "#94A3B8",
};
