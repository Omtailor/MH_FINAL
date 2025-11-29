import { useState, useEffect } from 'react';
import { Rocket, RefreshCw, Trash2, User, LogOut, Clock, CheckCircle, Inbox, Search, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SOSCard } from './SOSCard';
import { getPendingRequests, getResolvedRequests, resetRequests, clearAllRequests, SOSRequest } from '@/lib/sosStore';
import { getCurrentSession, logoutRescuer, RescuerSession } from '@/lib/rescuerAuth';
import { Category } from '@/lib/priorityEngine';
import { cn } from '@/lib/utils';

interface RescuerDashboardProps {
  onLogout: () => void;
}

const categories: (Category | 'All')[] = ['All', 'Medical', 'Food', 'Shelter', 'Trapped', 'Others'];

export function RescuerDashboard({ onLogout }: RescuerDashboardProps) {
  const [session, setSession] = useState<RescuerSession | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [pendingRequests, setPendingRequests] = useState<SOSRequest[]>([]);
  const [resolvedRequests, setResolvedRequests] = useState<SOSRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSession(getCurrentSession());
    refreshData();
  }, []);

  const refreshData = () => {
    const category = selectedCategory === 'All' ? undefined : selectedCategory;
    setPendingRequests(getPendingRequests(category));
    setResolvedRequests(getResolvedRequests());
  };

  useEffect(() => {
    refreshData();
  }, [selectedCategory]);

  const handleLogout = () => {
    logoutRescuer();
    onLogout();
  };

  const handleReset = () => {
    resetRequests();
    refreshData();
  };

  const handleClearAll = () => {
    clearAllRequests();
    refreshData();
  };

  const filteredPending = pendingRequests.filter(req => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      req.name.toLowerCase().includes(query) ||
      req.description.toLowerCase().includes(query) ||
      req.phone.includes(query)
    );
  });

  const totalRequests = pendingRequests.length + resolvedRequests.length;

  return (
    <div className="min-h-screen bg-emergency-blue-light">
      {/* Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Rocket className="w-6 h-6 text-rescuer" />
              <h1 className="text-xl font-bold text-rescuer">Rescuer Portal</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats bar */}
        <div className="bg-card rounded-lg p-4 card-shadow flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-rescuer">{totalRequests}</span>
            <span className="text-muted-foreground">Total Requests</span>
          </div>
          <div className="flex gap-2">
            <Button variant="rescuer" size="sm" onClick={handleReset}>
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-card rounded-lg p-4 card-shadow">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="rescuer">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'rescuer' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                selectedCategory === cat && 'shadow-md'
              )}
            >
              {cat === 'All' && <Inbox className="w-4 h-4" />}
              {cat}
            </Button>
          ))}
        </div>

        {/* Pending Requests */}
        <section className="bg-card rounded-lg p-4 card-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-rescuer" />
            <h2 className="text-lg font-bold text-rescuer">Pending Requests</h2>
            <span className="bg-emergency-blue text-secondary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Bot className="w-3 h-3" />
              Agentic AI - Sorted by Priority
            </span>
          </div>

          {filteredPending.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-semibold">No pending requests</p>
              <p className="text-sm">When new SOS requests come in, they will appear here sorted by priority using our AI system.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPending.map((request) => (
                <SOSCard
                  key={request.sos_id}
                  request={request}
                  rescuerId={session?.rescuer_id || ''}
                  onUpdate={refreshData}
                />
              ))}
            </div>
          )}
        </section>

        {/* Resolved Requests */}
        <section className="bg-card rounded-lg p-4 card-shadow">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-emergency-green" />
            <h2 className="text-lg font-bold text-emergency-green">Resolved Requests</h2>
          </div>

          {resolvedRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-semibold">No resolved requests yet</p>
              <p className="text-sm">Requests that have been resolved will appear here for your reference.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {resolvedRequests.map((request) => (
                <SOSCard
                  key={request.sos_id}
                  request={request}
                  rescuerId={session?.rescuer_id || ''}
                  onUpdate={refreshData}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
