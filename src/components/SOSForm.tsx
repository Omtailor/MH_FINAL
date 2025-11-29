import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Navigation, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { sosFormSchema, SOSFormData } from '@/lib/validators';
import { classifyCategory, calculateSeverityScores, calculatePriority, generateExplanation } from '@/lib/priorityEngine';
import { addSOSRequest, SOSRequest } from '@/lib/sosStore';

interface SOSFormProps {
  onSubmitSuccess?: (request: SOSRequest) => void;
}

export function SOSForm({ onSubmitSuccess }: SOSFormProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentTimestamp, setConsentTimestamp] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SOSFormData>({
    resolver: zodResolver(sosFormSchema)
  });

  const detectLocation = async () => {
    setIsDetectingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive"
      });
      setIsDetectingLocation(false);
      return;
    }

    // Record consent
    setConsentTimestamp(new Date().toISOString());

    // Try high accuracy first, then fallback to lower accuracy
    const tryGetLocation = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setIsDetectingLocation(false);
          toast({
            title: "Location detected",
            description: `Coordinates: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          });
        },
        (error) => {
          // If high accuracy failed, try with lower accuracy
          if (highAccuracy) {
            tryGetLocation(false);
            return;
          }
          setIsDetectingLocation(false);
          let errorMsg = "Unable to detect location. Please try again.";
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = "Location permission denied. Please enable location access.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = "Location unavailable. Please check your GPS settings.";
          } else if (error.code === error.TIMEOUT) {
            errorMsg = "Location request timed out. Please try again.";
          }
          toast({
            title: "Location error",
            description: errorMsg,
            variant: "destructive"
          });
        },
        { 
          enableHighAccuracy: highAccuracy, 
          timeout: highAccuracy ? 15000 : 30000,
          maximumAge: 60000 // Accept cached location up to 1 minute old
        }
      );
    };

    tryGetLocation(true);
  };

  const onSubmit = async (data: SOSFormData) => {
    setIsSubmitting(true);

    try {
      const age = parseInt(data.age, 10);
      const category = classifyCategory(data.description);
      const severity = calculateSeverityScores(data.description, age);
      
      // Calculate location accuracy (LA) - normalize accuracy_m to 0-1
      // Higher accuracy (lower meters) = higher LA
      const LA = location ? Math.max(0, Math.min(1, 1 - (location.accuracy / 1000))) : 0.5;
      
      const priority = calculatePriority(
        severity,
        LA,
        0.7, // Route reliability (simulated)
        false, // Route not blocked
        1, // Available resources
        0, // No waiting time yet
        0 // No fairness boost
      );

      const explanation = generateExplanation(priority, severity, data.description, age);

      const request = addSOSRequest({
        name: data.name,
        age,
        phone: data.phone.replace(/[\s\-\(\)]/g, ''),
        description: data.description,
        category,
        severity,
        priority,
        reason_explanation: explanation,
        location: {
          lat: location?.lat || null,
          lng: location?.lng || null,
          LA
        },
        consent_timestamp: consentTimestamp || undefined
      });

      toast({
        title: "SOS Sent Successfully",
        description: `Your request (${request.sos_id}) has been submitted with ${priority.tag} priority.`
      });

      onSubmitSuccess?.(request);
      reset();
      setLocation(null);
      setConsentTimestamp(null);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    reset();
    setLocation(null);
    setConsentTimestamp(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-2 text-emergency-red mb-4">
        <AlertTriangle className="w-5 h-5" />
        <h2 className="text-xl font-bold">Emergency Assistance Request</h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        All fields are required. Provide accurate information to ensure prompt assistance.
      </p>

      <div className="space-y-2">
        <Label htmlFor="name" className="font-semibold">
          Your name <span className="text-emergency-red">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Enter your full name"
          {...register('name')}
          className={errors.name ? 'border-emergency-red' : ''}
        />
        {errors.name && (
          <p className="text-sm text-emergency-red">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="age" className="font-semibold">
          Age <span className="text-emergency-red">*</span>
        </Label>
        <Input
          id="age"
          type="number"
          placeholder="Enter your age"
          {...register('age')}
          className={errors.age ? 'border-emergency-red' : ''}
        />
        {errors.age && (
          <p className="text-sm text-emergency-red">{errors.age.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="font-semibold">
          10-digit phone <span className="text-emergency-red">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Enter your 10-digit phone number"
          {...register('phone')}
          className={errors.phone ? 'border-emergency-red' : ''}
        />
        {errors.phone && (
          <p className="text-sm text-emergency-red">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="font-semibold">
          Describe your emergency... (be specific: injuries, children, elderly, etc.) <span className="text-emergency-red">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Provide detailed information about your emergency"
          rows={4}
          {...register('description')}
          className={errors.description ? 'border-emergency-red' : ''}
        />
        {errors.description && (
          <p className="text-sm text-emergency-red">{errors.description.message}</p>
        )}
      </div>

      <div className="bg-emergency-red-light p-4 rounded-lg border-l-4 border-emergency-red">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-emergency-red">Lat, Long (auto)</p>
            {location ? (
              <p className="text-sm font-mono text-emergency-red/80">
                {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° W
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Not detected</p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={detectLocation}
            disabled={isDetectingLocation}
            className="shrink-0"
          >
            {isDetectingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            Detect Location
          </Button>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="emergency"
          size="lg"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          Send SOS
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleClear}
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </Button>
      </div>
    </form>
  );
}
