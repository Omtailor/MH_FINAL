import { useState, useEffect } from 'react';
import { VictimPortal } from '@/components/VictimPortal';
import { RescuerDashboard } from '@/components/RescuerDashboard';
import { isLoggedIn } from '@/lib/rescuerAuth';

const Index = () => {
  const [isRescuer, setIsRescuer] = useState(false);

  useEffect(() => {
    setIsRescuer(isLoggedIn());
  }, []);

  const handleRescuerLogin = () => {
    setIsRescuer(true);
  };

  const handleRescuerLogout = () => {
    setIsRescuer(false);
  };

  if (isRescuer) {
    return <RescuerDashboard onLogout={handleRescuerLogout} />;
  }

  return <VictimPortal onRescuerLogin={handleRescuerLogin} />;
};

export default Index;
