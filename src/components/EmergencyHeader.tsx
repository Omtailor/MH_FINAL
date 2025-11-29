import { Shield } from 'lucide-react';

export function EmergencyHeader() {
  return (
    <header className="emergency-header py-6 px-4 text-center">
      <div className="flex items-center justify-center gap-3">
        <Shield className="w-10 h-10 text-primary-foreground" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
            Emergency Assistance Portal
          </h1>
          <p className="text-primary-foreground/90 text-sm mt-1">
            Immediate help when you need it most
          </p>
        </div>
      </div>
    </header>
  );
}
