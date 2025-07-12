-- Update all marketplace packages to be free
UPDATE public.marketplace_packages 
SET 
  pricing_model = 'free',
  price_per_month = NULL
WHERE id IN (
  SELECT id FROM public.marketplace_packages
);