-- Create system knowledge base for Resonant Directive
CREATE TABLE public.system_knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  priority INTEGER DEFAULT 1, -- 1=highest, 5=lowest priority for AI context
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_knowledge_base ENABLE ROW LEVEL SECURITY;

-- System knowledge should be readable by everyone (it's general platform knowledge)
CREATE POLICY "System knowledge is publicly readable" 
ON public.system_knowledge_base 
FOR SELECT 
USING (true);

-- Only admins should be able to modify system knowledge (for now, allow all for setup)
CREATE POLICY "System knowledge can be managed" 
ON public.system_knowledge_base 
FOR ALL 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_system_knowledge_base_updated_at
BEFORE UPDATE ON public.system_knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert comprehensive HALO system knowledge
INSERT INTO public.system_knowledge_base (category, title, content, tags, priority) VALUES

-- HALO Platform Knowledge
('platform', 'HALO Core Capabilities', 'HALO is an enterprise-grade automation platform designed for MASP (Managed Automation Service Provider) certified professionals. Core features include: AI-powered workflow generation using o3 reasoning, multi-tenant architecture for managing multiple clients, real-time workflow monitoring and analytics, comprehensive integration ecosystem, visual workflow builder, execution history and logging, role-based access control, white-label capabilities for MASP branding, SOC2 and HIPAA compliance ready, both SaaS and self-hosted deployment options.', '{"platform", "core", "features"}', 1),

('platform', 'Multi-Tenant Architecture', 'HALO uses database-level isolation for enterprise compliance. Each MASP provider manages multiple client accounts with complete data separation. Features include tenant-specific workflow isolation, custom branding and white-labeling, separate billing and usage tracking, individual compliance settings, isolated knowledge bases per tenant.', '{"architecture", "multi-tenant", "security"}', 1),

('platform', 'Integration Ecosystem', 'HALO supports extensive integrations including Email (SMTP, SendGrid, Mailgun), Communication (Slack, Microsoft Teams), CRM (Salesforce, HubSpot, Pipedrive), Databases (PostgreSQL, MySQL, MongoDB), File Storage (AWS S3, Google Drive, Dropbox), APIs (REST, GraphQL, Webhooks), AI Services (OpenAI, Anthropic, custom models), Payment (Stripe, PayPal), Marketing (Mailchimp, Constant Contact).', '{"integrations", "apis", "connectors"}', 1),

-- MASP Program Knowledge  
('masp', 'MASP Certification Program', 'MASP (Managed Automation Service Provider) is a professional certification program for automation specialists. MASP-certified providers are trained to implement enterprise-grade automation solutions. Certification levels include Foundation (basic automation concepts), Professional (advanced workflow design), Expert (enterprise architecture). Training available at maspcertified.com. HALO is exclusively designed for MASP-certified professionals.', '{"masp", "certification", "training"}', 1),

('masp', 'MASP Provider Business Model', 'MASP providers serve enterprise clients by implementing automation solutions. Revenue model includes licensing fees from MASP providers, per-client usage fees, professional services for complex implementations. HALO enables providers to manage multiple client accounts, track billable automation usage, generate client reports, provide white-labeled solutions.', '{"business", "revenue", "clients"}', 2),

-- Automation Best Practices
('automation', 'Workflow Design Patterns', 'Best practices for enterprise workflows: Always start with proper triggers (webhook, schedule, email, form submission), implement error handling and retry logic, use conditions for business logic branching, include logging and monitoring steps, design for scalability and parallel processing, implement data validation and transformation, plan for maintenance and updates.', '{"patterns", "best-practices", "design"}', 1),

('automation', 'Common Workflow Types', 'Frequently implemented automation patterns: Customer onboarding (form submission -> CRM -> email sequence), Lead qualification (form data -> scoring -> routing), Invoice processing (email attachment -> data extraction -> approval -> payment), Support ticket routing (email -> classification -> assignment), Marketing automation (trigger -> segmentation -> personalized outreach).', '{"workflows", "examples", "patterns"}', 2),

('automation', 'Performance Optimization', 'Workflow optimization strategies: Use parallel processing for independent tasks, implement caching for frequently accessed data, optimize database queries and API calls, set appropriate timeout values, use conditional logic to avoid unnecessary steps, implement proper retry policies, monitor execution times and optimize bottlenecks.', '{"performance", "optimization", "monitoring"}', 2),

-- Troubleshooting Knowledge
('troubleshooting', 'Common Issues', 'Frequent workflow problems and solutions: Authentication failures (check API keys and permissions), Timeout errors (increase timeout values or optimize steps), Data format mismatches (add transformation steps), Rate limiting (implement delays and retry logic), Integration failures (verify endpoint availability), Execution loops (check conditional logic).', '{"troubleshooting", "errors", "solutions"}', 1),

('troubleshooting', 'Monitoring and Alerts', 'Effective monitoring setup: Track workflow success/failure rates, monitor execution times and identify slowdowns, set up alerts for critical failures, log detailed step information for debugging, implement health checks for integrations, create dashboards for client reporting.', '{"monitoring", "alerts", "debugging"}', 2),

-- Industry-Specific Knowledge
('industry', 'Healthcare Automation', 'Healthcare automation considerations: HIPAA compliance requirements, patient data protection, appointment scheduling workflows, insurance verification processes, medical record management, prescription processing automation, patient communication workflows.', '{"healthcare", "hipaa", "compliance"}', 3),

('industry', 'Financial Services', 'Financial automation patterns: KYC (Know Your Customer) workflows, transaction monitoring, compliance reporting, loan processing automation, invoice and payment processing, fraud detection workflows, regulatory compliance automation.', '{"finance", "compliance", "transactions"}', 3),

('industry', 'E-commerce', 'E-commerce automation workflows: Order processing and fulfillment, inventory management, customer service automation, returns processing, marketing automation, abandoned cart recovery, supplier communication.', '{"ecommerce", "orders", "customers"}', 3);