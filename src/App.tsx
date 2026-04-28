/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Search, 
  FileJson, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  ExternalLink,
  Brain,
  Filter,
  ArrowRightLeft
} from 'lucide-react';
import { 
  CreativeData, 
  ComparisonResult, 
  EvidenceDetail,
  ClassificationSummary
} from './types';

// --- Components ---

const FileUploader = ({ 
  label, 
  onFileLoaded, 
  fileLoaded 
}: { 
  label: string; 
  onFileLoaded: (data: any) => void;
  fileLoaded: boolean;
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        onFileLoaded(json);
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      onClick={() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) handleFile(file);
        };
        input.click();
      }}
      className={`
        relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer
        flex flex-col items-center justify-center gap-3 w-full
        ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'}
        ${fileLoaded ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
      `}
    >
      {fileLoaded ? (
        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
      ) : (
        <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-500' : 'text-zinc-500'}`} />
      )}
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-500 mt-1">Click or drag JSON</p>
      </div>
    </div>
  );
};

const Tag = ({ text, color = 'blue' }: { text: string; color?: 'blue' | 'pink' | 'gray' }) => {
  const colors = {
    blue: 'bg-blue-600 text-white',
    pink: 'bg-pink-600 text-white',
    gray: 'bg-zinc-700 text-zinc-100',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors[color]}`}>
      {text}
    </span>
  );
};

const EvidenceCard = ({ 
  title, 
  confidence, 
  justification, 
  theme = 'zinc' 
}: { 
  title: string; 
  confidence: number; 
  justification: string;
  theme?: 'zinc' | 'blue' | 'pink';
}) => {
  const themes = {
    zinc: 'bg-[#1a1b1e]/50 border-zinc-800',
    blue: 'bg-blue-900/30 border-blue-800',
    pink: 'bg-pink-900/30 border-pink-800',
  };

  return (
    <div className={`p-3 rounded-lg border ${themes[theme]} text-white h-full shadow-lg group/ev`}>
      <div className="flex items-start justify-between gap-2 mb-1.5 border-b border-white/5 pb-1">
        <span className="text-sm font-black text-white/90 leading-tight">{title}</span>
        <span className="text-xs font-mono font-bold opacity-60 shrink-0">[{confidence}]</span>
      </div>
      <p className="text-[11px] leading-snug opacity-70 line-clamp-3 group-hover/ev:line-clamp-none transition-all">
        {justification || "No justification provided."}
      </p>
    </div>
  );
};

const Modal = ({ 
  item, 
  onClose 
}: { 
  item: ComparisonResult; 
  onClose: () => void 
}) => {
  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 20 }}
        className="bg-[#0f1012] w-full max-w-[95vw] h-[90vh] overflow-hidden rounded-[2rem] border border-zinc-800 relative flex flex-col shadow-2xl shadow-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Area */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none">Creative ID</span>
              <span className="text-white font-mono text-sm leading-none">{item.creativeId}</span>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.diffs.niche ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                <span className="text-[10px] font-black uppercase text-zinc-500">Niche</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.diffs.content_style ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                <span className="text-[10px] font-black uppercase text-zinc-500">Style</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.diffs.target_market ? 'bg-amber-500 shadow-[0_0_8_px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                <span className="text-[10px] font-black uppercase text-zinc-500">Market</span>
              </div>
            </div>
          </div>
          
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex min-h-0">
          
          {/* Narrow Left Bar: Media */}
          <div className="w-[30%] border-right border-zinc-800 p-8 flex flex-col gap-6 bg-zinc-900/30 shrink-0">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
              {item.original.metadata.includes('.mp4') ? (
                <video src={item.original.metadata} autoPlay loop muted className="w-full h-full object-cover" />
              ) : (
                <img src={item.original.metadata} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              )}
            </div>
            <div className="space-y-4">
              <a 
                href={item.original.metadata} 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl text-sm font-bold transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Open full asset
              </a>
              {item.comparison.classification.method && (
                <div className="p-4 bg-zinc-800/20 rounded-xl border border-zinc-800/50 flex items-center gap-3">
                  <Brain className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest leading-none">Classifier Method</p>
                    <p className="text-xs text-zinc-300 mt-1">{item.comparison.classification.method}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Wide Right Area: Data Comparison */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#0a0b0d]">
             {/* Labels Header */}
             <div className="grid grid-cols-2 h-12 border-b border-zinc-800/50">
               <div className="flex items-center px-8 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] bg-zinc-900/10">Original Dataset</div>
               <div className="flex items-center px-8 text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] bg-blue-500/5">Comparison Dataset</div>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
               
               {/* Comparison Grid Section */}
               {[
                 { 
                   id: 'niche', 
                   title: 'Niche Analysis', 
                   original: item.original.classification.evidence.niche, 
                   comparison: item.comparison.classification.evidence.niche,
                   theme: 'zinc' as const
                 },
                 { 
                   id: 'style', 
                   title: 'Content Style', 
                   original: item.original.classification.evidence.content_style, 
                   comparison: item.comparison.classification.evidence.content_style,
                   theme: 'blue' as const
                 },
                 { 
                   id: 'market', 
                   title: 'Target Market', 
                   original: item.original.classification.evidence.target_market, 
                   comparison: item.comparison.classification.evidence.target_market,
                   theme: 'pink' as const
                 }
               ].map(section => (
                 <section key={section.id} className="space-y-4">
                   <div className="flex items-center gap-3">
                      <h4 className="text-xs font-black uppercase text-zinc-400 tracking-widest">{section.title}</h4>
                      <div className="h-px bg-zinc-800 flex-1" />
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 self-start">
                        {Object.entries(section.original).map(([t, d]) => (
                          <EvidenceCard key={t} title={t} confidence={d.confidence} justification={d.justification} theme={section.theme} />
                        ))}
                     </div>
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 self-start">
                        {Object.entries(section.comparison).map(([t, d]) => (
                          <EvidenceCard key={t} title={t} confidence={d.confidence} justification={d.justification} theme={section.theme} />
                        ))}
                     </div>
                   </div>
                 </section>
               ))}
             </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [sourceData, setSourceData] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<ComparisonResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [displayLimit, setDisplayLimit] = useState(50);

  const normalizeItem = (item: any): CreativeData | null => {
    if (!item || typeof item !== 'object') return null;
    
    // ... no changes to normalization logic ...
    let creative_id: string | number | undefined;
    let method: string | undefined;
    let evidence: any;
    let summary: any;
    let metadata: string = item.metadata || '';

    const containers = [item.classification, item.results, item].filter(c => c && typeof c === 'object');

    for (const c of containers) {
      if (c.creative_id !== undefined) {
        creative_id = c.creative_id;
        break;
      }
    }

    if (creative_id === undefined) {
      if (item.results && item.results.id !== undefined) creative_id = item.results.id;
      else if (item.id !== undefined) creative_id = item.id;
    }

    for (const c of containers) {
      if (c.classification && typeof c.classification === 'object' && (c.classification.niche || c.classification.content_style)) {
        summary = c.classification;
        break;
      }
    }

    for (const c of containers) {
      if (c.evidence && !evidence) evidence = c.evidence;
      if (c.method && !method) method = c.method;
    }

    if (creative_id === undefined || !summary || !evidence) return null;

    return {
      id: typeof item.id === 'number' ? item.id : (typeof item.id === 'string' ? parseInt(item.id) || 0 : 0),
      classification: {
        creative_id,
        method,
        evidence,
        classification: {
          niche: Array.isArray(summary.niche) ? summary.niche : [],
          content_style: Array.isArray(summary.content_style) ? summary.content_style : [],
          target_market: summary.target_market || 'N/A'
        }
      },
      metadata
    };
  };

  // ... normalizeData ...
  const normalizeData = (data: any): CreativeData[] => {
    if (!data) return [];
    if (Array.isArray(data)) {
      return data.map(normalizeItem).filter((i): i is CreativeData => i !== null);
    }
    const possibleList = data.items || data.data || data.creatives || data.results || data.list;
    if (Array.isArray(possibleList)) {
      return possibleList.map(normalizeItem).filter((i): i is CreativeData => i !== null);
    }
    const single = normalizeItem(data);
    if (single) return [single];
    return [];
  };

  const availableFilters = useMemo(() => {
    const niches = new Set<string>();
    const styles = new Set<string>();

    if (sourceData) {
      const sourceList = normalizeData(sourceData);
      sourceList.forEach(item => {
        item.classification.classification.niche.forEach(n => niches.add(n));
        item.classification.classification.content_style.forEach(s => styles.add(s));
      });
    }

    return {
      niches: Array.from(niches).sort(),
      styles: Array.from(styles).sort()
    };
  }, [sourceData]);

  const results = useMemo(() => {
    if (!sourceData || !comparisonData) return [];

    const sourceList = normalizeData(sourceData);
    const comparisonList = normalizeData(comparisonData);

    const sourceMap = new Map<string, CreativeData>();
    sourceList.forEach(item => {
      const id = String(item.classification.creative_id);
      sourceMap.set(id, item);
    });

    const comparisonResults: ComparisonResult[] = [];

    comparisonList.forEach(compItem => {
      const id = String(compItem.classification.creative_id);
      const original = sourceMap.get(id);

      if (original) {
        const sourceSummaries = original.classification.classification;
        const compSummaries = compItem.classification.classification;

        if (!sourceSummaries || !compSummaries) return;

        const niche1 = Array.isArray(sourceSummaries.niche) ? [...sourceSummaries.niche].sort() : [];
        const niche2 = Array.isArray(compSummaries.niche) ? [...compSummaries.niche].sort() : [];
        
        const style1 = Array.isArray(sourceSummaries.content_style) ? [...sourceSummaries.content_style].sort() : [];
        const style2 = Array.isArray(compSummaries.content_style) ? [...compSummaries.content_style].sort() : [];

        const nicheDiff = JSON.stringify(niche1) !== JSON.stringify(niche2);
        const styleDiff = JSON.stringify(style1) !== JSON.stringify(style2);
        const marketDiff = sourceSummaries.target_market !== compSummaries.target_market;

        if (nicheDiff || styleDiff || marketDiff) {
          comparisonResults.push({
            creativeId: id,
            original,
            comparison: compItem,
            diffs: {
              niche: nicheDiff,
              content_style: styleDiff,
              target_market: marketDiff
            }
          });
        }
      }
    });

    return comparisonResults;
  }, [sourceData, comparisonData]);

  const filteredResults = useMemo(() => {
    let list = results;
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      list = list.filter(r => r.creativeId.includes(lowerQuery));
    }

    if (selectedNiche !== 'all') {
      list = list.filter(r => r.original.classification.classification.niche.includes(selectedNiche));
    }

    if (selectedStyle !== 'all') {
      list = list.filter(r => r.original.classification.classification.content_style.includes(selectedStyle));
    }

    // Reset display limit when filtering changes
    setDisplayLimit(50);
    return list;
  }, [results, searchQuery, selectedNiche, selectedStyle]);

  const stats = useMemo(() => ({
    total: results.length,
    niche: results.filter(r => r.diffs.niche).length,
    style: results.filter(r => r.diffs.content_style).length,
    market: results.filter(r => r.diffs.target_market).length
  }), [results]);

  const analysisInfo = useMemo(() => {
    if (!sourceData || !comparisonData) return null;
    const sourceList = normalizeData(sourceData);
    const comparisonList = normalizeData(comparisonData);
    
    const sourceIds = new Set(sourceList.map(i => String(i.classification.creative_id)));
    let matches = 0;
    comparisonList.forEach(i => {
      if (sourceIds.has(String(i.classification.creative_id))) matches++;
    });

    return {
      sourceCount: sourceList.length,
      comparisonCount: comparisonList.length,
      matchCount: matches
    };
  }, [sourceData, comparisonData]);

  const visibleResults = useMemo(() => {
    return filteredResults.slice(0, displayLimit);
  }, [filteredResults, displayLimit]);

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-zinc-100 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0b0d]/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="grid grid-cols-2 gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-sm" />
              <div className="w-3 h-3 bg-zinc-500 rounded-sm" />
              <div className="w-3 h-3 bg-zinc-500 rounded-sm" />
              <div className="w-3 h-3 bg-zinc-500 rounded-sm" />
            </div>
            <h1 className="text-xl font-black tracking-tight uppercase">Creative Visualizer</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Niche Filter */}
            {availableFilters.niches.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3 text-zinc-500" />
                <select 
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors w-40"
                >
                  <option value="all">Every Niche</option>
                  {availableFilters.niches.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Style Filter */}
            {availableFilters.styles.length > 0 && (
              <div className="flex items-center gap-2">
                <select 
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors w-40"
                >
                  <option value="all">Every Style</option>
                  {availableFilters.styles.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative ml-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors w-48"
              />
            </div>
            <div className="h-4 w-px bg-zinc-800 mx-1" />
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Differences Found</span>
                <span className="text-lg font-black font-mono">{stats.total}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-6 py-8">
        
        {/* Analysis Status */}
        {analysisInfo && (
          <div className="mb-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center justify-between mx-auto max-w-7xl">
            <div className="flex gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Source Items</span>
                <span className="text-sm font-mono font-bold">{analysisInfo.sourceCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Comparison Items</span>
                <span className="text-sm font-mono font-bold">{analysisInfo.comparisonCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Matched IDs</span>
                <span className="text-sm font-mono font-bold text-blue-400">{analysisInfo.matchCount}</span>
              </div>
            </div>
            
            {analysisInfo.matchCount === 0 && (
              <div className="flex items-center gap-2 text-amber-500 text-xs font-bold">
                <AlertCircle className="w-4 h-4" />
                NO MATCHING CREATIVE_IDs FOUND
              </div>
            )}
            {analysisInfo.matchCount > 0 && results.length === 0 && (
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                ALL MATCHED ITEMS ARE IDENTICAL
              </div>
            )}
          </div>
        )}

        {/* Upload State */}
        {!sourceData || !comparisonData ? (
          <div className="max-w-xl mx-auto flex flex-col gap-8 mt-20">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tight">DATA COMPARISON</h2>
              <p className="text-zinc-500">Upload both files to identify creative classification discrepancies.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploader 
                label="Source File (Original)" 
                onFileLoaded={setSourceData} 
                fileLoaded={!!sourceData} 
              />
              <FileUploader 
                label="Comparison File" 
                onFileLoaded={setComparisonData} 
                fileLoaded={!!comparisonData} 
              />
            </div>
            {sourceData && comparisonData && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {}} // Comparison happens via useMemo
                className="bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
              >
                Start Analysis
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Summary Bars */}
            <div className="grid grid-cols-3 gap-6 max-w-7xl mx-auto">
              {[
                { label: 'Niche Mismatches', value: stats.niche, color: 'bg-zinc-500' },
                { label: 'Style Mismatches', value: stats.style, color: 'bg-blue-600' },
                { label: 'Market Mismatches', value: stats.market, color: 'bg-pink-600' }
              ].map((stat, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-wider leading-none">Detection Type</p>
                    <h3 className="font-bold text-sm">{stat.label}</h3>
                  </div>
                  <div className={`px-4 py-1 rounded-full ${stat.color} text-white font-mono font-black`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Grid - 6 columns on large */}
            {visibleResults.length > 0 ? (
              <div className="space-y-12 pb-20">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {visibleResults.map((result, idx) => (
                    <motion.div
                      key={`${result.creativeId}-${idx}`}
                      layoutId={`${result.creativeId}-${idx}`}
                      onClick={() => setSelectedItem(result)}
                      className="group relative bg-[#151619] border border-zinc-800 rounded-3xl overflow-hidden cursor-pointer hover:border-zinc-600 transition-all shadow-xl"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        {result.original.metadata.includes('.mp4') ? (
                          <video 
                            src={result.original.metadata} 
                            muted 
                            loop 
                            onMouseOver={(e) => e.currentTarget.play()}
                            onMouseOut={(e) => e.currentTarget.pause()}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                        ) : (
                          <img 
                            src={result.original.metadata} 
                            alt="" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        
                        {/* Tags Overlay */}
                        <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                          {result.original.classification.classification.niche.length > 0 && <Tag text={result.original.classification.classification.niche[0]} color="gray" />}
                          {result.original.classification.classification.content_style.length > 0 && <Tag text={result.original.classification.classification.content_style[0]} color="blue" />}
                          <Tag text={result.original.classification.classification.target_market} color="pink" />
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-mono text-zinc-500">ID: {result.creativeId}</span>
                          <div className="flex gap-1.5">
                            {result.diffs.niche && <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" title="Niche Mismatch" />}
                            {result.diffs.content_style && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Style Mismatch" />}
                            {result.diffs.target_market && <div className="w-1.5 h-1.5 rounded-full bg-pink-500" title="Market Mismatch" />}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] text-zinc-600 font-bold uppercase">Original</p>
                            <p className="text-xs text-white truncate">{result.original.classification.classification.niche[0] || 'N/A'}</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="text-[10px] text-zinc-600 font-bold uppercase">Comparison</p>
                            <p className="text-xs text-blue-400 truncate">{result.comparison.classification.classification.niche[0] || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between group/btn">
                          <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Compare Evidence</span>
                          <ChevronRight className="w-4 h-4 text-zinc-600 translate-x-0 group-hover/btn:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {displayLimit < filteredResults.length && (
                  <div className="flex justify-center">
                    <button 
                      onClick={() => setDisplayLimit(prev => prev + 50)}
                      className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl font-bold text-sm transition-all flex items-center gap-3 active:scale-95"
                    >
                      <span className="text-zinc-400">Showing {visibleResults.length} of {filteredResults.length}</span>
                      <div className="w-px h-4 bg-zinc-800" />
                      <span>Load Next 50 Items</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
                    <ArrowRightLeft className="w-12 h-12 opacity-20" />
                    <p className="font-medium">No differences detected with current data.</p>
                </div>
            )}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
