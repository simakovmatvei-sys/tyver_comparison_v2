export interface EvidenceDetail {
  confidence: number;
  justification: string;
}

export interface Evidence {
  hook?: Record<string, EvidenceDetail>;
  sexy?: Record<string, EvidenceDetail>;
  gambling?: Record<string, EvidenceDetail>;
  creo_lang?: Record<string, EvidenceDetail>;
  game_name?: Record<string, EvidenceDetail>;
  game_type?: Record<string, EvidenceDetail>;
  audio_lang?: Record<string, EvidenceDetail>;
  game_provider?: Record<string, EvidenceDetail>;
  [key: string]: Record<string, EvidenceDetail> | undefined;
}

export interface ClassificationSummary {
  hook: string;
  sexy: string;
  gambling: string;
  creo_lang: string;
  game_name: string;
  game_type: string;
  audio_lang: string;
  game_provider: string;
  [key: string]: string;
}

export interface CreativeData {
  id: number;
  classification: {
    creative_id: string;
    method?: string;
    evidence: Evidence;
    classification: ClassificationSummary;
  };
  metadata: string; // URL (metadata_url)
}

export interface ComparisonResult {
  creativeId: string;
  original: CreativeData;
  comparison?: CreativeData;
  diffs: Record<string, boolean>;
}

