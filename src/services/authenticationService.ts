import { supabase } from '@/integrations/supabase/client';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  scopes: string[];
  redirectUri: string;
  authUrl: string;
  tokenUrl: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType: string;
}

export interface AuthCredential {
  id: string;
  type: 'api_key' | 'oauth' | 'basic' | 'bearer';
  name: string;
  serviceType: string;
  data: Record<string, any>;
  isActive: boolean;
}

export class AuthenticationService {
  
  /**
   * Initiate OAuth flow for a service
   */
  async initiateOAuth(serviceType: string, config: OAuthConfig): Promise<string> {
    const state = this.generateState();
    
    // Store OAuth state and config temporarily
    sessionStorage.setItem(`oauth_state_${state}`, JSON.stringify({
      serviceType,
      config,
      timestamp: Date.now()
    }));

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      state,
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleOAuthCallback(code: string, state: string): Promise<OAuthTokens> {
    const stateData = sessionStorage.getItem(`oauth_state_${state}`);
    if (!stateData) {
      throw new Error('Invalid OAuth state');
    }

    const { config } = JSON.parse(stateData);
    sessionStorage.removeItem(`oauth_state_${state}`);

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
      tokenType: tokenData.token_type || 'Bearer',
    };
  }

  /**
   * Refresh OAuth tokens
   */
  async refreshOAuthTokens(refreshToken: string, config: OAuthConfig): Promise<OAuthTokens> {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || refreshToken,
      expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
      tokenType: tokenData.token_type || 'Bearer',
    };
  }

  /**
   * Test credential connection
   */
  async testCredential(credential: AuthCredential): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('test-credential', {
        body: {
          credential,
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: data.success, error: data.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get authentication headers for API requests
   */
  getAuthHeaders(credential: AuthCredential): Record<string, string> {
    switch (credential.type) {
      case 'api_key':
        return {
          'Authorization': `Bearer ${credential.data.apiKey}`,
        };
      case 'bearer':
        return {
          'Authorization': `Bearer ${credential.data.token}`,
        };
      case 'oauth':
        return {
          'Authorization': `${credential.data.tokenType || 'Bearer'} ${credential.data.accessToken}`,
        };
      case 'basic':
        const encoded = btoa(`${credential.data.username}:${credential.data.password}`);
        return {
          'Authorization': `Basic ${encoded}`,
        };
      default:
        return {};
    }
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export const authService = new AuthenticationService();