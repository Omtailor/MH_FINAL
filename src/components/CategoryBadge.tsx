import { cn } from '@/lib/utils';
import { Stethoscope, Utensils, Home, AlertTriangle, HelpCircle } from 'lucide-react';
import { Category } from '@/lib/priorityEngine';

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

const categoryConfig: Record<Category, { icon: React.ElementType; bg: string; text: string }> = {
  Medical: { icon: Stethoscope, bg: 'bg-red-100', text: 'text-red-700' },
  Food: { icon: Utensils, bg: 'bg-orange-100', text: 'text-orange-700' },
  Shelter: { icon: Home, bg: 'bg-blue-100', text: 'text-blue-700' },
  Trapped: { icon: AlertTriangle, bg: 'bg-purple-100', text: 'text-purple-700' },
  Others: { icon: HelpCircle, bg: 'bg-gray-100', text: 'text-gray-700' }
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category] || categoryConfig.Others;
  const Icon = config.icon;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold',
      config.bg,
      config.text,
      className
    )}>
      <Icon className="w-3.5 h-3.5" />
      {category}
    </span>
  );
}
