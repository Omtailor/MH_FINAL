import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIExplanationProps {
  explanation: string;
  className?: string;
}

export function AIExplanation({ explanation, className }: AIExplanationProps) {
  // Parse the explanation to highlight parts
  const lines = explanation.split('\n');
  const header = lines[0];
  const reasons = lines.slice(1);

  return (
    <div className={cn(
      'bg-muted/50 rounded-lg p-3 border border-border',
      className
    )}>
      <div className="flex items-start gap-2">
        <Bot className="w-4 h-4 text-emergency-blue mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-foreground">{header}</p>
          <ul className="mt-1 space-y-0.5">
            {reasons.map((reason, idx) => (
              <li key={idx} className="text-muted-foreground">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
