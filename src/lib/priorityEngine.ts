// Priority Engine - Implements the exact formula from requirements

export interface SeverityScores {
  S: number; // Severity
  T: number; // Time Criticality
  V: number; // Vulnerability
  C: number; // Complication Risk
  E: number; // Environmental Danger
}

export interface PriorityBreakdown {
  P_base: number;
  loc_factor: number;
  resource_add: number;
  waiting_boost: number;
  fairness_boost: number;
  raw_score_before_clamp: number;
}

export interface PriorityResult {
  score: number;
  tag: 'Critical' | 'High' | 'Medium' | 'Low' | 'Minimal';
  color: string;
  breakdown: PriorityBreakdown;
  human_review_required: boolean;
}

export type Category = 'Medical' | 'Food' | 'Shelter' | 'Trapped' | 'Others';

// Keywords for classification
const categoryKeywords: Record<Category, string[]> = {
  Medical: ['injured', 'injury', 'bleeding', 'unconscious', 'heart', 'breathing', 'pain', 'sick', 'fever', 'medicine', 'doctor', 'hospital', 'ambulance', 'diabetic', 'pregnant', 'stroke', 'seizure', 'broken', 'fracture'],
  Food: ['hungry', 'food', 'water', 'thirsty', 'starving', 'dehydrated', 'meal', 'supplies', 'ration'],
  Shelter: ['homeless', 'shelter', 'roof', 'house', 'building', 'tent', 'cover', 'cold', 'exposed', 'rain'],
  Trapped: ['trapped', 'stuck', 'debris', 'collapsed', 'rubble', 'cannot move', 'pinned', 'buried', 'locked'],
  Others: []
};

const severityKeywords = {
  high: ['dying', 'dead', 'unconscious', 'critical', 'severe', 'massive', 'heavy bleeding', 'cannot breathe', 'heart attack', 'stroke'],
  medium: ['injured', 'bleeding', 'pain', 'broken', 'fracture', 'sick', 'fever'],
  low: ['minor', 'small', 'slight', 'little']
};

const urgencyKeywords = ['help', 'now', 'urgent', 'immediately', 'emergency', 'hurry', 'fast', 'quickly', 'asap', 'dying', 'please'];

const vulnerabilityKeywords = {
  child: ['child', 'children', 'baby', 'infant', 'toddler', 'kid', 'minor', 'young'],
  elderly: ['elderly', 'old', 'senior', 'aged', 'grandma', 'grandpa', 'grandmother', 'grandfather'],
  pregnant: ['pregnant', 'expecting', 'pregnancy', 'labor'],
  disabled: ['disabled', 'disability', 'wheelchair', 'blind', 'deaf', 'paralyzed']
};

const complicationKeywords = ['fire', 'gas', 'leak', 'electrocution', 'electric', 'shock', 'collapse', 'explosion', 'smoke', 'fumes', 'chemical'];

const environmentalKeywords = ['flood', 'flooding', 'storm', 'landslide', 'earthquake', 'tsunami', 'cyclone', 'tornado', 'hurricane', 'water rising'];

function containsKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw.toLowerCase()));
}

function countKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter(kw => lower.includes(kw.toLowerCase())).length;
}

export function classifyCategory(description: string): Category {
  const lower = description.toLowerCase();
  
  let maxScore = 0;
  let bestCategory: Category = 'Others';
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === 'Others') continue;
    const score = countKeywords(lower, keywords);
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category as Category;
    }
  }
  
  return bestCategory;
}

export function calculateSeverityScores(description: string, age: number): SeverityScores {
  const lower = description.toLowerCase();
  
  // S - Severity (0-1)
  let S = 0.3; // base
  if (containsKeyword(lower, severityKeywords.high)) S = 0.9;
  else if (containsKeyword(lower, severityKeywords.medium)) S = 0.6;
  else if (containsKeyword(lower, severityKeywords.low)) S = 0.2;
  
  // T - Time Criticality (0-1)
  const urgencyCount = countKeywords(lower, urgencyKeywords);
  let T = Math.min(0.3 + urgencyCount * 0.15, 1.0);
  if (containsKeyword(lower, ['dying', 'cannot breathe', 'unconscious'])) T = 1.0;
  
  // V - Vulnerability (0-1)
  let V = 0.3; // base
  if (age < 5) V = 0.95;
  else if (age < 12) V = 0.8;
  else if (age > 70) V = 0.85;
  else if (age > 60) V = 0.7;
  
  // Check for vulnerability keywords
  if (containsKeyword(lower, vulnerabilityKeywords.child)) V = Math.max(V, 0.85);
  if (containsKeyword(lower, vulnerabilityKeywords.elderly)) V = Math.max(V, 0.85);
  if (containsKeyword(lower, vulnerabilityKeywords.pregnant)) V = Math.max(V, 0.9);
  if (containsKeyword(lower, vulnerabilityKeywords.disabled)) V = Math.max(V, 0.8);
  
  // C - Complication Risk (0-1)
  const compCount = countKeywords(lower, complicationKeywords);
  let C = Math.min(0.2 + compCount * 0.25, 1.0);
  
  // E - Environmental Danger (0-1)
  const envCount = countKeywords(lower, environmentalKeywords);
  let E = Math.min(0.1 + envCount * 0.3, 1.0);
  
  return {
    S: Math.round(S * 100) / 100,
    T: Math.round(T * 100) / 100,
    V: Math.round(V * 100) / 100,
    C: Math.round(C * 100) / 100,
    E: Math.round(E * 100) / 100
  };
}

export function calculatePriority(
  severity: SeverityScores,
  locationAccuracy: number = 0.5, // LA (0-1) - not used in new formula but kept for compatibility
  routeReliability: number = 0.5, // R (0-1) - not used in new formula but kept for compatibility
  routeBlocked: boolean = false, // not used in new formula but kept for compatibility
  availableResources: number = 1, // A - not used in new formula but kept for compatibility
  waitingMinutes: number = 0, // not used in new formula but kept for compatibility
  fairnessBoost: number = 0 // not used in new formula but kept for compatibility
): PriorityResult {
  // NEW WEIGHTED SUM FORMULA:
  // P = 0.35×S + 0.25×T + 0.15×V + 0.15×C + 0.10×E
  // Weights: S=0.35, T=0.25, V=0.15, C=0.15, E=0.10
  const score = 
    0.35 * severity.S + 
    0.25 * severity.T + 
    0.15 * severity.V + 
    0.15 * severity.C + 
    0.10 * severity.E;
  
  // Clamp to 0-1 range
  const clampedScore = Math.max(0, Math.min(1, score));
  
  // Determine tag and color based on new thresholds
  let tag: PriorityResult['tag'];
  let color: string;
  
  if (clampedScore >= 0.8) {
    tag = 'Critical';
    color = 'Red';
  } else if (clampedScore >= 0.6) {
    tag = 'High';
    color = 'Orange';
  } else if (clampedScore >= 0.4) {
    tag = 'Medium';
    color = 'Yellow';
  } else if (clampedScore >= 0.2) {
    tag = 'Low';
    color = 'Green';
  } else {
    tag = 'Minimal';
    color = 'Blue';
  }
  
  // human_review_required = (score >= 0.8) AND (LA < 0.5)
  const human_review_required = clampedScore >= 0.8 && locationAccuracy < 0.5;
  
  return {
    score: Math.round(clampedScore * 1000) / 1000,
    tag,
    color,
    breakdown: {
      P_base: Math.round(score * 1000) / 1000,
      loc_factor: 1, // Not used in new formula
      resource_add: 0, // Not used in new formula
      waiting_boost: 0, // Not used in new formula
      fairness_boost: 0, // Not used in new formula
      raw_score_before_clamp: Math.round(score * 1000) / 1000
    },
    human_review_required
  };
}

export function generateExplanation(
  priority: PriorityResult,
  severity: SeverityScores,
  description: string,
  age: number
): string {
  const reasons: string[] = [];
  const lower = description.toLowerCase();
  
  // Severity reasons
  if (containsKeyword(lower, severityKeywords.high)) {
    reasons.push('severe symptoms (unconscious, heavy bleeding)');
  } else if (severity.S >= 0.6) {
    reasons.push('moderate injury detected');
  } else if (severity.S < 0.4) {
    reasons.push('no life-threat keywords found');
  }
  
  // Vulnerability reasons
  if (age < 12) {
    reasons.push(`child victim (age ${age})`);
  } else if (age > 65) {
    reasons.push(`elderly victim (age ${age})`);
  }
  if (containsKeyword(lower, vulnerabilityKeywords.pregnant)) {
    reasons.push('pregnant victim');
  }
  
  // Urgency reasons
  if (severity.T >= 0.8) {
    reasons.push('urgent language detected ("help now")');
  } else if (severity.T < 0.4) {
    reasons.push('low urgency scores');
  }
  
  // Location factor
  if (priority.breakdown.loc_factor >= 0.9) {
    reasons.push(`rescuer nearby (loc_factor = ${priority.breakdown.loc_factor})`);
  } else if (priority.breakdown.loc_factor < 0.8) {
    reasons.push(`rescuer far (loc_factor = ${priority.breakdown.loc_factor})`);
  }
  
  // Environmental hazards
  if (severity.E >= 0.5) {
    reasons.push('environmental hazards detected');
  }
  
  // Complication risks
  if (severity.C >= 0.5) {
    reasons.push('complication risks present (fire, gas, collapse)');
  }
  
  // Waiting boost
  if (priority.breakdown.waiting_boost > 0) {
    reasons.push(`waiting time boost applied (+${priority.breakdown.waiting_boost})`);
  }
  
  // Ensure at least 3 reasons
  while (reasons.length < 3) {
    if (!reasons.some(r => r.includes('loc_factor'))) {
      reasons.push(`location factor = ${priority.breakdown.loc_factor}`);
    } else if (!reasons.some(r => r.includes('severity'))) {
      reasons.push(`base severity score = ${priority.breakdown.P_base}`);
    } else {
      reasons.push(`priority score = ${priority.score}`);
    }
  }
  
  const explanation = `🤖 AI Analysis: ${priority.tag} Priority because:\n- ${reasons.slice(0, 4).join('\n- ')}`;
  
  return explanation;
}
