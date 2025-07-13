import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { CredentialsService } from '@/services/credentialsService';
import { authService } from '@/services/authenticationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const credentialsService = new CredentialsService();

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing OAuth callback...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state');
        }

        // Get stored OAuth data from sessionStorage
        const stateData = sessionStorage.getItem(`oauth_state_${state}`);
        if (!stateData) {
          throw new Error('Invalid OAuth state - session may have expired');
        }

        const { serviceType, config, credentialName } = JSON.parse(stateData);
        
        // Exchange code for tokens
        const tokens = await authService.handleOAuthCallback(code, state);
        
        // Store credential in database
        if (!currentTenant) {
          throw new Error('No tenant selected');
        }

        await credentialsService.createCredential(currentTenant.id, {
          name: credentialName || `${serviceType} OAuth Connection`,
          service_type: serviceType,
          auth_type: 'oauth',
          credentials: {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            token_type: tokens.tokenType,
            expires_at: tokens.expiresAt?.toISOString(),
          }
        });

        setStatus('success');
        setMessage('OAuth connection successful! Redirecting to credentials page...');
        
        toast({
          title: "Success",
          description: "OAuth credential created successfully"
        });

        // Redirect to credentials page after success
        setTimeout(() => {
          navigate('/credentials');
        }, 2000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'OAuth connection failed');
        
        toast({
          title: "OAuth Error",
          description: error.message || 'Failed to complete OAuth flow',
          variant: "destructive"
        });
      }
    };

    handleCallback();
  }, [searchParams, currentTenant, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-destructive" />}
            OAuth Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">{message}</p>
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/credentials')} 
                className="w-full"
                variant="outline"
              >
                Return to Credentials
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}