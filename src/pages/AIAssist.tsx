import { useState } from 'react';
import Layout from '@/components/Layout';
import { ResonantDirectiveChat } from '@/components/automation/ResonantDirectiveChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Lightbulb, Zap, Target, Code, Users, Shield } from 'lucide-react';
import { useChatState } from '@/hooks/useChatState';

export default function AIAssist() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { messages, inputValue, setInputValue, handleSendMessage } = useChatState();

  // Convert messages to ResonantDirectiveChat format
  const chatMessages = messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text
  }));

  const onSendMessage = () => {
    handleSendMessage();
  };

  const capabilities = [
    {
      icon: Lightbulb,
      title: "Workflow Generation",
      description: "Generate complete automation workflows from natural language descriptions. Just describe what you want to automate, and I'll build it for you."
    },
    {
      icon: Code,
      title: "Technical Implementation", 
      description: "Get help with integrations, API configurations, error handling, and advanced workflow logic for complex automation scenarios."
    },
    {
      icon: Target,
      title: "Optimization & Analysis",
      description: "Analyze existing workflows for performance improvements, suggest better approaches, and identify potential bottlenecks."
    },
    {
      icon: Zap,
      title: "Troubleshooting",
      description: "Debug workflow issues, resolve integration problems, and get step-by-step solutions for automation challenges."
    },
    {
      icon: Users,
      title: "MASP Best Practices",
      description: "Guidance on enterprise-grade automation patterns, client management workflows, and professional service delivery."
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Ensure your automations meet enterprise security standards, implement proper error handling, and maintain audit trails."
    }
  ];

  return (
    <Layout>
      <div className="flex h-full">
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6">
            {!isChatOpen ? (
              <>
                {/* Hero Section */}
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-halo-primary to-halo-accent rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-halo-text mb-4">
                    Meet Resonant Directive
                  </h1>
                  <p className="text-xl text-halo-textSecondary mb-6 max-w-3xl mx-auto">
                    Your AI automation architect for HALO. I specialize in building enterprise-grade workflows, 
                    optimizing automation strategies, and helping MASP-certified providers deliver exceptional results.
                  </p>
                  <Button 
                    onClick={() => setIsChatOpen(true)}
                    size="lg"
                    className="bg-halo-primary hover:bg-halo-primary/90 text-white px-8 py-3"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Start Conversation
                  </Button>
                </div>

                {/* Capabilities Grid */}
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold text-halo-text mb-8 text-center">
                    What I Can Help You With
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {capabilities.map((capability, index) => (
                      <Card key={index} className="border-halo-border hover:border-halo-primary/50 transition-colors">
                        <CardHeader>
                          <div className="w-12 h-12 bg-halo-primary/10 rounded-lg flex items-center justify-center mb-4">
                            <capability.icon className="w-6 h-6 text-halo-primary" />
                          </div>
                          <CardTitle className="text-halo-text">{capability.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-halo-textSecondary">
                            {capability.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Example Prompts */}
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold text-halo-text mb-6 text-center">
                    Try These Example Prompts
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {[
                      "Build a workflow that processes customer support tickets and routes them to the right team",
                      "Create an automation that syncs new leads from our website to our CRM and sends a welcome email",
                      "Help me optimize this workflow for better performance and error handling",
                      "Design a client onboarding automation for our MASP practice"
                    ].map((prompt, index) => (
                      <Card 
                        key={index} 
                        className="cursor-pointer border-halo-border hover:border-halo-primary hover:shadow-md transition-all"
                        onClick={() => {
                          setInputValue(prompt);
                          setIsChatOpen(true);
                        }}
                      >
                        <CardContent className="p-4">
                          <p className="text-halo-textSecondary text-sm">"{prompt}"</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* CTA Section */}
                <div className="text-center bg-gradient-to-r from-halo-primary/5 to-halo-accent/5 rounded-lg p-8">
                  <h3 className="text-xl font-semibold text-halo-text mb-4">
                    Ready to Build Something Amazing?
                  </h3>
                  <p className="text-halo-textSecondary mb-6">
                    I'm here to help you create powerful automations that drive real business value.
                  </p>
                  <Button 
                    onClick={() => setIsChatOpen(true)}
                    size="lg"
                    className="bg-halo-primary hover:bg-halo-primary/90 text-white"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Let's Get Started
                  </Button>
                </div>
              </>
            ) : (
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-halo-text mb-2">Resonant Directive</h1>
                    <p className="text-halo-textSecondary">
                      Your AI automation architect - ready to help you build powerful workflows.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsChatOpen(false)}
                    className="border-halo-border hover:bg-halo-primary/10"
                  >
                    Back to Overview
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <ResonantDirectiveChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          chatMessages={chatMessages}
          chatInput={inputValue}
          setChatInput={setInputValue}
          onSendMessage={onSendMessage}
        />
      </div>
    </Layout>
  );
}