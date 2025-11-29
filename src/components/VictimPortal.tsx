import { useState } from 'react';
import { AlertTriangle, Search, Newspaper, Users } from 'lucide-react';
import { EmergencyHeader } from './EmergencyHeader';
import { SOSForm } from './SOSForm';
import { RumourVerification } from './RumourVerification';
import { LiveNewsFeed } from './LiveNewsFeed';
import { RescuerLoginForm } from './RescuerLoginForm';
import { SOSRequest } from '@/lib/sosStore';
import { cn } from '@/lib/utils';

type Tab = 'sos' | 'rumour' | 'news' | 'rescuer';

interface VictimPortalProps {
  onRescuerLogin: () => void;
}

export function VictimPortal({ onRescuerLogin }: VictimPortalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('sos');
  const [lastSubmission, setLastSubmission] = useState<SOSRequest | null>(null);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'sos', label: 'Send SOS', icon: AlertTriangle },
    { id: 'rumour', label: 'Verify a Rumour', icon: Search },
    { id: 'news', label: 'Live News', icon: Newspaper },
    { id: 'rescuer', label: 'Login as Rescuer', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-background">
      <EmergencyHeader />

      {/* Tabs */}
      <nav className="bg-card border-b">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isRescuer = tab.id === 'rescuer';
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold transition-all border-b-2',
                    isActive && !isRescuer
                      ? 'text-emergency-red border-emergency-red bg-emergency-red-light'
                      : isActive && isRescuer
                      ? 'text-rescuer border-rescuer bg-emergency-blue-light'
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-card rounded-lg p-6 card-shadow">
          {activeTab === 'sos' && (
            <SOSForm onSubmitSuccess={setLastSubmission} />
          )}
          {activeTab === 'rumour' && <RumourVerification />}
          {activeTab === 'news' && <LiveNewsFeed />}
          {activeTab === 'rescuer' && <RescuerLoginForm onLoginSuccess={onRescuerLogin} />}
        </div>

        {/* Last submission confirmation */}
        {lastSubmission && activeTab === 'sos' && (
          <div className="mt-4 p-4 bg-emergency-green-light border-l-4 border-emergency-green rounded-lg animate-fade-in">
            <h3 className="font-bold text-emergency-green mb-2">
              SOS Submitted Successfully!
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              ID: {lastSubmission.sos_id} • Priority: {lastSubmission.priority.tag}
            </p>
            <div className="text-sm bg-card/50 p-2 rounded whitespace-pre-line">
              {lastSubmission.reason_explanation}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
