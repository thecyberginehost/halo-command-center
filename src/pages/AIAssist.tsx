import { useState } from 'react';
import Layout from '@/components/Layout';
import { AncillaChat } from '@/components/automation/AncillaChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Lightbulb, Zap, Target, Code, Users, Shield } from 'lucide-react';
import { useChatState } from '@/hooks/useChatState';

export default function AIAssist() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { messages, inputValue, setInputValue, handleSendMessage } = useChatState();

  // Convert messages to AncillaChat format
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
          <div className="max-w-5xl mx-auto p-6 h-full flex flex-col justify-center">
            {!isChatOpen ? (
              <>
                {/* Hero Section */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-halo-primary to-halo-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-halo-text mb-3">
                    Meet Ancilla
                  </h1>
                  <p className="text-lg text-halo-textSecondary mb-6 max-w-2xl mx-auto">
                    Your AI automation architect for HALO. I specialize in building enterprise-grade workflows 
                    and helping MASP-certified providers deliver exceptional results.
                  </p>
                </div>

                {/* Central CTA */}
                <div className="text-center mb-8">
                  <Button 
                    onClick={() => setIsChatOpen(true)}
                    size="lg"
                    className="bg-halo-primary hover:bg-halo-primary/90 text-white px-12 py-4 text-lg"
                  >
                    <MessageSquare className="w-6 h-6 mr-3" />
                    Start Chat
                  </Button>
                </div>

                {/* Compact Capabilities */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <Card className="border-halo-border hover:border-halo-primary/50 transition-colors">
                    <CardContent className="p-4 text-center">
                      <Lightbulb className="w-8 h-8 text-halo-primary mx-auto mb-2" />
                      <h3 className="font-semibold text-halo-text mb-1">Workflow Generation</h3>
                      <p className="text-sm text-halo-textSecondary">Generate complete automations from natural language</p>
                    </CardContent>
                  </Card>

                  <Card className="border-halo-border hover:border-halo-primary/50 transition-colors">
                    <CardContent className="p-4 text-center">
                      <Target className="w-8 h-8 text-halo-primary mx-auto mb-2" />
                      <h3 className="font-semibold text-halo-text mb-1">Optimization & Analysis</h3>
                      <p className="text-sm text-halo-textSecondary">Analyze and improve existing workflows</p>
                    </CardContent>
                  </Card>

                  <Card className="border-halo-border hover:border-halo-primary/50 transition-colors">
                    <CardContent className="p-4 text-center">
                      <Users className="w-8 h-8 text-halo-primary mx-auto mb-2" />
                      <h3 className="font-semibold text-halo-text mb-1">MASP Best Practices</h3>
                      <p className="text-sm text-halo-textSecondary">Enterprise-grade automation guidance</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Examples */}
                <div className="text-center mt-6">
                  <p className="text-sm text-halo-textSecondary mb-3">Try asking me:</p>
                  <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                    {[
                      "Build a customer support workflow",
                      "Create a lead processing automation", 
                      "Help optimize my existing workflow"
                    ].map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs border-halo-border hover:bg-halo-primary/10"
                        onClick={() => {
                          setInputValue(prompt);
                          setIsChatOpen(true);
                        }}
                      >
                        "{prompt}"
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-halo-text mb-2">Ancilla</h1>
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

        <AncillaChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </div>
    </Layout>
  );
}