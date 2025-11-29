import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  tag: 'Critical' | 'High' | 'Medium' | 'Low' | 'Minimal';
  score?: number;
  className?: string;
}

export function PriorityBadge({ tag, score, className }: PriorityBadgeProps) {
  const getColors = () => {
    switch (tag) {
      case 'Critical':
        return 'bg-emergency-red text-primary-foreground';
      case 'High':
        return 'bg-emergency-orange text-primary-foreground';
      case 'Medium':
        return 'bg-emergency-yellow text-primary-foreground';
      case 'Low':
        return 'bg-emergency-green text-primary-foreground';
      case 'Minimal':
        return 'bg-emergency-blue text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
      getColors(),
      className
    )}>
      {tag}
      {score !== undefined && (
        <span className="opacity-80">({(score * 100).toFixed(0)}%)</span>
      )}
    </span>
  );
}
