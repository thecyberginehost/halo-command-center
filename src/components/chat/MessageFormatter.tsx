import React from 'react';

interface MessageFormatterProps {
  content: string;
  className?: string;
}

export function MessageFormatter({ content, className = "" }: MessageFormatterProps) {
  // Safety check for undefined content
  if (!content || typeof content !== 'string') {
    return <div className={className}>No content available</div>;
  }

  const formatMessage = (text: string) => {
    // Split by double newlines to create paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, paragraphIndex) => {
      // Handle numbered lists (1. 2. 3. etc.)
      if (/^\d+\.\s/.test(paragraph.trim())) {
        const items = paragraph.split('\n').filter(line => /^\d+\.\s/.test(line.trim()));
        return (
          <ol key={paragraphIndex} className="list-decimal list-inside space-y-1 mb-3">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-sm leading-relaxed">
                {item.replace(/^\d+\.\s/, '')}
              </li>
            ))}
          </ol>
        );
      }
      
      // Handle bullet points (- or • or *)
      if (/^[-•*]\s/.test(paragraph.trim())) {
        const items = paragraph.split('\n').filter(line => /^[-•*]\s/.test(line.trim()));
        return (
          <ul key={paragraphIndex} className="list-disc list-inside space-y-1 mb-3">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-sm leading-relaxed">
                {item.replace(/^[-•*]\s/, '')}
              </li>
            ))}
          </ul>
        );
      }
      
      // Handle code blocks (```code```)
      if (paragraph.includes('```')) {
        const parts = paragraph.split('```');
        return (
          <div key={paragraphIndex} className="mb-3">
            {parts.map((part, partIndex) => {
              if (partIndex % 2 === 1) {
                // This is code
                return (
                  <pre key={partIndex} className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto my-2">
                    <code>{part.trim()}</code>
                  </pre>
                );
              } else {
                // Regular text
                return part.trim() ? (
                  <p key={partIndex} className="text-sm leading-relaxed">
                    {formatInlineElements(part.trim())}
                  </p>
                ) : null;
              }
            })}
          </div>
        );
      }
      
      // Handle regular paragraphs with line breaks
      const lines = paragraph.split('\n').filter(line => line.trim());
      if (lines.length === 0) return null;
      
      return (
        <div key={paragraphIndex} className="mb-3">
          {lines.map((line, lineIndex) => (
            <p key={lineIndex} className="text-sm leading-relaxed">
              {formatInlineElements(line)}
            </p>
          ))}
        </div>
      );
    });
  };
  
  const formatInlineElements = (text: string) => {
    // Handle bold text (**text**)
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text (*text*)
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle inline code (`code`)
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
    
    // Handle links [text](url)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
    
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {formatMessage(content)}
    </div>
  );
}