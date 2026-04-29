export interface EvidenceDetail {
  confidence: number;
  justification: string;
}

export interface Evidence {
  niche: Record<string, EvidenceDetail>;
  content_style: Record<string, EvidenceDetail>;
  target_market: Record<string, EvidenceDetail>;
}

export interface ClassificationSummary {
  niche: string[];
  content_style: string[];
  target_market: string;
}

export interface CreativeData {
  id: number;
  classification: {
    creative_id: string | number;
    method?: string;
    evidence: Evidence;
    classification: ClassificationSummary;
  };
  metadata: string; // URL
}

export interface ComparisonResult {
  creativeId: string;
  original: CreativeData;
  comparison?: CreativeData;
  diffs: {
    niche: boolean;
    content_style: boolean;
    target_market: boolean;
  };
}
