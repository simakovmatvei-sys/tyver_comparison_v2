/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
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
  ArrowRightLeft,
  Link as LinkIcon,
  Copy,
  Check,
  FileType
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

interface EvidenceCardProps {
  title: string;
  confidence: number;
  justification: string;
  theme?: 'zinc' | 'blue' | 'pink';
}

/**
 * Отображение карточки с доказательством (confidence и обоснование)
 */
const EvidenceCard: React.FC<EvidenceCardProps> = ({
  title,
  confidence,
  justification,
  theme = 'zinc'
}) => {
  const themes = {
    zinc: 'bg-[#1a1b1e]/50 border-zinc-800',
    blue: 'bg-blue-900/30 border-blue-800',
    pink: 'bg-pink-900/30 border-pink-800',
  };

  return (
    <div className={`p-3 rounded-lg border ${themes[theme]} text-white flex-1 shadow-lg group/ev`}>
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

/**
 * Компонент для отображения и копирования ссылки
 */
const MetadataLink = ({ url }: { url: string }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!url) return null;

  return (
    <div className="flex items-center gap-2 group/link">
      <div className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors">
        <LinkIcon className="w-4 h-4 text-blue-400 shrink-0" />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-zinc-300 truncate hover:text-blue-400 transition-colors"
        >
          {url}
        </a>
      </div>
      <button
        onClick={handleCopy}
        className={`p-2 rounded-lg border transition-all ${copied ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}
        title="Copy to clipboard"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
};

// Состояние фильтров приложения, включая новый фильтр по хукам
interface FilterState {
  hook: string;
  sexy: string;
  gambling: string;
  creo_lang: string;
  game_name: string;
  game_type: string;
}

// Компонент раздела фильтров для вывода независимых селектов DataSet A или B
const FilterSection = ({
  label,
  options,
  filters,
  onChange,
  color = "blue"
}: {
  label: string;
  options: {
    hooks: string[],
    sexys: string[],
    gamblings: string[],
    creoLangs: string[],
    gameTypes: string[]
  };
  filters: FilterState;
  onChange: (key: keyof FilterState, value: string) => void;
  color?: "blue" | "zinc" | "emerald";
}) => {
  const accentColors = {
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-400",
    zinc: "border-zinc-800 bg-zinc-900/40 text-zinc-400",
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
  };

  const selectBaseClass = "bg-zinc-900/80 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[11px] font-medium focus:outline-none focus:border-blue-500/50 hover:border-zinc-700 transition-all cursor-pointer appearance-none text-zinc-300 w-full";
  const inputBaseClass = "bg-zinc-900/80 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[11px] font-medium focus:outline-none focus:border-blue-500/50 hover:border-zinc-700 transition-all text-zinc-300 w-full placeholder:text-zinc-600";

  return (
    <div className={`flex flex-col gap-2 p-2.5 rounded-xl border ${accentColors[color]} transition-all group/filter w-full max-w-xl`}>
      <div className="flex items-center justify-between gap-4 mb-0.5 px-0.5">
        <div className="flex items-center gap-2">
          <Filter className="w-3 h-3 text-blue-500 group-hover/filter:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{label}</span>
        </div>
      </div>

      {/* Сетка фильтров изменена на 6 колонок/строк для компактности */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* Фильтр по Hook */}
        <div className="relative group/sel">
          <select
            value={filters.hook}
            onChange={(e) => onChange('hook', e.target.value)}
            className={`${selectBaseClass} pr-8`}
          >
            <option value="all">Any Hook</option>
            {options.hooks.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <ChevronRight className="w-3 h-3 rotate-90" />
          </div>
        </div>

        {/* Фильтр по Sexy */}
        <div className="relative group/sel">
          <select
            value={filters.sexy}
            onChange={(e) => onChange('sexy', e.target.value)}
            className={`${selectBaseClass} pr-8`}
          >
            <option value="all">Any Sexy</option>
            {options.sexys.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <ChevronRight className="w-3 h-3 rotate-90" />
          </div>
        </div>

        {/* Фильтр по Gambling */}
        <div className="relative group/sel">
          <select
            value={filters.gambling}
            onChange={(e) => onChange('gambling', e.target.value)}
            className={`${selectBaseClass} pr-8`}
          >
            <option value="all">Any Gambling</option>
            {options.gamblings.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <ChevronRight className="w-3 h-3 rotate-90" />
          </div>
        </div>

        {/* Фильтр по Creo Lang */}
        <div className="relative group/sel">
          <select
            value={filters.creo_lang}
            onChange={(e) => onChange('creo_lang', e.target.value)}
            className={`${selectBaseClass} pr-8`}
          >
            <option value="all">Any Creo Lang</option>
            {options.creoLangs.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <ChevronRight className="w-3 h-3 rotate-90" />
          </div>
        </div>

        {/* Фильтр по Game Type */}
        <div className="relative group/sel">
          <select
            value={filters.game_type}
            onChange={(e) => onChange('game_type', e.target.value)}
            className={`${selectBaseClass} pr-8`}
          >
            <option value="all">Any Game Type</option>
            {options.gameTypes.map(gt => (
              <option key={gt} value={gt}>{gt}</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <ChevronRight className="w-3 h-3 rotate-90" />
          </div>
        </div>

        {/* Фильтр по Game Name (Текстовый инпут) */}
        <div className="relative">
          <input
            type="text"
            placeholder="Game Name..."
            value={filters.game_name}
            onChange={(e) => onChange('game_name', e.target.value)}
            className={inputBaseClass}
          />
        </div>
      </div>
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
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current && typeof item?.original?.metadata === 'string' && item.original.metadata.includes('.mp4')) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Playback interrupted or prevented (e.g. by closing modal quickly)
        });
      }
    }
  }, [item?.original?.metadata]);

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

            {/* Metadata Links */}
            <div className="flex items-center gap-4 border-l border-zinc-800 pl-6">
              {item?.original?.metadata && (
                <a
                  href={item.original.metadata}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Original Link</span>
                </a>
              )}
              {item.comparison && item?.comparison?.metadata && (
                <a
                  href={item.comparison.metadata}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Comparison Link</span>
                </a>
              )}
            </div>

            {item.comparison && (
              <div className="flex gap-4 border-l border-zinc-800 pl-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${(item.diffs && item.diffs.game_type) ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                  <span className="text-[10px] font-black uppercase text-zinc-500">Niche</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${(item.diffs && item.diffs.creo_lang) ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                  <span className="text-[10px] font-black uppercase text-zinc-500">Style</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${(item.diffs && item.diffs.gambling) ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                  <span className="text-[10px] font-black uppercase text-zinc-500">Market</span>
                </div>
              </div>
            )}
          </div>

          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex min-h-0">

          {/* Narrow Left Bar: Media */}
          <div className="w-[30%] border-r border-zinc-800 p-8 flex flex-col gap-6 bg-zinc-900/30 shrink-0">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
              {typeof item?.original?.metadata === 'string' && item.original.metadata.includes('.mp4') ? (
                <video
                  ref={videoRef}
                  src={item.original.metadata}
                  loop
                  muted
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={item?.original?.metadata || ''} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              )}
            </div>
            <div className="space-y-4">
              {item?.original?.classification?.method && (
                <div className="p-4 bg-zinc-800/20 rounded-xl border border-zinc-800/50 flex items-center gap-3">
                  <Brain className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest leading-none">Classifier Method</p>
                    <p className="text-xs text-zinc-300 mt-1">{getMethodDisplayName(item.original.classification.method)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Wide Right Area: Data Comparison */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#0a0b0d]">
            {/* Labels Header */}
            <div className={`grid ${item.comparison ? 'grid-cols-2' : 'grid-cols-1'} h-12 border-b border-zinc-800/50`}>
              <div className="flex items-center px-8 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] bg-zinc-900/10">Original Dataset</div>
              {item.comparison && <div className="flex items-center px-8 text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] bg-blue-500/5">Comparison Dataset</div>}
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">

              {/* Comparison Grid Section */}
              {[
                { id: "gambling", title: "Gambling / iGaming", field: "gambling" },
                { id: "hook", title: "Hook Text", field: "hook" },
                { id: "sexy", title: "Sexy Content", field: "sexy" },
                { id: "game_name", title: "Game Name", field: "game_name" },
                { id: "game_provider", title: "Game Provider", field: "game_provider" },
                { id: "game_type", title: "Game Type", field: "game_type" },
                { id: "creo_lang", title: "Creo Language", field: "creo_lang" }
              ].map(section => {
                const origVal = item?.original?.classification?.classification?.[section.field] || "Unknown";
                const compVal = item?.comparison?.classification?.classification?.[section.field];

                const origEvidence = item?.original?.classification?.evidence?.[section.field]?.[origVal];
                const compEvidence = (compVal && item?.comparison?.classification?.evidence) ? item.comparison.classification.evidence[section.field]?.[compVal] : undefined;

                return (
                  <section key={section.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-black uppercase text-zinc-200 tracking-wider">{section.title}</h4>
                      <div className="h-px bg-zinc-800 flex-1" />
                    </div>
                    <div className={"grid " + (item.comparison ? "grid-cols-2" : "grid-cols-1") + " gap-8"}>
                      <div className="flex flex-col h-full">
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-3 shadow-lg">
                          <p className="text-sm font-bold text-white">{origVal}</p>
                          {origEvidence && (
                            <div className="pt-2.5 border-t border-white/5 flex items-start justify-between gap-4">
                              <p className="text-[11px] leading-snug text-zinc-400 flex-1">
                                {origEvidence.justification || "No justification provided."}
                              </p>
                              <span className="text-xs font-mono font-bold text-zinc-500 shrink-0">[{origEvidence.confidence}]</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {item.comparison && compVal !== undefined && (
                        <div className="flex flex-col h-full">
                          <div className={"p-4 rounded-lg border space-y-3 shadow-lg " + ((item?.diffs && item.diffs[section.field]) ? "border-amber-500/50 bg-amber-500/5" : "border-zinc-800 bg-zinc-900/50")}>
                            <p className={"text-sm font-bold " + (item.diffs[section.field] ? "text-amber-400" : "text-white")}>{compVal}</p>
                            {compEvidence && (
                              <div className="pt-2.5 border-t border-white/5 flex items-start justify-between gap-4">
                                <p className="text-[11px] leading-snug text-zinc-400 flex-1">
                                  {compEvidence.justification || "No justification provided."}
                                </p>
                                <span className="text-xs font-mono font-bold text-zinc-500 shrink-0">[{compEvidence.confidence}]</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Функция для преобразования технических имен методов в читаемые названия
 */
const getMethodDisplayName = (method?: string) => {
  if (!method) return 'N/A';
  if (method === 'fast_classifier') return 'Classifier';
  if (method === 'qwen_fallback') return 'Qwen';
  return method;
};

/**
 * Функция для разбора значения хука и возвращения строки (или "---" для null/undefined)
 */
const parseHookVal = (val: any): string => {
  if (val === null || val === undefined) return '---';
  if (Array.isArray(val)) {
    return val.length > 0 ? val.join(', ') : '---';
  }
  if (typeof val === 'string') {
    return val.trim() || '---';
  }
  return String(val) || '---';
};

export default function App() {
  // Состояние данных
  const [sourceData, setSourceData] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);

  // Состояние UI
  const [selectedItem, setSelectedItem] = useState<ComparisonResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Независимые фильтры для двух документов (Dataset A и Dataset B + фильтры по ключам)
  const [filtersA, setFiltersA] = useState<FilterState>({
    hook: 'all',
    sexy: 'all',
    gambling: 'all',
    creo_lang: 'all',
    game_name: '',
    game_type: 'all'
  });
  const [filtersB, setFiltersB] = useState<FilterState>({
    hook: 'all',
    sexy: 'all',
    gambling: 'all',
    creo_lang: 'all',
    game_name: '',
    game_type: 'all'
  });

  // Настройки отображения
  const [displayLimit, setDisplayLimit] = useState(50);
  const [forceViewMode, setForceViewMode] = useState(false);

  const normalizeItem = (item: any): CreativeData | null => {
    if (!item || typeof item !== 'object') return null;

    let creative_id: string | undefined;
    let method: string | undefined = item.method;
    let evidence: any = item.evidence || {};
    let classification: any = item.classification || {};
    let metadata: string = item.metadata_url || item.metadata || '';

    if (item.creative_id !== undefined) {
      creative_id = String(item.creative_id);
    } else if (item.id !== undefined) {
      creative_id = String(item.id);
    }

    if (creative_id === undefined) {
      return null;
    }

    return {
      id: typeof item.id === 'number' ? item.id : (typeof item.id === 'string' ? parseInt(item.id) || 0 : 0),
      classification: {
        creative_id,
        method,
        evidence,
        classification: {
          hook: String(classification.hook || 'other'),
          sexy: String(classification.sexy || 'other'),
          gambling: String(classification.gambling || 'No'),
          creo_lang: String(classification.creo_lang || 'Unknown'),
          game_name: String(classification.game_name || 'Unknown'),
          game_type: String(classification.game_type || 'Unknown'),
          audio_lang: String(classification.audio_lang || 'Unknown'),
          game_provider: String(classification.game_provider || 'Unknown')
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

  // Определение доступных опций фильтрации на основе загруженных файлов данных
  const availableFilters = useMemo(() => {
    const getOptions = (data: any) => {
      const hooks = new Set<string>();
      const sexys = new Set<string>();
      const gamblings = new Set<string>();
      const creoLangs = new Set<string>();
      const gameTypes = new Set<string>();
      if (data) {
        const list = normalizeData(data);
        list.forEach(item => {
          if (item.classification.classification.hook) {
            hooks.add(item.classification.classification.hook);
          }
          if (item.classification.classification.sexy) {
            sexys.add(item.classification.classification.sexy);
          }
          if (item.classification.classification.gambling) {
            gamblings.add(item.classification.classification.gambling);
          }
          if (item.classification.classification.creo_lang) {
            creoLangs.add(item.classification.classification.creo_lang);
          }
          if (item.classification.classification.game_type) {
            gameTypes.add(item.classification.classification.game_type);
          }
        });
      }
      return {
        hooks: Array.from(hooks).sort(),
        sexys: Array.from(sexys).sort(),
        gamblings: Array.from(gamblings).sort(),
        creoLangs: Array.from(creoLangs).sort(),
        gameTypes: Array.from(gameTypes).sort()
      };
    };

    return {
      source: getOptions(sourceData),
      comparison: getOptions(comparisonData)
    };
  }, [sourceData, comparisonData]);

  const results = useMemo(() => {
    if (!sourceData) return [];

    const sourceList = normalizeData(sourceData);

    // If we only have sourceData, we show all items in "View Mode"
    if (!comparisonData) {
      return sourceList.map(item => {
        const diffs: Record<string, boolean> = {};
        Object.keys(item.classification.classification).forEach(k => {
          diffs[k] = false;
        });
        return {
          creativeId: item.classification.creative_id,
          original: item,
          diffs
        };
      });
    }

    const comparisonList = normalizeData(comparisonData);

    const sourceMap = new Map<string, CreativeData>();
    sourceList.forEach(item => {
      sourceMap.set(item.classification.creative_id, item);
    });

    const comparisonResults: ComparisonResult[] = [];

    comparisonList.forEach(compItem => {
      const id = compItem.classification.creative_id;
      const original = sourceMap.get(id);

      if (original) {
        const sourceSummaries = original.classification.classification;
        const compSummaries = compItem.classification.classification;

        if (!sourceSummaries || !compSummaries) return;

        const diffs: Record<string, boolean> = {};
        let hasAnyDiff = false;

        const keys = [
          'hook', 'sexy', 'gambling', 'creo_lang',
          'game_name', 'game_type', 'game_provider'
        ];

        keys.forEach(k => {
          const diff = sourceSummaries[k] !== compSummaries[k];
          diffs[k] = diff;
          if (diff) hasAnyDiff = true;
        });

        if (hasAnyDiff) {
          comparisonResults.push({
            creativeId: id,
            original,
            comparison: compItem,
            diffs
          });
        }
      }
    });

    return comparisonResults;
  }, [sourceData, comparisonData]);

  const filteredResults = useMemo(() => {
    let list = results;

    // Поиск по ID (глобальный)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      list = list.filter(r => r.creativeId.includes(lowerQuery));
    }

    const applyFilters = (item: CreativeData, filters: FilterState) => {
      if (filters.hook !== 'all' && item.classification.classification.hook !== filters.hook) {
        return false;
      }
      if (filters.sexy !== 'all' && item.classification.classification.sexy !== filters.sexy) {
        return false;
      }
      if (filters.gambling !== 'all' && item.classification.classification.gambling !== filters.gambling) {
        return false;
      }
      if (filters.creo_lang !== 'all' && item.classification.classification.creo_lang !== filters.creo_lang) {
        return false;
      }
      if (filters.game_type !== 'all' && item.classification.classification.game_type !== filters.game_type) {
        return false;
      }
      if (filters.game_name.trim() !== '') {
        const searchName = filters.game_name.toLowerCase();
        const itemName = (item.classification.classification.game_name || '').toLowerCase();
        if (!itemName.includes(searchName)) {
          return false;
        }
      }
      return true;
    };

    // Применяем фильтр A к источнику
    list = list.filter(r => applyFilters(r.original, filtersA));

    // Применяем фильтр B к сравнению (если оно есть)
    if (comparisonData) {
      list = list.filter(r => {
        if (!r.comparison) return false;
        return applyFilters(r.comparison, filtersB);
      });
    }

    // Reset display limit when filtering changes
    setDisplayLimit(50);
    return list;
  }, [results, searchQuery, filtersA, filtersB, comparisonData]);

  const stats = useMemo(() => {
    let niche = 0;
    let style = 0;
    let market = 0;
    results.forEach(r => {
      if (r.diffs.game_type) niche++;
      if (r.diffs.creo_lang) style++;
      if (r.diffs.gambling) market++;
    });
    return {
      total: results.length,
      niche,
      style,
      market
    };
  }, [results]);

  const analysisInfo = useMemo(() => {
    if (!sourceData) return null;
    const sourceList = normalizeData(sourceData);

    if (!comparisonData) {
      return {
        sourceCount: sourceList.length,
        comparisonCount: 0,
        matchCount: 0,
        isViewOnly: true
      };
    }

    const comparisonList = normalizeData(comparisonData);

    const sourceIds = new Set(sourceList.map(i => i.classification.creative_id));
    let matches = 0;
    comparisonList.forEach(i => {
      if (sourceIds.has(i.classification.creative_id)) matches++;
    });

    return {
      sourceCount: sourceList.length,
      comparisonCount: comparisonList.length,
      matchCount: matches,
      isViewOnly: false
    };
  }, [sourceData, comparisonData]);

  const visibleResults = useMemo(() => {
    return filteredResults.slice(0, displayLimit);
  }, [filteredResults, displayLimit]);

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-zinc-100 font-sans selection:bg-blue-500/30">

      {/* Header */}
      <header className="z-40 bg-[#0a0b0d]/95 backdrop-blur-xl border-b border-zinc-800/60 shadow-xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-12">
          <div className="flex items-center gap-4 shrink-0 group/logo cursor-default">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="w-3.5 h-3.5 bg-blue-500 rounded-full group-hover/logo:scale-110 transition-transform" />
              <div className="w-3.5 h-3.5 bg-zinc-600 rounded-full group-hover/logo:scale-110 transition-transform delay-75" />
              <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full group-hover/logo:scale-110 transition-transform delay-100" />
              <div className="w-3.5 h-3.5 bg-zinc-700 rounded-full group-hover/logo:scale-110 transition-transform delay-150" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xs font-black tracking-[0.4em] uppercase leading-none text-zinc-500">Creative</h1>
              <span className="text-3xl font-black tracking-tighter uppercase leading-none mt-1.5">Visualizer</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-end gap-3 min-w-0">
            {/* Панель фильтров для первого файла */}
            {sourceData && (
              <FilterSection
                label={comparisonData ? "Dataset A (Original)" : "Filters"}
                options={availableFilters.source}
                filters={filtersA}
                color="zinc"
                onChange={(key, val) => setFiltersA(prev => ({ ...prev, [key]: val }))}
              />
            )}

            {/* Панель фильтров для второго файла */}
            {comparisonData && (
              <FilterSection
                label="Dataset B (Comparison)"
                options={availableFilters.comparison}
                filters={filtersB}
                color="blue"
                onChange={(key, val) => setFiltersB(prev => ({ ...prev, [key]: val }))}
              />
            )}
          </div>

          <div className="w-px h-24 bg-gradient-to-b from-transparent via-zinc-800 to-transparent mx-2" />

          <div className="flex flex-col gap-3 shrink-0">
            <div className="relative group/search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover/search:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Filter IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500/50 transition-all w-32 xl:w-48 placeholder:text-zinc-700 group-hover:border-zinc-700"
              />
            </div>

            <div className="flex items-center justify-end gap-4 px-1">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none mb-1">Found</span>
                <span className="text-xl font-black font-mono leading-none text-blue-500">{filteredResults.length}</span>
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
              {!analysisInfo.isViewOnly && (
                <>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Comparison Items</span>
                    <span className="text-sm font-mono font-bold">{analysisInfo.comparisonCount}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Matched IDs</span>
                    <span className="text-sm font-mono font-bold text-blue-400">{analysisInfo.matchCount}</span>
                  </div>
                </>
              )}
            </div>

            {!analysisInfo.isViewOnly ? (
              <>
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
              </>
            ) : (
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                <FileJson className="w-4 h-4" />
                SINGLE FILE VIEW MODE
              </div>
            )}
          </div>
        )}

        {/* Upload State */}
        {!sourceData ? (
          <div className="max-w-xl mx-auto flex flex-col gap-8 mt-20">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tight">DATA VISUALIZER</h2>
              <p className="text-zinc-500">Upload a JSON file to explore its contents or compare two files.</p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <FileUploader
                label="Source File (Original)"
                onFileLoaded={setSourceData}
                fileLoaded={!!sourceData}
              />
            </div>
          </div>
        ) : !forceViewMode && !comparisonData ? (
          <div className="max-w-xl mx-auto flex flex-col gap-8 mt-20">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tight">ADD SECOND FILE?</h2>
              <p className="text-zinc-500 text-sm">You can view the original file now or upload a comparison file.</p>
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
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  // We already have results from sourceData, but the logic 
                  // is stuck in the "Upload State" if comparisonData is null.
                  // I will handle this by checking if summary bars should show.
                }}
                className="hidden" // Just for semantic placeholder
              />
              {comparisonData && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => { }}
                  className="bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                  Start Analysis
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
              <button
                onClick={() => setForceViewMode(true)}
                className="text-zinc-500 hover:text-white text-sm font-bold transition-colors py-2"
              >
                Continue with single file →
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Summary Bars */}
            {comparisonData && (
              <div className="grid grid-cols-3 gap-6 max-w-7xl mx-auto">
                {[
                  { label: 'Game Type Mismatches', value: stats.niche, color: 'bg-zinc-500' },
                  { label: 'Creo Lang Mismatches', value: stats.style, color: 'bg-blue-600' },
                  { label: 'Gambling Mismatches', value: stats.market, color: 'bg-pink-600' }
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
            )}

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
                            onMouseOver={(e) => {
                              const playPromise = e.currentTarget.play();
                              if (playPromise !== undefined) {
                                playPromise.catch(() => {
                                  // Playback interrupted or prevented
                                });
                              }
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.pause();
                            }}
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
                          <Tag text={result.original.classification.classification.hook} color="gray" />
                          <Tag text={result.original.classification.classification.sexy} color="pink" />
                          <Tag text={result.original.classification.classification.creo_lang} color="blue" />
                        </div>
                      </div>

                      <div className="p-4">
                        {/* Gambling */}
                        <div className="mb-3 grid grid-cols-1 gap-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[10px] text-zinc-600 font-bold uppercase">Gambling</p>
                            {result.diffs.gambling && <div className="w-1.5 h-1.5 rounded-full bg-pink-500" title="Gambling Mismatch" />}
                          </div>
                          {result.comparison ? (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <p className="text-zinc-400 truncate">{result.original.classification.classification.gambling || 'No'}</p>
                              <p className="text-blue-400 truncate text-right font-medium">{result.comparison.classification.classification.gambling || 'No'}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-400 truncate">{result.original.classification.classification.gambling || 'No'}</p>
                          )}
                        </div>

                        {/* Game Name */}
                        <div className={`grid ${result.comparison ? 'grid-cols-2' : 'grid-cols-1'} gap-4 pt-2.5 border-t border-zinc-800/80`}>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[10px] text-zinc-600 font-bold uppercase">{result.comparison ? 'Orig. Name' : 'Game Name'}</p>
                              {result.diffs.game_name && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Game Name Mismatch" />}
                            </div>
                            <p className="text-xs text-white truncate" title={result.original.classification.classification.game_name}>{result.original.classification.classification.game_name || 'N/A'}</p>
                          </div>
                          {result.comparison && (
                            <div className="space-y-1 text-right flex flex-col items-end">
                              <p className="text-[10px] text-zinc-600 font-bold uppercase">Comp. Name</p>
                              <p className="text-xs text-blue-400 truncate w-full" title={result.comparison.classification.classification.game_name}>{result.comparison.classification.classification.game_name || 'N/A'}</p>
                            </div>
                          )}
                        </div>

                        {/* Game Provider */}
                        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 grid grid-cols-1 gap-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[10px] text-zinc-600 font-bold uppercase">Game Provider</p>
                            {result.diffs.game_provider && <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" title="Game Provider Mismatch" />}
                          </div>
                          {result.comparison ? (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <p className="text-zinc-400 truncate" title={result.original.classification.classification.game_provider}>
                                {result.original.classification.classification.game_provider || 'N/A'}
                              </p>
                              <p className="text-blue-400 truncate text-right font-medium" title={result.comparison.classification.classification.game_provider}>
                                {result.comparison.classification.classification.game_provider || 'N/A'}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-400 truncate" title={result.original.classification.classification.game_provider}>
                              {result.original.classification.classification.game_provider || 'N/A'}
                            </p>
                          )}
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
