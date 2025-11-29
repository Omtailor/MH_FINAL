import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { rumourSchema, RumourFormData } from '@/lib/validators';
import { verifyRumour, RumourResult } from '@/lib/rumourVerification';

export function RumourVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<RumourResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RumourFormData>({
    resolver: zodResolver(rumourSchema)
  });

  const onSubmit = async (data: RumourFormData) => {
    setIsVerifying(true);
    setResult(null);

    try {
      const verificationResult = await verifyRumour(data.rumourText, data.source);
      setResult(verificationResult);
    } catch (error) {
      setResult({
        ok: false,
        rumour: data.rumourText,
        verdict: 'fake',
        confidence: 0,
        evidence: [],
        reason: 'An error occurred during verification.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'real':
        return <CheckCircle className="w-6 h-6 text-emergency-green" />;
      case 'fake':
      default:
        return <XCircle className="w-6 h-6 text-emergency-red" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'real':
        return 'bg-emergency-green-light border-emergency-green text-emergency-green';
      case 'fake':
      default:
        return 'bg-emergency-red-light border-emergency-red text-emergency-red';
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-emergency-red">
        <Search className="w-5 h-5" />
        <h2 className="text-xl font-bold">Verify a Rumour</h2>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Submit information you've heard to have it verified by our team.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rumourText" className="font-semibold">
            Rumour to Verify <span className="text-emergency-red">*</span>
          </Label>
          <Textarea
            id="rumourText"
            placeholder="Enter the rumour or information you want verified"
            rows={4}
            {...register('rumourText')}
            className={errors.rumourText ? 'border-emergency-red' : ''}
          />
          {errors.rumourText && (
            <p className="text-sm text-emergency-red">{errors.rumourText.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="source" className="font-semibold">
            Source (optional)
          </Label>
          <Input
            id="source"
            placeholder="Where did you hear this?"
            {...register('source')}
          />
        </div>

        <Button
          type="submit"
          variant="emergency"
          disabled={isVerifying}
          className="w-full md:w-auto"
        >
          {isVerifying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Verify Rumour
        </Button>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-lg border-2 ${getVerdictColor(result.verdict)} animate-fade-in`}>
          <div className="flex items-center gap-3 mb-3">
            {getVerdictIcon(result.verdict)}
            <div>
              <h3 className="font-bold text-lg capitalize">
                Verdict: {result.verdict === 'real' ? 'Real / Verified' : 'Fake / Misinformation'}
              </h3>
              <p className="text-sm opacity-80">Confidence: {Math.round(result.confidence * 100)}%</p>
            </div>
          </div>

          <p className="text-sm mb-4">{result.reason}</p>

          {result.evidence.length > 0 && (
            <div className="space-y-2">
              <p className="font-semibold text-sm">Sources:</p>
              {result.evidence.map((ev, idx) => (
                <div key={idx} className="bg-card/50 p-2 rounded text-sm">
                  <p className="font-medium">{ev.title}</p>
                  <p className="text-xs opacity-70">{ev.source}</p>
                  <p className="mt-1">{ev.snippet}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
