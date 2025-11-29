// Simulated rumour verification (in production, would use web search APIs)

export interface Evidence {
  title: string;
  source: string;
  snippet: string;
  type: 'supporting' | 'contradictory';
}

export interface RumourResult {
  ok: boolean;
  rumour: string;
  verdict: 'real' | 'fake';
  confidence: number;
  evidence: Evidence[];
  reason: string;
}

// Simulated database of known rumours/facts
const knownFacts: Record<string, { verdict: 'real' | 'fake'; confidence: number; reason: string }> = {
  'building collapsed': { verdict: 'fake', confidence: 0.87, reason: 'No official or verified source reports collapse; multiple local news outlets confirm there was no structural incident.' },
  'sector 9': { verdict: 'fake', confidence: 0.85, reason: 'Local authorities have confirmed no incidents in Sector 9.' },
  'flood warning': { verdict: 'real', confidence: 0.92, reason: 'Official weather service has issued flood warnings for low-lying areas.' },
  'evacuation': { verdict: 'real', confidence: 0.75, reason: 'Partial evacuation orders have been issued by local authorities.' },
  'relief camp': { verdict: 'real', confidence: 0.95, reason: 'Multiple verified sources confirm relief camps have been established.' },
  'power outage': { verdict: 'real', confidence: 0.88, reason: 'Utility company has confirmed widespread power outages in several sectors.' }
};

export async function verifyRumour(rumourText: string, source?: string): Promise<RumourResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const lower = rumourText.toLowerCase();
  
  // Check against known facts
  for (const [keyword, factData] of Object.entries(knownFacts)) {
    if (lower.includes(keyword)) {
      const evidence: Evidence[] = [];
      
      if (factData.verdict === 'real') {
        evidence.push({
          title: 'Official Emergency Services Update',
          source: 'Emergency Management Agency',
          snippet: `Confirmed: ${rumourText.substring(0, 50)}...`,
          type: 'supporting'
        });
        evidence.push({
          title: 'Local News Report',
          source: 'City News Network',
          snippet: 'Official sources have verified this information.',
          type: 'supporting'
        });
      } else {
        evidence.push({
          title: 'Official Denial Statement',
          source: 'City Administration',
          snippet: 'The administration has denied these reports as misinformation.',
          type: 'contradictory'
        });
        evidence.push({
          title: 'Fact Check Report',
          source: 'Verified News Agency',
          snippet: 'No evidence found to support these claims.',
          type: 'contradictory'
        });
      }
      
      return {
        ok: true,
        rumour: rumourText,
        verdict: factData.verdict,
        confidence: factData.confidence,
        evidence,
        reason: factData.reason
      };
    }
  }
  
  // Default to fake for unknown rumours (as per requirement to only return real/fake)
  return {
    ok: true,
    rumour: rumourText,
    verdict: 'fake',
    confidence: 0.65,
    evidence: [
      {
        title: 'No verified sources found',
        source: 'Search Results',
        snippet: 'Unable to find reliable sources to verify this information.',
        type: 'contradictory'
      }
    ],
    reason: 'No verified information available to confirm this claim. Treat as unverified until official confirmation.'
  };
}
