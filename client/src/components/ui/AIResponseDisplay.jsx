import { useState, useEffect } from 'react';
import { CheckCircle, Sparkles, Lightbulb, AlertTriangle, Code, List, ChevronRight } from 'lucide-react';

function parseAIResponse(text) {
  if (!text) return [];
  if (typeof text === 'object') {
    text = JSON.stringify(text, null, 2);
  }
  const sections = [];
  const lines = String(text).split('\n');
  let currentSection = { type: 'paragraph', content: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentSection.content.length > 0) {
        sections.push({ ...currentSection });
        currentSection = { type: 'paragraph', content: [] };
      }
      continue;
    }
    if (/^#{1,3}\s+/.test(trimmed)) {
      if (currentSection.content.length > 0) sections.push({ ...currentSection });
      const level = (trimmed.match(/^#+/) || [''])[0].length;
      sections.push({ type: 'heading', level, content: [trimmed.replace(/^#+\s*/, '')] });
      currentSection = { type: 'paragraph', content: [] };
    } else if (/^```/.test(trimmed)) {
      if (currentSection.content.length > 0) sections.push({ ...currentSection });
      if (currentSection.type === 'code') {
        currentSection = { type: 'paragraph', content: [] };
      } else {
        currentSection = { type: 'code', lang: trimmed.replace('```', ''), content: [] };
      }
    } else if (currentSection.type === 'code') {
      currentSection.content.push(line);
    } else if (/^[-*•]\s+/.test(trimmed) || /^\d+[.)]\s+/.test(trimmed)) {
      if (currentSection.type !== 'list' && currentSection.content.length > 0) {
        sections.push({ ...currentSection });
      }
      if (currentSection.type !== 'list') {
        currentSection = { type: 'list', content: [] };
      }
      currentSection.content.push(trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, ''));
    } else if (/^\*\*[^*]+\*\*:/.test(trimmed)) {
      if (currentSection.content.length > 0 && currentSection.type !== 'keyvalue') {
        sections.push({ ...currentSection });
        currentSection = { type: 'keyvalue', content: [] };
      }
      if (currentSection.type !== 'keyvalue') {
        currentSection = { type: 'keyvalue', content: [] };
      }
      currentSection.content.push(trimmed);
    } else {
      currentSection.content.push(trimmed);
    }
  }
  if (currentSection.content.length > 0) sections.push(currentSection);
  return sections;
}

function highlightText(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-accent-light font-semibold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="text-text-secondary italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-dark-surface px-1.5 py-0.5 rounded text-purple-300 text-sm font-mono">$1</code>');
}

function SectionRenderer({ section, index }) {
  const delay = `${index * 80}ms`;

  if (section.type === 'heading') {
    const sizes = { 1: 'text-xl', 2: 'text-lg', 3: 'text-base' };
    return (
      <div className="animate-fade-in flex items-center gap-2 mt-6 mb-3" style={{ animationDelay: delay }}>
        <Sparkles className="w-5 h-5 text-accent-light shrink-0" />
        <h3 className={`${sizes[section.level] || 'text-base'} font-bold text-text-primary`}>
          {section.content[0]}
        </h3>
      </div>
    );
  }

  if (section.type === 'code') {
    return (
      <div className="animate-fade-in my-3 rounded-xl overflow-hidden border border-dark-border" style={{ animationDelay: delay }}>
        {section.lang && (
          <div className="bg-dark-surface px-4 py-2 flex items-center gap-2 border-b border-dark-border">
            <Code className="w-4 h-4 text-accent-light" />
            <span className="text-xs text-text-muted uppercase">{section.lang}</span>
          </div>
        )}
        <pre className="bg-dark-bg p-4 overflow-x-auto">
          <code className="text-sm text-purple-300 font-mono">{section.content.join('\n')}</code>
        </pre>
      </div>
    );
  }

  if (section.type === 'list') {
    return (
      <div className="animate-fade-in my-3 space-y-2" style={{ animationDelay: delay }}>
        {section.content.map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-dark-surface/50 hover:bg-dark-card-hover transition-colors">
            <ChevronRight className="w-4 h-4 text-accent-light mt-0.5 shrink-0" />
            <span
              className="text-sm text-text-secondary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightText(item) }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (section.type === 'keyvalue') {
    return (
      <div className="animate-fade-in my-3 bg-dark-surface/50 rounded-xl p-4 space-y-3 border border-dark-border" style={{ animationDelay: delay }}>
        {section.content.map((item, i) => {
          const match = item.match(/\*\*([^*]+)\*\*:\s*(.*)/);
          if (match) {
            return (
              <div key={i} className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-accent-light flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5" /> {match[1]}
                </span>
                <span className="text-sm text-text-secondary pl-5.5" dangerouslySetInnerHTML={{ __html: highlightText(match[2]) }} />
              </div>
            );
          }
          return <p key={i} className="text-sm text-text-secondary" dangerouslySetInnerHTML={{ __html: highlightText(item) }} />;
        })}
      </div>
    );
  }

  return (
    <div className="animate-fade-in my-2" style={{ animationDelay: delay }}>
      {section.content.map((line, i) => (
        <p key={i} className="text-sm text-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightText(line) }} />
      ))}
    </div>
  );
}

export default function AIResponseDisplay({ response, loading }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (response) setVisible(true);
  }, [response]);

  if (loading) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-2xl p-8 animate-pulse-glow">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-accent-light animate-spin" />
          <span className="text-text-secondary">AI is thinking...</span>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-dark-surface rounded w-3/4" />
          <div className="h-4 bg-dark-surface rounded w-1/2" />
          <div className="h-4 bg-dark-surface rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!response) return null;

  const text = typeof response === 'string' ? response : (response.result || response.data || response.content || response.message || JSON.stringify(response, null, 2));
  const sections = parseAIResponse(text);

  return (
    <div className={`bg-dark-card border border-accent/20 rounded-2xl p-6 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-dark-border">
        <div className="p-1.5 bg-accent/20 rounded-lg">
          <Sparkles className="w-4 h-4 text-accent-light" />
        </div>
        <span className="text-sm font-medium text-text-primary">AI Response</span>
        <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
      </div>
      <div className="space-y-1">
        {sections.map((section, i) => (
          <SectionRenderer key={i} section={section} index={i} />
        ))}
      </div>
    </div>
  );
}
