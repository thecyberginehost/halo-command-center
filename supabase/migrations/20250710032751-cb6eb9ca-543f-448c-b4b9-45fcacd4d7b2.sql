-- Add enterprise feature columns to tenants table
ALTER TABLE public.tenants 
ADD COLUMN masp_provider_data JSONB DEFAULT NULL,
ADD COLUMN white_label_config JSONB DEFAULT NULL;

-- Add indexes for better performance on enterprise features
CREATE INDEX idx_tenants_masp_provider ON public.tenants USING GIN(masp_provider_data);
CREATE INDEX idx_tenants_white_label ON public.tenants USING GIN(white_label_config);

-- Add comments for documentation
COMMENT ON COLUMN public.tenants.masp_provider_data IS 'MASP certification and provider information';
COMMENT ON COLUMN public.tenants.white_label_config IS 'White label branding and configuration settings';