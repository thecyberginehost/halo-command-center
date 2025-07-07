import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Simple encryption using built-in crypto
async function encrypt(text: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(key.padEnd(32, '0').slice(0, 32));
  const iv = crypto.getRandomValues(new Uint8Array(16));
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-CBC' },
    false,
    ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    cryptoKey,
    enc.encode(text)
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

async function decrypt(encryptedText: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const keyData = enc.encode(key.padEnd(32, '0').slice(0, 32));
  
  const combined = new Uint8Array(atob(encryptedText).split('').map(c => c.charCodeAt(0)));
  const iv = combined.slice(0, 16);
  const encrypted = combined.slice(16);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-CBC' },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    cryptoKey,
    encrypted
  );
  
  return dec.decode(decrypted);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data, tenantId } = await req.json();
    const encryptionKey = Deno.env.get('CREDENTIAL_ENCRYPTION_KEY') || 'default-key-change-me';
    
    if (action === 'encrypt') {
      const { name, description, service_type, credentials } = data;
      
      // Encrypt the credentials
      const encryptedCredentials = await encrypt(JSON.stringify(credentials), encryptionKey);
      
      // Store in database
      const { data: result, error } = await supabase
        .from('tenant_credentials')
        .insert({
          tenant_id: tenantId,
          name,
          description,
          service_type,
          credentials: encryptedCredentials
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, data: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'decrypt') {
      const { credentialId } = data;
      
      // Get encrypted credential from database
      const { data: credential, error } = await supabase
        .from('tenant_credentials')
        .select('*')
        .eq('id', credentialId)
        .eq('tenant_id', tenantId)
        .single();
      
      if (error) throw error;
      
      // Decrypt the credentials
      const decryptedCredentials = JSON.parse(
        await decrypt(credential.credentials as string, encryptionKey)
      );
      
      return new Response(JSON.stringify({ 
        success: true, 
        data: { ...credential, credentials: decryptedCredentials }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    throw new Error('Invalid action');
    
  } catch (error) {
    console.error('Error in encrypt-credentials function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);