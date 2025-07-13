import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { serviceType, tenantId, credentialName } = await req.json();

    if (!serviceType || !tenantId) {
      return new Response(
        JSON.stringify({ error: 'Missing serviceType or tenantId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OAuth config for service
    const { data: oauthConfig, error: configError } = await supabase
      .from('oauth_configs')
      .select('*')
      .eq('service_id', serviceType)
      .eq('is_active', true)
      .single();

    if (configError || !oauthConfig) {
      return new Response(
        JSON.stringify({ error: `OAuth not configured for ${serviceType}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate OAuth URLs based on service type
    const getOAuthUrls = (serviceType: string) => {
      switch (serviceType) {
        case 'hubspot':
          return {
            authUrl: 'https://app.hubspot.com/oauth/authorize',
            tokenUrl: 'https://api.hubapi.com/oauth/v1/token'
          };
        case 'salesforce':
          return {
            authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
            tokenUrl: 'https://login.salesforce.com/services/oauth2/token'
          };
        case 'gmail':
          return {
            authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token'
          };
        case 'slack':
          return {
            authUrl: 'https://slack.com/oauth/v2/authorize',
            tokenUrl: 'https://slack.com/api/oauth.v2.access'
          };
        default:
          throw new Error(`Unsupported service type: ${serviceType}`);
      }
    };

    const { authUrl, tokenUrl } = getOAuthUrls(serviceType);

    // Generate state and store OAuth session data
    const state = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await supabase
      .from('oauth_states')
      .insert({
        state,
        service_id: serviceType,
        tenant_id: tenantId,
        expires_at: expiresAt.toISOString()
      });

    // Build authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: oauthConfig.client_id,
      redirect_uri: oauthConfig.redirect_uri,
      scope: oauthConfig.scopes.join(' '),
      state,
    });

    // Add service-specific parameters
    if (serviceType === 'gmail') {
      params.append('access_type', 'offline');
      params.append('prompt', 'consent');
    }

    const authorizationUrl = `${authUrl}?${params.toString()}`;

    return new Response(
      JSON.stringify({ 
        authorizationUrl,
        state,
        config: {
          clientId: oauthConfig.client_id,
          clientSecret: oauthConfig.client_secret,
          redirectUri: oauthConfig.redirect_uri,
          scopes: oauthConfig.scopes,
          authUrl,
          tokenUrl
        },
        credentialName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in oauth-initiate function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});