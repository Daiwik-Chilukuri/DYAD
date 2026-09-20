'use client';

import { useState, useRef, useEffect, useCallback, ChangeEvent, DragEvent } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, MapPin,
  UploadCloud, FileText, Table, FileSpreadsheet,
  Trash2, CheckCircle2, Search, FileCode, Check,
  Eye, X, Download, HardDrive,
  Layers, Radio, Loader2, RefreshCw, PlusCircle, FlaskConical,
  Home, LocateFixed, CircleUser
} from 'lucide-react';
import { motionSprings } from '../../../lib/motion';
import { BotLogo } from '../../../components/BotLogo';
import { SidebarRail } from '../../../components/navigation/SidebarRail';

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
  sizeBytes: number;
  type: 'geojson' | 'json' | 'csv' | 'parquet' | 'xlsx' | 'pdf';
  category: string;
  status: 'indexed' | 'ready';
  recordsOrPages: string;
  timestamp: string;
  hasSpatialCoords: boolean;
  columns?: ColumnProfile[];
  previewRows?: Record<string, string | number | boolean | null>[];
  pdfMetadata?: {
    chapters: string[];
    extractedParams: { label: string; value: string; confidence: string }[];
  };
}

interface RawFile {
  id: string;
  name: string;
  relativePath: string;
  subfolder: string;
  category: string;
  size: string;
  sizeBytes: number;
  type: string;
}

interface RepositoryStats {
  totalFiles: number;
  totalVolumeMb: number;
  spatialFilesCount: number;
  formats: Record<string, number>;
}

export default function DataSynthesisPage() {
  const [files, setFiles] = useState<IngestedFile[]>([]);
  const [rawFiles, setRawFiles] = useState<RawFile[]>([]);
  const [stats, setStats] = useState<RepositoryStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingRaw, setIsLoadingRaw] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [stagingIds, setStagingIds] = useState<Record<string, boolean>>({});
  const [inspectingFileId, setInspectingFileId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inspectedFile = files.find(f => f.id === inspectingFileId || f.name === inspectingFileId) || null;

  // Load active datasets from backend API route (/api/data)
  const loadDatasets = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.files)) {
          setFiles(data.files);
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('[DataStudio] Failed to fetch datasets:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load raw test datasets from prototype-datasets-collection/raw (/api/data/raw)
  const loadRawDatasets = useCallback(async () => {
    try {
      setIsLoadingRaw(true);
      const res = await fetch('/api/data/raw', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.files)) {
          setRawFiles(data.files);
        }
      }
    } catch (err) {
      console.error('[DataStudio] Failed to fetch raw datasets:', err);
    } finally {
      setIsLoadingRaw(false);
    }
  }, []);

  useEffect(() => {
    loadDatasets();
    loadRawDatasets();
  }, [loadDatasets, loadRawDatasets]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Upload custom files to backend /api/data endpoint and append to disk
  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const formData = new FormData();
    Array.from(fileList).forEach(file => {
      formData.append('files', file);
    });

    try {
      setIsUploading(true);
      setUploadStatus(`Ingesting ${fileList.length} dataset(s) into active storage...`);

      const res = await fetch('/api/data', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadStatus(data.message || `Successfully ingested ${fileList.length} dataset(s).`);
        await loadDatasets();
      } else {
        setUploadStatus(`Upload failed: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      console.error('[DataStudio] Upload error:', err);
      setUploadStatus(`Upload error: ${err.message || 'Connection failed'}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(null), 4000);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    uploadFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    uploadFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Stage a raw dataset into active storage with 1 click
  const handleStageRawFile = async (raw: RawFile) => {
    try {
      setStagingIds(prev => ({ ...prev, [raw.id]: true }));
      const res = await fetch('/api/data/raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relativePath: raw.relativePath, targetName: raw.name }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadStatus(`Staged '${raw.name}' into active storage repository.`);
        await loadDatasets();
      } else {
        setUploadStatus(`Staging failed: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message}`);
    } finally {
      setStagingIds(prev => ({ ...prev, [raw.id]: false }));
      setTimeout(() => setUploadStatus(null), 3500);
    }
  };

  // Reset active storage
  const handleClearActiveStorage = async () => {
    if (!confirm('Are you sure you want to clear active storage test datasets? (Base metro network will be kept)')) {
      return;
    }
    try {
      const res = await fetch('/api/data/raw', { method: 'DELETE' });
      if (res.ok) {
        setUploadStatus('Cleared active storage. Only base metro rail remains.');
        await loadDatasets();
        setInspectingFileId(null);
      }
    } catch (err: any) {
      console.error('Failed to clear storage:', err);
    }
  };

  const handleDeleteFile = async (file: IngestedFile, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/data?filename=${encodeURIComponent(file.name)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFiles(prev => prev.filter(f => f.name !== file.name));
        if (inspectingFileId === file.id || inspectingFileId === file.name) {
          setInspectingFileId(null);
        }
        setUploadStatus(`Removed ${file.name} from active storage.`);
        setTimeout(() => setUploadStatus(null), 3000);
      }
    } catch (err) {
      console.error('[DataStudio] Delete error:', err);
    }
  };

  const filteredFiles = files.filter(f => {
    const matchesType = filterType === 'all' || f.type === filterType;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getFormatBadge = (type: string) => {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-secondary border border-border text-muted-foreground">
        {type}
      </span>
    );
  };

  const getFormatIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'geojson':
        return <MapPin className="size-4 text-[#00f5d4] shrink-0" />;
      case 'json':
        return <Radio className="size-4 text-purple-400 shrink-0" />;
      case 'csv':
        return <Table className="size-4 text-cyan-400 shrink-0" />;
      case 'parquet':
        return <FileCode className="size-4 text-emerald-400 shrink-0" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="size-4 text-amber-400 shrink-0" />;
      case 'pdf':
        return <FileText className="size-4 text-rose-400 shrink-0" />;
      default:
        return <Database className="size-4 text-slate-400 shrink-0" />;
    }
  };

  const totalVolumeDisplay = stats?.totalVolumeMb ?? Number(
    (files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0) / (1024 * 1024)).toFixed(1)
  );
  const spatialCount = stats?.spatialFilesCount ?? files.filter(f => f.hasSpatialCoords).length;

  return (
    <div className="relative w-screen h-screen flex overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30 select-none">
      
      {/* 68px LEFT VERTICAL RAIL (STANDARDIZED ACROSS ALL ROUTES) */}
      <SidebarRail />

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
            <button
              onClick={() => {
                loadDatasets();
                loadRawDatasets();
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              title="Refresh repository"
            >
              <RefreshCw className={`size-3.5 ${isLoading || isLoadingRaw ? 'animate-spin text-primary' : ''}`} />
            </button>
            <span className="text-xs font-mono text-muted-foreground tabular-nums hidden sm:inline-block">
              {files.length} Datasets Active
            </span>
          </div>
        </header>

        {/* WORKSPACE AREA: FULL-WIDTH SPACIOUS INVENTORY */}
        <div className="flex-1 overflow-y-auto px-8 py-7 [scrollbar-width:thin]">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            
            {/* 4 HIGH-LEVEL TELEMETRY FLASHCARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="rounded-xl p-4 bg-card/40 border border-border/50 flex flex-col justify-between gap-2 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-sans">Active Storage Volume</span>
                  <HardDrive className="size-4 text-primary" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-foreground tabular-nums">
                    {totalVolumeDisplay}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">MB Storage</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground/80">
                  {files.length} active files on disk
                </span>
              </div>

              <div className="rounded-xl p-4 bg-card/40 border border-border/50 flex flex-col justify-between gap-2 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-sans">Spatial Verified Layers</span>
                  <Layers className="size-4 text-sky-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-foreground tabular-nums">
                    {spatialCount}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">Spatial Datasets</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground/80">
                  WGS84 EPSG:4326 GeoJSON & Points
                </span>
              </div>

              <div className="rounded-xl p-4 bg-card/40 border border-border/50 flex flex-col justify-between gap-2 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-sans">Raw Test Datasets</span>
                  <FlaskConical className="size-4 text-primary" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-primary tabular-nums">
                    {rawFiles.length}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">Available to Pick</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground/80">
                  prototype-datasets-collection/raw
                </span>
              </div>

              <div className="rounded-xl p-4 bg-card/40 border border-border/50 flex flex-col justify-between gap-2 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-sans">Swarm Auto-Sync</span>
                  <CheckCircle2 className="size-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-emerald-400">Live</span>
                  <span className="text-xs font-mono text-muted-foreground">Auto-Detection</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400/90">
                  Streams to panel on every run
                </span>
              </div>
            </div>

            {/* SECTION 1: RAW DATASETS TEST BENCH */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0E1117]/85 backdrop-blur-xl p-5 flex flex-col gap-3 shadow-2xl shadow-black/50 ring-1 ring-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                    <FlaskConical className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-white tracking-tight flex items-center gap-2">
                      <span>Raw Datasets Test Bench</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 font-medium">
                        {rawFiles.length} Test Files Ready
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Pick datasets from <code className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">prototype-datasets-collection/raw</code> to stage them into active storage for swarm testing.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadRawDatasets}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`size-3 text-primary ${isLoadingRaw ? 'animate-spin' : ''}`} />
                    <span>Scan Raw</span>
                  </button>
                </div>
              </div>

              {isLoadingRaw ? (
                <div className="py-6 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>Scanning raw datasets directory...</span>
                </div>
              ) : rawFiles.length === 0 ? (
                <div className="py-4 text-center text-xs font-mono text-slate-400">
                  No raw datasets found in prototype-datasets-collection/raw.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                  {rawFiles.map((raw) => {
                    const isAlreadyStaged = files.some((f) => f.name === raw.name);
                    const isStaging = !!stagingIds[raw.id];

                    return (
                      <div
                        key={raw.id}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                          isAlreadyStaged
                            ? 'bg-[#161B22]/70 border-emerald-500/30 shadow-xs'
                            : 'bg-[#161B22]/40 border-white/[0.08] hover:border-primary/40 hover:bg-[#161B22]/60'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="mt-0.5">{getFormatIcon(raw.type)}</div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-medium text-slate-200 truncate" title={raw.name}>
                              {raw.name}
                            </span>
                            <div className="flex items-center gap-2 text-[10.5px] font-mono text-slate-400 mt-0.5">
                              <span>{raw.category}</span>
                              <span>•</span>
                              <span className="text-slate-300 tabular-nums">{raw.size}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                          {getFormatBadge(raw.type)}

                          {isAlreadyStaged ? (
                            <span className="text-[11px] font-mono text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="size-3 text-emerald-400" />
                              <span>Staged</span>
                            </span>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={motionSprings.snappy}
                              disabled={isStaging}
                              onClick={() => handleStageRawFile(raw)}
                              className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 hover:border-primary/40 text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {isStaging ? (
                                <Loader2 className="size-3 animate-spin text-primary" />
                              ) : (
                                <PlusCircle className="size-3" />
                              )}
                              <span>Stage Dataset</span>
                            </motion.button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 2: CATALOG TOOLBAR, DROPZONE & ACTIVE DATASETS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2.5 flex-1 max-w-xl">
                <div className="relative flex-1">
                  <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search active datasets, schema attributes, POIs, lakes..." 
                    className="w-full bg-secondary/40 border border-border/60 rounded-xl pl-9 pr-3 py-2 text-xs font-sans text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* FORMAT PILLS */}
                <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl border border-border/40 overflow-x-auto">
                  {['all', 'geojson', 'json', 'csv', 'parquet', 'xlsx', 'pdf'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-mono transition-colors shrink-0 cursor-pointer ${
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

              {/* UPLOAD & CLEAR ACTIONS */}
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileInputChange} 
                  multiple 
                  accept=".geojson,.json,.csv,.parquet,.xlsx,.xls,.pdf" 
                  className="hidden" 
                />
                
                <button
                  onClick={handleClearActiveStorage}
                  className="px-3 py-2 rounded-xl text-xs font-mono text-rose-400/80 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Clear all non-base test datasets from active storage"
                >
                  <Trash2 className="size-3.5" />
                  <span>Clear Active</span>
                </button>

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 shadow-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="size-3.5" />
                  )}
                  <span>{isUploading ? 'Ingesting...' : 'Add Dataset'}</span>
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
                  ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,245,212,0.15)]' 
                  : 'border-border/40 bg-secondary/15 hover:bg-secondary/25 hover:border-border/70'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-sans">
                <UploadCloud className="size-4 text-primary" />
                <span>Drag and drop spatial & tabular files (.GEOJSON, .JSON, .CSV, .PARQUET, .XLSX, .PDF) to append to active storage</span>
              </div>
            </div>

            {/* UPLOAD STATUS ALERT */}
            <AnimatePresence>
              {uploadStatus && (
                <motion.div 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={motionSprings.snappy}
                  className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center gap-2 text-xs font-mono"
                >
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{uploadStatus}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* DATASET REPOSITORY CARDS */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                <span>Active Datasets in Swarm Storage ({filteredFiles.length})</span>
                <span>Actions</span>
              </div>

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs font-mono">
                  <Loader2 className="size-5 animate-spin text-primary" />
                  <span>Scanning active storage repository...</span>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs font-sans border border-dashed border-border/50 rounded-xl">
                  <span>No active datasets in storage.</span>
                  <span className="text-[11px] text-muted-foreground/60">Pick from the Test Bench above or drop custom files.</span>
                </div>
              ) : (
                filteredFiles.map(file => {
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

                      {/* RIGHT: INSPECT / DOWNLOAD / DELETE */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                        <motion.button 
                          onClick={() => setInspectingFileId(file.id)}
                          whileHover={{ scale: 1.02 }} 
                          whileTap={{ scale: 0.98 }}
                          transition={motionSprings.snappy}
                          className="px-3.5 py-1.5 rounded-lg bg-secondary/80 hover:bg-secondary border border-border/80 text-xs font-medium text-foreground flex items-center gap-2 shadow-2xs hover:border-primary/40 transition-colors cursor-pointer"
                        >
                          <Eye className="size-3.5 text-primary" />
                          <span>Inspect Schema & Data</span>
                        </motion.button>

                        <a
                          href={`/data/${encodeURIComponent(file.name)}`}
                          download
                          className="p-2 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-secondary transition-colors"
                          title="Download dataset"
                        >
                          <Download className="size-3.5" />
                        </a>

                        <button 
                          onClick={(e) => handleDeleteFile(file, e)}
                          className="p-2 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Remove dataset from storage"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>

      {/* SLIDE-OVER INSPECTOR DRAWER */}
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
                  <a 
                    href={`/data/${encodeURIComponent(inspectedFile.name)}`}
                    download
                    className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/80 transition-colors flex items-center gap-1.5 text-xs"
                    title="Download dataset file"
                  >
                    <Download className="size-3.5" />
                    <span>Download</span>
                  </a>

                  <button 
                    onClick={() => setInspectingFileId(null)}
                    className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/80 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
                  >
                    <X className="size-4" />
                    <span>Close</span>
                  </button>
                </div>
              </div>

              {/* DRAWER BODY: SCHEMA & TABULAR PREVIEW */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 [scrollbar-width:thin]">
                
                {/* TELEMETRY STRIP */}
                <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 flex flex-wrap items-center gap-5 text-xs font-mono text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground/60">Parser:</span>
                    <span className="text-foreground font-medium">
                      {inspectedFile.type === 'pdf' ? 'PyMuPDF Engine' : inspectedFile.type === 'geojson' ? 'GeoJSON Spatial Parser' : inspectedFile.type === 'parquet' ? 'PyArrow WASM' : 'DuckDB Ingestion'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground/60">Spatial:</span>
                    <span className={inspectedFile.hasSpatialCoords ? 'text-primary font-medium' : 'text-muted-foreground/60'}>
                      {inspectedFile.hasSpatialCoords ? 'EPSG:4326 Verified' : 'Non-spatial Tabular'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground/60">Status:</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready for Swarm
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
                            Data Grid Preview ({inspectedFile.previewRows.length} sample records)
                          </span>
                          <span className="text-muted-foreground font-mono">
                            Disk Synced Telemetry
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
                                        {(key.includes('lat') || key.includes('lon') || key.includes('coord')) && (
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
                                            k.includes('lat') || k.includes('lon') || k.includes('coord') ? 'text-primary font-medium' : 'text-foreground/90'
                                          }`}>
                                            {val.toLocaleString()}
                                          </span>
                                        ) : (
                                          <span className="font-sans text-xs text-foreground font-normal">
                                            {String(val ?? '')}
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
                          <span className="text-emerald-400">Verified Ready for Downstream Swarm</span>
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
