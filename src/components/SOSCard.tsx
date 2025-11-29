import { useState } from 'react';
import { MapPin, Phone, Clock, User, CheckCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { AIExplanation } from './AIExplanation';
import { SOSRequest, acceptSOSRequest, resolveSOSRequest } from '@/lib/sosStore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SOSCardProps {
  request: SOSRequest;
  rescuerId: string;
  onUpdate: () => void;
}

export function SOSCard({ request, rescuerId, onUpdate }: SOSCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = acceptSOSRequest(request.sos_id, rescuerId);
    
    if (result.ok) {
      toast({
        title: "Request Accepted",
        description: `ETA: ${Math.ceil((result.eta_seconds || 0) / 60)} minutes`
      });
      onUpdate();
    } else {
      toast({
        title: "Could not accept",
        description: "This request may have been taken by another rescuer.",
        variant: "destructive"
      });
    }
    
    setIsAccepting(false);
  };

  const handleResolve = async () => {
    setIsResolving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    resolveSOSRequest(request.sos_id);
    toast({
      title: "Request Resolved",
      description: "Great work! The victim has been assisted."
    });
    onUpdate();
    
    setIsResolving(false);
  };

  const getPriorityClass = () => {
    switch (request.priority.tag) {
      case 'Critical':
        return 'priority-critical';
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      default:
        return 'priority-low';
    }
  };

  return (
    <div className={cn(
      'rounded-lg p-4 card-shadow animate-fade-in',
      getPriorityClass()
    )}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge tag={request.priority.tag} score={request.priority.score} />
          <CategoryBadge category={request.category} />
          {request.priority.human_review_required && (
            <span className="text-xs bg-emergency-yellow/20 text-amber-700 px-2 py-0.5 rounded font-medium">
              ⚠️ Review Required
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {request.sos_id}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold">{request.name}</span>
          <span className="text-muted-foreground">• Age {request.age}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span>{request.phone}</span>
        </div>

        {request.location.lat && request.location.lng && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-xs">
              {request.location.lat.toFixed(4)}, {request.location.lng.toFixed(4)}
            </span>
            <span className="text-muted-foreground text-xs">
              (LA: {request.location.LA.toFixed(2)})
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>

      <p className="text-sm bg-card/50 p-2 rounded mb-3">
        {request.description}
      </p>

      <AIExplanation explanation={request.reason_explanation} className="mb-3" />

      <div className="flex gap-2">
        {request.status === 'pending' && (
          <Button
            variant="rescuer"
            size="sm"
            onClick={handleAccept}
            disabled={isAccepting}
          >
            {isAccepting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Accept
          </Button>
        )}
        
        {request.status === 'accepted' && request.rescuer_id === rescuerId && (
          <>
            <Button
              variant="success"
              size="sm"
              onClick={handleResolve}
              disabled={isResolving}
            >
              {isResolving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Mark Resolved
            </Button>
            {request.eta_seconds && (
              <span className="text-sm text-muted-foreground flex items-center">
                ETA: {Math.ceil(request.eta_seconds / 60)} min
              </span>
            )}
          </>
        )}
        
        {request.status === 'accepted' && request.rescuer_id !== rescuerId && (
          <span className="text-sm text-muted-foreground">
            Assigned to another rescuer
          </span>
        )}
      </div>
    </div>
  );
}
