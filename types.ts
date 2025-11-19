export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface PersonProfile {
  id: number;
  label: string; // Short title e.g. "Woman in red"
  description: string; // Detailed analysis
  estimatedAge: string;
  gender: string;
  fashion: string;
  box2d: BoundingBox; // Normalized 0-1000 coordinates
  isCelebrity: boolean;
  celebrityName?: string;
}

export interface AnalysisResult {
  people: PersonProfile[];
}