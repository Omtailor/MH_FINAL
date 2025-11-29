// In-memory store for SOS requests (simulating a database)
import { Category, SeverityScores, PriorityResult } from './priorityEngine';

export interface SOSRequest {
  sos_id: string;
  name: string;
  age: number;
  phone: string;
  description: string;
  category: Category;
  severity: SeverityScores;
  priority: PriorityResult;
  reason_explanation: string;
  location: {
    lat: number | null;
    lng: number | null;
    LA: number;
  };
  created_at: string;
  status: 'pending' | 'accepted' | 'resolved';
  rescuer_id?: string;
  rescue_session_id?: string;
  eta_seconds?: number;
  consent_timestamp?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  snippet: string;
  timestamp: string;
  source: string;
}

let sosRequests: SOSRequest[] = [];
let newsItems: NewsItem[] = [];
let sosCounter = 0;

// Generate unique SOS ID
export function generateSOSId(): string {
  sosCounter++;
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `sos_${date}_${String(sosCounter).padStart(4, '0')}`;
}

// Add new SOS request
export function addSOSRequest(request: Omit<SOSRequest, 'sos_id' | 'created_at' | 'status'>): SOSRequest {
  const newRequest: SOSRequest = {
    ...request,
    sos_id: generateSOSId(),
    created_at: new Date().toISOString(),
    status: 'pending'
  };
  sosRequests.unshift(newRequest);
  return newRequest;
}

// Get all SOS requests sorted by priority
export function getSOSRequests(category?: Category): SOSRequest[] {
  let filtered = sosRequests;
  
  if (category) {
    filtered = sosRequests.filter(r => r.category === category);
  }
  
  return filtered.sort((a, b) => {
    // Sort by priority score DESC
    if (b.priority.score !== a.priority.score) {
      return b.priority.score - a.priority.score;
    }
    // Then by newest first for ties
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

// Get pending requests
export function getPendingRequests(category?: Category): SOSRequest[] {
  return getSOSRequests(category).filter(r => r.status === 'pending');
}

// Get resolved requests
export function getResolvedRequests(): SOSRequest[] {
  return sosRequests.filter(r => r.status === 'resolved');
}

// Accept SOS request
export function acceptSOSRequest(sosId: string, rescuerId: string): { ok: boolean; rescue_session_id?: string; eta_seconds?: number } {
  const request = sosRequests.find(r => r.sos_id === sosId);
  if (!request || request.status !== 'pending') {
    return { ok: false };
  }
  
  request.status = 'accepted';
  request.rescuer_id = rescuerId;
  request.rescue_session_id = `rs_${Date.now()}`;
  request.eta_seconds = Math.floor(Math.random() * 600) + 120; // 2-12 minutes
  
  return {
    ok: true,
    rescue_session_id: request.rescue_session_id,
    eta_seconds: request.eta_seconds
  };
}

// Resolve SOS request
export function resolveSOSRequest(sosId: string): boolean {
  const request = sosRequests.find(r => r.sos_id === sosId);
  if (!request) return false;
  request.status = 'resolved';
  return true;
}

// Reset all requests
export function resetRequests(): void {
  sosRequests = [];
  sosCounter = 0;
}

// Clear all requests
export function clearAllRequests(): void {
  sosRequests = [];
}

// News feed functions
export function addNewsItem(item: Omit<NewsItem, 'id'>): NewsItem {
  const newItem: NewsItem = {
    ...item,
    id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  newsItems.unshift(newItem);
  // Keep max 50 items
  if (newsItems.length > 50) {
    newsItems = newsItems.slice(0, 50);
  }
  return newItem;
}

export function getNewsItems(since?: string): NewsItem[] {
  if (since) {
    return newsItems.filter(item => new Date(item.timestamp) > new Date(since));
  }
  return newsItems;
}

// Initialize with some sample news
export function initializeSampleNews(): void {
  if (newsItems.length > 0) return;
  
  const sampleNews = [
    {
      title: 'Emergency Response Team Deployed to Downtown Area',
      snippet: 'Emergency services have been dispatched to respond to a situation in the downtown area. Residents are advised to avoid the vicinity until further notice.',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      source: 'Local Emergency Services'
    },
    {
      title: 'Weather Alert: Severe Storm Approaching',
      snippet: 'A severe storm is expected to hit the region within the next 2 hours. Seek shelter and avoid unnecessary travel. Emergency shelters are open at community centers.',
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      source: 'Weather Service'
    },
    {
      title: 'Power Restoration in Northwest Sector',
      snippet: "Power has been restored to 85% of affected households in the northwest sector after yesterday's outage. Crews are working to restore remaining areas.",
      timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
      source: 'Utility Company'
    },
    {
      title: 'Road Closures Due to Emergency Operations',
      snippet: 'Several roads in the central district are closed due to ongoing emergency operations. Please use alternate routes.',
      timestamp: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
      source: 'Traffic Authority'
    }
  ];
  
  sampleNews.forEach(item => addNewsItem(item));
}
