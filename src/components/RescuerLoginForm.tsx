import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { rescuerLoginSchema, RescuerLoginData } from '@/lib/validators';
import { loginRescuer } from '@/lib/rescuerAuth';

interface RescuerLoginFormProps {
  onLoginSuccess: () => void;
}

export function RescuerLoginForm({ onLoginSuccess }: RescuerLoginFormProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RescuerLoginData>({
    resolver: zodResolver(rescuerLoginSchema)
  });

  const onSubmit = async (data: RescuerLoginData) => {
    setIsLoggingIn(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = loginRescuer(data.email, data.password);

      if (result.ok) {
        toast({
          title: "Login successful",
          description: `Welcome, ${result.session?.name}!`
        });
        onLoginSuccess();
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-rescuer">
        <Users className="w-5 h-5" />
        <h2 className="text-xl font-bold">Rescuer Login</h2>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Emergency responder access only. Enter your credentials to access the Rescuer Portal.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-semibold">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register('email')}
            className={errors.email ? 'border-emergency-red' : ''}
          />
          {errors.email && (
            <p className="text-sm text-emergency-red">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="font-semibold">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register('password')}
            className={errors.password ? 'border-emergency-red' : ''}
          />
          {errors.password && (
            <p className="text-sm text-emergency-red">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="rescuer"
          disabled={isLoggingIn}
          className="w-full"
        >
          {isLoggingIn ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          Login as Rescuer
        </Button>
      </form>
    </div>
  );
}
