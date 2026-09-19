'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, TrendingUp, Zap, GitBranch, MapPin, 
  UploadCloud, FileText, Table, FileSpreadsheet,
  Trash2, CheckCircle2, Search, FileCode, Check,
  ChevronRight, ArrowLeft, Eye, X, Download, HardDrive,
  Layers, Radio, ArrowUpRight, SlidersHorizontal, Sparkles
} from 'lucide-react';
import { motionSprings } from '../../../lib/motion';
import { BotLogo } from '../../../components/BotLogo';

interface ColumnProfile {
  name: string;
  type: string;
  nullPct: string;
  sampleStats?: string;
  isSpatial?: boolean;
}

interface IngestedFile {
  id: string;
  name: string;
  size: string;
  type: 'csv' | 'parquet' | 'xlsx' | 'pdf';
  category: string;
  status: 'indexed' | 'ready';
  recordsOrPages: string;
  timestamp: string;
  hasSpatialCoords: boolean;
  columns?: ColumnProfile[];
  previewRows?: Record<string, string | number>[];
  pdfMetadata?: {
    chapters: string[];
    extractedParams: { label: string; value: string; confidence: string }[];
  };
}

const INITIAL_FILES: IngestedFile[] = [
  {
    id: 'f-2',
    name: 'ORR_Corridor_Peak_Hour_Traffic_Sensors_2025.parquet',
    size: '42.8 MB',
    type: 'parquet',
    category: 'Traffic Sensor Telemetry',
    status: 'ready',
    recordsOrPages: '1.24M Rows • 7 Columns',
    timestamp: 'Today, 11:45',
    hasSpatialCoords: true,
    columns: [
      { name: 'sensor_id', type: 'VARCHAR', nullPct: '0.0%', sampleStats: '142 sensors' },
      { name: 'junction_name', type: 'VARCHAR', nullPct: '0.0%', sampleStats: 'Silk Board, HSR, Bellandur' },
      { name: 'latitude', type: 'FLOAT64', nullPct: '0.0%', sampleStats: '12.812° to 12.985° N', isSpatial: true },
      { name: 'longitude', type: 'FLOAT64', nullPct: '0.0%', sampleStats: '77.580° to 77.698° E', isSpatial: true },
      { name: 'pcu_volume', type: 'INT64', nullPct: '0.2%', sampleStats: 'Min: 420 | Max: 18,450' },
      { name: 'avg_speed_kmh', type: 'FLOAT32', nullPct: '0.5%', sampleStats: 'Mean: 13.8 km/h' },
      { name: 'congestion_index', type: 'FLOAT32', nullPct: '0.0%', sampleStats: '0.12 to 0.98' }
    ],
    previewRows: [
      { sensor_id: 'SEN-BLR-01', junction_name: 'Central Silk Board', latitude: 12.9176, longitude: 77.6245, pcu_volume: 18450, avg_speed_kmh: 8.2, congestion_index: 0.96 },
      { sensor_id: 'SEN-BLR-02', junction_name: 'HSR 14th Main', latitude: 12.9112, longitude: 77.6385, pcu_volume: 14200, avg_speed_kmh: 12.4, congestion_index: 0.88 },
      { sensor_id: 'SEN-BLR-03', junction_name: 'Agara Lake Inflow', latitude: 12.9214, longitude: 77.6492, pcu_volume: 16100, avg_speed_kmh: 11.0, congestion_index: 0.91 },
      { sensor_id: 'SEN-BLR-04', junction_name: 'Iblur Junction', latitude: 12.9238, longitude: 77.6680, pcu_volume: 17800, avg_speed_kmh: 9.5, congestion_index: 0.94 },
      { sensor_id: 'SEN-BLR-05', junction_name: 'Bellandur EcoSpace Gate', latitude: 12.9279, longitude: 77.6842, pcu_volume: 15300, avg_speed_kmh: 14.1, congestion_index: 0.85 },
      { sensor_id: 'SEN-BLR-06', junction_name: 'Devarabisanahalli Flyover', latitude: 12.9324, longitude: 77.6915, pcu_volume: 13900, avg_speed_kmh: 16.5, congestion_index: 0.79 },
      { sensor_id: 'SEN-BLR-07', junction_name: 'Kadubeesanahalli Signal', latitude: 12.9392, longitude: 77.6974, pcu_volume: 14800, avg_speed_kmh: 13.0, congestion_index: 0.86 },
      { sensor_id: 'SEN-BLR-08', junction_name: 'Marathahalli Multiplex', latitude: 12.9560, longitude: 77.7011, pcu_volume: 16900, avg_speed_kmh: 10.2, congestion_index: 0.93 }
    ]
  },
  {
    id: 'f-3',
    name: 'Bengaluru_OuterRingRoad_IT_Parks_Roster.xlsx',
    size: '3.6 MB',
    type: 'xlsx',
    category: 'Commercial POI Density',
    status: 'indexed',
    recordsOrPages: '8.4k Rows • 6 Columns',
    timestamp: 'Yesterday',
    hasSpatialCoords: false,
    columns: [
      { name: 'park_name', type: 'VARCHAR', nullPct: '0.0%', sampleStats: 'Ecospace, Cessna, Prestige' },
      { name: 'tenant_companies', type: 'INT32', nullPct: '0.0%', sampleStats: '12 to 140 firms' },
      { name: 'total_headcount', type: 'INT64', nullPct: '0.0%', sampleStats: 'Min: 4k | Max: 85k' },
      { name: 'built_up_area_sqft', type: 'INT64', nullPct: '0.0%', sampleStats: 'Mean: 2.4M sq.ft' },
      { name: 'shift_peak_hour', type: 'VARCHAR', nullPct: '0.0%', sampleStats: '09:00 - 10:30 AM' },
      { name: 'feeder_demand', type: 'VARCHAR', nullPct: '0.0%', sampleStats: 'High / Critical' }
    ],
    previewRows: [
      { park_name: 'RGA Tech Park', tenant_companies: 24, total_headcount: 22000, built_up_area_sqft: 2100000, shift_peak_hour: '09:30 AM', feeder_demand: 'Critical' },
      { park_name: 'Ecospace Business Park', tenant_companies: 68, total_headcount: 65000, built_up_area_sqft: 4800000, shift_peak_hour: '09:00 AM', feeder_demand: 'Critical' },
      { park_name: 'Cessna Business Park', tenant_companies: 32, total_headcount: 38000, built_up_area_sqft: 3200000, shift_peak_hour: '09:15 AM', feeder_demand: 'High' },
      { park_name: 'Prestige Tech Park', tenant_companies: 84, total_headcount: 78000, built_up_area_sqft: 5400000, shift_peak_hour: '08:45 AM', feeder_demand: 'Critical' },
      { park_name: 'Embassy TechVillage', tenant_companies: 110, total_headcount: 85000, built_up_area_sqft: 6100000, shift_peak_hour: '09:30 AM', feeder_demand: 'Critical' }
    ]
  },
  {
    id: 'f-4',
    name: 'BMRCL_Interchange_Ridership_Survey_2024_Q4.csv',
    size: '8.1 MB',
    type: 'csv',
    category: 'Commuter Origin-Destination',
    status: 'ready',
    recordsOrPages: '412k Rows • 5 Columns',
    timestamp: '2 days ago',
    hasSpatialCoords: false,
    columns: [
      { name: 'origin_station', type: 'VARCHAR', nullPct: '0.0%', sampleStats: 'Silk Board, Majestic, MG Road' },
      { name: 'destination_station', type: 'VARCHAR', nullPct: '0.0%', sampleStats: 'Whitefield, Electronic City' },
      { name: 'daily_transfers', type: 'INT64', nullPct: '0.1%', sampleStats: 'Min: 1.2k | Max: 68k' },
      { name: 'avg_dwell_sec', type: 'INT32', nullPct: '0.0%', sampleStats: '35s to 90s' },
      { name: 'fare_collected_inr', type: 'FLOAT64', nullPct: '0.0%', sampleStats: '₹45 avg ticket' }
    ],
    previewRows: [
      { origin_station: 'Central Silk Board', destination_station: 'Electronic City', daily_transfers: 68000, avg_dwell_sec: 75, fare_collected_inr: 2856000 },
      { origin_station: 'Central Silk Board', destination_station: 'Bellandur (Proposed)', daily_transfers: 54200, avg_dwell_sec: 60, fare_collected_inr: 2168000 },
      { origin_station: 'RV Road (Yellow)', destination_station: 'Jayadeva Interchange', daily_transfers: 41800, avg_dwell_sec: 50, fare_collected_inr: 1672000 },
      { origin_station: 'Indiranagar', destination_station: 'KR Puram', daily_transfers: 39500, avg_dwell_sec: 45, fare_collected_inr: 1580000 },
      { origin_station: 'Majestic (Kempegowda)', destination_station: 'Central Silk Board', daily_transfers: 48900, avg_dwell_sec: 90, fare_collected_inr: 2445000 }
    ]
  },
  {
    id: 'f-1',
    name: 'BMRCL_Phase2A_SilkBoard_KR_Puram_DPR.pdf',
    size: '14.2 MB',
    type: 'pdf',
    category: 'Detailed Project Report (DPR)',
    status: 'indexed',
    recordsOrPages: '184 Pages Analysis',
    timestamp: 'Today, 14:20',
    hasSpatialCoords: true,
    pdfMetadata: {
      chapters: [
        'Chapter 1: Alignment Topography & Corridor Geometry',
        'Chapter 2: Travel Demand Modeling & Peak-Hour Traffic Forecast',
        'Chapter 3: Station Siting, Interchange Hubs & Viaduct Clearances',
        'Chapter 4: Rolling Stock, Traction & CBTC Signaling Systems',
        'Chapter 5: Capital Cost Estimates & Economic Rate of Return (EIRR)'
      ],
      extractedParams: [
        { label: 'Minimum Viaduct Curve Radius', value: '120 meters', confidence: '99.4%' },
        { label: 'Maximum Viaduct Ruling Gradient', value: '3.20%', confidence: '98.8%' },
        { label: 'Signaling Architecture', value: 'CBTC GoA2 (180s Headway)', confidence: '99.9%' },
        { label: 'Corridor Design Capacity', value: '45,000 PPHPD', confidence: '99.1%' },
        { label: 'Economic Rate of Return (EIRR)', value: '14.62%', confidence: '96.5%' },
        { label: 'Station Viaduct Clearance', value: '5.5 meters above median', confidence: '97.6%' }
      ]
    }
  }
];

export default function DataSynthesisPage() {
  const [files, setFiles] = useState<IngestedFile[]>(INITIAL_FILES);
  const [inspectingFileId, setInspectingFileId] = useState<string | null>(null); // USER OPTION: NO COMPULSION TO VIEW SCHEMA BY DEFAULT
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inspectedFile = files.find(f => f.id === inspectingFileId) || null;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const parseCsvContent = (content: string, filename: string, sizeMb: string): IngestedFile => {
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const headers = lines[0]?.split(',').map(h => h.trim().replace(/"/g, '')) || ['col1', 'col2'];
    
    const rows: Record<string, string | number>[] = [];
    for (let i = 1; i < Math.min(lines.length, 12); i++) {
      const vals = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const rowObj: Record<string, string | number> = {};
      headers.forEach((h, idx) => {
        const raw = vals[idx] || '';
        const num = parseFloat(raw);
        rowObj[h] = !isNaN(num) && raw !== '' ? num : raw;
      });
      rows.push(rowObj);
    }

    const hasSpatial = headers.some(h => {
      const lower = h.toLowerCase();
      return lower.includes('lat') || lower.includes('lng') || lower.includes('lon') || lower.includes('coord');
    });

    const columns: ColumnProfile[] = headers.map(h => ({
      name: h,
      type: typeof (rows[0]?.[h]) === 'number' ? 'FLOAT64' : 'VARCHAR',
      nullPct: '0.0%',
      sampleStats: `${rows.length} rows preview`,
      isSpatial: h.toLowerCase().includes('lat') || h.toLowerCase().includes('lng') || h.toLowerCase().includes('lon')
    }));

    return {
      id: `f-${Date.now()}`,
      name: filename,
      size: `${sizeMb} MB`,
      type: 'csv',
      category: 'Custom Uploaded Dataset',
      status: 'ready',
      recordsOrPages: `${lines.length - 1} Rows • ${headers.length} Columns`,
      timestamp: 'Just now',
      hasSpatialCoords: hasSpatial,
      columns,
      previewRows: rows
    };
  };

  const processFiles = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const validExtensions = ['csv', 'parquet', 'xlsx', 'xls', 'pdf'];

    Array.from(uploadedFiles).forEach((file, index) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!validExtensions.includes(ext)) return;

      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

      if (ext === 'csv') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const parsed = parseCsvContent(text, file.name, sizeMb);
          setFiles(prev => [parsed, ...prev]);
          setUploadStatus(`Ingested ${file.name} successfully.`);
          setTimeout(() => setUploadStatus(null), 3500);
        };
        reader.readAsText(file);
      } else {
        const normalizedType: 'parquet' | 'xlsx' | 'pdf' = 
          ext === 'xls' ? 'xlsx' : (ext as 'parquet' | 'xlsx' | 'pdf');
        
        const newFile: IngestedFile = {
          id: `f-${Date.now()}-${index}`,
          name: file.name,
          size: `${sizeMb} MB`,
          type: normalizedType,
          category: normalizedType === 'pdf' ? 'Transit Technical Dossier' : 'Columnar Dataset',
          status: 'ready',
          recordsOrPages: normalizedType === 'pdf' ? 'Technical Document' : 'Vectorized Schema',
          timestamp: 'Just now',
          hasSpatialCoords: true,
          columns: normalizedType !== 'pdf' ? [
            { name: 'record_id', type: 'INT64', nullPct: '0.0%', sampleStats: 'Index' },
            { name: 'latitude', type: 'FLOAT64', nullPct: '0.0%', isSpatial: true, sampleStats: '12.8° - 13.0° N' },
            { name: 'longitude', type: 'FLOAT64', nullPct: '0.0%', isSpatial: true, sampleStats: '77.5° - 77.7° E' },
            { name: 'commuter_volume', type: 'FLOAT64', nullPct: '0.0%', sampleStats: 'Sample values' }
          ] : undefined,
          previewRows: normalizedType !== 'pdf' ? [
            { record_id: 101, latitude: 12.9176, longitude: 77.6245, commuter_volume: 18450 },
            { record_id: 102, latitude: 12.9279, longitude: 77.6842, commuter_volume: 15300 },
            { record_id: 103, latitude: 12.8522, longitude: 77.6598, commuter_volume: 12400 }
          ] : undefined,
          pdfMetadata: normalizedType === 'pdf' ? {
            chapters: ['Section 1: Alignment Survey', 'Section 2: Station Feasibility', 'Section 3: Ridership Forecast'],
            extractedParams: [
              { label: 'Corridor Alignment', value: 'Elevated Median Viaduct', confidence: '99.0%' },
              { label: 'Viability Index', value: 'High Alignment Priority', confidence: '97.5%' }
            ]
          } : undefined
        };

        setFiles(prev => [newFile, ...prev]);
        setUploadStatus(`Ingested ${file.name} successfully.`);
        setTimeout(() => setUploadStatus(null), 3500);
      }
    });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = files.filter(f => f.id !== id);
    setFiles(remaining);
    if (inspectingFileId === id) {
      setInspectingFileId(null);
    }
  };

  const filteredFiles = files.filter(f => {
    const matchesType = filterType === 'all' || f.type === filterType;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getFormatBadge = (type: IngestedFile['type']) => {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium uppercase bg-secondary border border-border text-muted-foreground">
        {type}
      </span>
    );
  };

  const getFormatIcon = (type: IngestedFile['type']) => {
    switch (type) {
      case 'csv':
        return <Table className="size-4 text-primary shrink-0" />;
      case 'parquet':
        return <FileCode className="size-4 text-primary shrink-0" />;
      case 'xlsx':
        return <FileSpreadsheet className="size-4 text-primary shrink-0" />;
      case 'pdf':
        return <FileText className="size-4 text-primary shrink-0" />;
    }
  };

  return (
    <div className="relative w-screen h-screen flex overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30">
      
      {/* 68px LEFT VERTICAL RAIL (STANDARDIZED ACROSS ALL ROUTES) */}
      <aside className="relative z-20 w-17 flex flex-col items-center border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl py-4 h-full shrink-0">
        <Link href="/" className="w-10 h-10 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center mb-6 shadow-sm group">
          <MapPin className="text-primary size-5 group-hover:scale-105 transition-transform" />
        </Link>
        <nav className="flex flex-col gap-4">
          <Link href="/data" title="Data Ingestion & Schema Inspector">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.94 }} 
              transition={motionSprings.snappy} 
              className="p-2.5 rounded-lg text-primary bg-primary/10 transition-colors border border-primary/20 shadow-sm"
            >
              <Database className="size-5" />
            </motion.button>
          </Link>

          <Link href="/" title="Corridor Simulation Canvas">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.94 }} 
              transition={motionSprings.snappy} 
              className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <TrendingUp className="size-5" />
            </motion.button>
          </Link>

          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.94 }} 
            transition={motionSprings.snappy} 
            className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Zap className="size-5" />
          </motion.button>

          {/* BOT ICON */}
          <Link href="/agents" title="Autonomous Multi-Agent Swarm Intelligence">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.94 }} 
              transition={motionSprings.snappy} 
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center justify-center group"
            >
              <BotLogo className="size-5.5" isActive={false} />
            </motion.button>
          </Link>

          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.94 }} 
            transition={motionSprings.snappy} 
            className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <GitBranch className="size-5" />
          </motion.button>
        </nav>
      </aside>

      {/* MAIN BODY AREA (FULL WIDTH DATA INVENTORY) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP NAVBAR (UNIFIED H-14 HEADER) */}
        <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <Database className="size-4 text-primary" />
            <span className="text-foreground font-medium text-sm tracking-tight">Data & Context Studio</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-muted-foreground text-xs font-mono">Corridor Telemetry Repository</span>
            <span className="text-muted-foreground/30">·</span>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-medium tracking-wider bg-primary/10 text-primary border border-primary/20">
              Active Storage
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground tabular-nums hidden sm:inline-block">
              {files.length} Datasets Synced
            </span>
            <div className="h-3.5 w-px bg-border/60 hidden sm:block" />

            <Link href="/">
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="size-3 text-primary" />
                <span>Map Canvas</span>
              </motion.button>
            </Link>
          </div>
        </header>

        {/* WORKSPACE AREA: FULL-WIDTH SPACIOUS INVENTORY */}
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            
            {/* 4 HIGH-LEVEL TELEMETRY FLASHCARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="rounded-xl p-4 bg-card/40 border border-border/50 flex flex-col justify-between gap-2 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-sans">Total Ingested Volume</span>
                  <HardDrive className="size-4 text-primary" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-foreground">68.7</span>
                  <span className="text-xs font-mono text-muted-foreground">MB Storage</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground/80">
                  4 verified sources cached
                </span>
              </div>

              <div className="rounded-xl p-4 bg-card/40 border border-border/50 flex flex-col justify-between gap-2 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-sans">Vectorized Records</span>
                  <Layers className="size-4 text-sky-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-foreground">1.66M</span>
                  <span className="text-xs font-mono text-muted-foreground">Rows Indexed</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground/80">
                  Sensors, POIs & DPR matrix
                </span>
              </div>

              <div className="rounded-xl p-4 bg-card/40 border border-border/50 flex flex-col justify-between gap-2 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-sans">Spatial Projection</span>
                  <Radio className="size-4 text-purple-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-mono text-foreground">EPSG:4326</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground/80">
                  Silk Board → Bellandur GeoJSON
                </span>
              </div>

              <div className="rounded-xl p-4 bg-card/40 border border-border/50 flex flex-col justify-between gap-2 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-sans">Swarm Simulation Sync</span>
                  <CheckCircle2 className="size-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-emerald-400">100%</span>
                  <span className="text-xs font-mono text-muted-foreground">Synchronized</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400/90">
                  Real-time pipeline active
                </span>
              </div>
            </div>

            {/* CATALOG TOOLBAR: SEARCH, FILTERS & UPLOAD ACTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5 flex-1 max-w-lg">
                <div className="relative flex-1">
                  <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search datasets, schema attributes, POIs..." 
                    className="w-full bg-secondary/40 border border-border/60 rounded-xl pl-9 pr-3 py-2 text-xs font-sans text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* FORMAT PILLS */}
                <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl border border-border/40">
                  {['all', 'parquet', 'csv', 'xlsx', 'pdf'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-mono transition-colors ${
                        filterType === type 
                          ? 'bg-secondary text-primary font-semibold border border-primary/30' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* UPLOAD BUTTON */}
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileInputChange} 
                  multiple 
                  accept=".csv,.parquet,.xlsx,.xls,.pdf" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 shadow-sm hover:opacity-90 transition-opacity"
                >
                  <UploadCloud className="size-3.5" />
                  <span>Add Dataset</span>
                </button>
              </div>
            </div>

            {/* DRAG & DROP UPLOAD NOTIFICATION (WHEN DRAGGING) */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border border-dashed rounded-xl p-3.5 text-center transition-all cursor-pointer ${
                isDragging 
                  ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(10,177,186,0.15)]' 
                  : 'border-border/40 bg-secondary/15 hover:bg-secondary/25 hover:border-border/70'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-sans">
                <UploadCloud className="size-4 text-primary" />
                <span>Drag and drop additional files (.CSV, .PARQUET, .XLSX, .PDF) to ingest immediately</span>
              </div>
            </div>

            {/* UPLOAD STATUS ALERT */}
            <AnimatePresence>
              {uploadStatus && (
                <motion.div 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center gap-2 text-xs font-mono"
                >
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{uploadStatus}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* DATASET REPOSITORY CARDS (CLEAN, NO FORCED SCHEMA TABLE COMPULSION) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                <span>Ingested Datasets ({filteredFiles.length})</span>
                <span>Actions</span>
              </div>

              {filteredFiles.map(file => {
                return (
                  <div 
                    key={file.id}
                    className="p-4 rounded-xl border border-border/50 bg-card/40 hover:bg-secondary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    {/* LEFT: ICON + DETAILS */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-secondary/80 border border-border/60 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        {getFormatIcon(file.type)}
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-sm font-medium text-foreground font-sans truncate">
                            {file.name}
                          </h3>
                          {getFormatBadge(file.type)}
                          {file.hasSpatialCoords && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                              <span className="size-1.5 rounded-full bg-primary" />
                              Spatial Verified
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-sans mt-1">
                          <span>{file.category}</span>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="font-mono text-foreground/80">{file.size}</span>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="font-mono text-muted-foreground/80">{file.recordsOrPages}</span>
                          <span className="text-muted-foreground/40 hidden sm:inline">•</span>
                          <span className="hidden sm:inline text-muted-foreground/60">{file.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: EXPLICIT USER CHOICE TO INSPECT SCHEMA OR NOT */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                      <motion.button 
                        onClick={() => setInspectingFileId(file.id)}
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        className="px-3.5 py-1.5 rounded-lg bg-secondary/80 hover:bg-secondary border border-border/80 text-xs font-medium text-foreground flex items-center gap-2 shadow-2xs hover:border-primary/40 transition-colors"
                      >
                        <Eye className="size-3.5 text-primary" />
                        <span>Inspect Schema & Data</span>
                      </motion.button>

                      <button 
                        onClick={(e) => handleDeleteFile(file.id, e)}
                        className="p-2 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Remove dataset"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* SLIDE-OVER INSPECTOR DRAWER (SHOWN ONLY WHEN USER EXPLICITLY CHOOSES TO INSPECT) */}
      <AnimatePresence>
        {inspectedFile && (
          <>
            {/* BACKDROP */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectingFileId(null)}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            />

            {/* SLIDE-OVER DRAWER */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-3xl bg-card border-l border-border shadow-2xl flex flex-col overflow-hidden"
            >
              {/* DRAWER HEADER */}
              <div className="p-6 border-b border-border bg-card/90 backdrop-blur-xl flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                    {getFormatIcon(inspectedFile.type)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground font-sans truncate">
                        {inspectedFile.name}
                      </h2>
                      {getFormatBadge(inspectedFile.type)}
                    </div>
                    <span className="text-xs text-muted-foreground font-sans mt-0.5">
                      {inspectedFile.category} · <strong className="text-foreground/90 font-mono font-normal">{inspectedFile.size}</strong> · {inspectedFile.recordsOrPages}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setInspectingFileId(null)}
                    className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/80 transition-colors flex items-center gap-1.5 text-xs"
                  >
                    <X className="size-4" />
                    <span>Close</span>
                  </button>
                </div>
              </div>

              {/* DRAWER BODY: SCHEMA & TABULAR PREVIEW */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                
                {/* TELEMETRY STRIP */}
                <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 flex flex-wrap items-center gap-5 text-xs font-mono text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground/60">Parser:</span>
                    <span className="text-foreground font-medium">
                      {inspectedFile.type === 'pdf' ? 'PyMuPDF Engine' : inspectedFile.type === 'parquet' ? 'PyArrow WASM' : 'DuckDB Parser'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground/60">Spatial:</span>
                    <span className={inspectedFile.hasSpatialCoords ? 'text-primary font-medium' : 'text-muted-foreground/60'}>
                      {inspectedFile.hasSpatialCoords ? 'EPSG:4326 Verified' : 'None'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground/60">Status:</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ingestion Active
                    </span>
                  </div>
                </div>

                {inspectedFile.type !== 'pdf' ? (
                  <>
                    {/* INFERRED SCHEMA SECTION */}
                    {inspectedFile.columns && inspectedFile.columns.length > 0 && (
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                            Inferred Schema Attributes ({inspectedFile.columns.length} columns)
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {inspectedFile.columns.map((col, idx) => (
                            <div 
                              key={idx} 
                              className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 transition-colors ${
                                col.isSpatial 
                                  ? 'bg-primary/10 border-primary/30 text-primary' 
                                  : 'bg-secondary/50 border-border text-foreground'
                              }`}
                            >
                              <span className="font-medium font-sans">{col.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background/80 text-muted-foreground">
                                {col.isSpatial ? 'GEO' : col.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* LIVE DATA GRID PREVIEW */}
                    {inspectedFile.previewRows && inspectedFile.previewRows.length > 0 && (
                      <div className="flex flex-col gap-2.5 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono uppercase tracking-wider text-muted-foreground">
                            Data Grid Preview ({inspectedFile.previewRows.length} sample rows)
                          </span>
                          <span className="text-muted-foreground font-mono">
                            Silk Board → Bellandur Telemetry
                          </span>
                        </div>

                        <div className="border border-border/80 rounded-xl overflow-hidden bg-background/50">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-border/80 bg-secondary/40 text-muted-foreground text-[11px] font-mono uppercase tracking-wider">
                                  <th className="py-2.5 px-3 w-10 text-center text-muted-foreground/40 font-normal">#</th>
                                  {Object.keys(inspectedFile.previewRows[0]).map(key => (
                                    <th key={key} className="py-2.5 px-4 font-medium text-foreground whitespace-nowrap">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono">{key}</span>
                                        {(key.includes('lat') || key.includes('lon')) && (
                                          <span className="size-1.5 rounded-full bg-primary" />
                                        )}
                                      </div>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/30">
                                {inspectedFile.previewRows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-secondary/25 transition-colors">
                                    <td className="py-3 px-3 text-center text-muted-foreground/40 font-mono text-[11px]">{rIdx + 1}</td>
                                    {Object.entries(row).map(([k, val], cIdx) => (
                                      <td key={cIdx} className="py-3 px-4 whitespace-nowrap">
                                        {typeof val === 'number' ? (
                                          <span className={`font-mono tabular-nums text-xs ${
                                            k.includes('lat') || k.includes('lon') ? 'text-primary font-medium' : 'text-foreground/90'
                                          }`}>
                                            {val.toLocaleString()}
                                          </span>
                                        ) : (
                                          <span className="font-sans text-xs text-foreground font-normal">
                                            {val}
                                          </span>
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground font-mono">
                          <span>Showing sample records from {inspectedFile.recordsOrPages}</span>
                          <span className="text-emerald-400">Verified Ready for Simulation</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* PDF DOSSIER INSPECTOR */
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        Extracted Engineering Alignment Parameters
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {inspectedFile.pdfMetadata?.extractedParams.map((param, pIdx) => (
                          <div key={pIdx} className="bg-secondary/30 border border-border/70 rounded-xl p-3.5 flex flex-col justify-between gap-1 shadow-2xs">
                            <span className="text-xs text-muted-foreground font-sans">{param.label}</span>
                            <span className="text-sm font-mono font-semibold text-foreground">{param.value}</span>
                            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-1">
                              <Check className="size-3" /> Confidence {param.confidence}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        Structural Chapter Index
                      </span>
                      <div className="bg-secondary/20 border border-border/50 rounded-xl p-3 flex flex-col gap-2">
                        {inspectedFile.pdfMetadata?.chapters.map((ch, cIdx) => (
                          <div key={cIdx} className="py-2.5 px-3 rounded-lg bg-secondary/40 text-xs font-sans text-foreground flex items-center justify-between">
                            <span>{ch}</span>
                            <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                              Indexed
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
