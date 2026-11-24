'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

const quickPrompts = ['What is LULS?', 'How do I register?', 'Which languages can I explore?'];
const whatsappGroupUrl = 'https://chat.whatsapp.com/GQmAeNvM95P2ht4HOsjzke?s=cl&p=a&iam=2';
const welcome = 'Hello. I’m LULS AI. Ask me about joining the community, languages, registration, payment, account lookup, WhatsApp, or the Thomson Falls retreat.';

function MessageText({ content }: { content: string }) {
  const parts = content.split(/(https?:\/\/\S+)/g);
  return <>{parts.map((part, index) => part.startsWith('http') ? <a href={part.replace(/[.,]$/, '')} target="_blank" rel="noreferrer" key={`${part}-${index}`}>{part}</a> : <span key={`${part}-${index}`}>{part}</span>)}</>;
}

export function LulsAiChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: welcome }]);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  function resetChat() { setMessages([{ role: 'assistant', content: welcome }]); setInput(''); }

  async function sendMessage(event?: FormEvent, prompt?: string) {
    event?.preventDefault();
    const content = (prompt ?? input).trim();
    if (!content || loading) return;
    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next.slice(-12) }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'LULS AI is temporarily unavailable.');
      setMessages((current) => [...current, { role: 'assistant', content: body.message || 'Please try asking that another way.' }]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: `${error instanceof Error ? error.message : 'I could not connect right now.'} You can try again or use one of the suggestions below.` }]);
    } finally {
      setLoading(false);
    }
  }

  return <>
    <button className="luls-ai-launcher" type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close LULS AI chat' : 'Open LULS AI chat'} aria-expanded={open}>
      <span className="luls-ai-launcher-icon">{open ? '×' : '✦'}</span><span className="luls-ai-launcher-label">LULS AI</span>
    </button>
    {open && <section className="luls-ai-room" aria-label="LULS AI chatroom">
      <header className="luls-ai-header"><div><span className="luls-ai-kicker">LULS COMMUNITY ASSISTANT</span><strong>LULS AI</strong><small>Research · Share · Learn</small></div><div className="luls-ai-header-actions"><button type="button" onClick={resetChat}>New chat</button><button type="button" onClick={() => setOpen(false)} aria-label="Close chat">×</button></div></header>
      <div className="luls-ai-messages" aria-live="polite">
        {messages.map((message, index) => <div className={`luls-ai-message ${message.role}`} key={`${message.role}-${index}`}><span><MessageText content={message.content} /></span></div>)}
        {loading && <div className="luls-ai-message assistant"><span className="luls-ai-typing">Thinking…</span></div>}
        <div ref={messagesEnd} />
      </div>
      <div className="luls-ai-quick"><span className="luls-ai-suggestions-label">Suggestions</span>{quickPrompts.map((prompt) => <button type="button" key={prompt} onClick={() => void sendMessage(undefined, prompt)} disabled={loading}>{prompt}</button>)}<a href={whatsappGroupUrl} target="_blank" rel="noreferrer">Join WhatsApp group ↗</a></div>
      <form className="luls-ai-form" onSubmit={sendMessage}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask LULS AI…" maxLength={500} aria-label="Ask LULS AI" /><button type="submit" disabled={loading || !input.trim()} aria-label="Send message">↗</button></form>
      <div className="luls-ai-footer"><small className="luls-ai-disclaimer">LULS AI shares general community information. Confirm payment and event details on the official portal.</small><button type="button" className="luls-ai-reset" onClick={resetChat}>Start over</button></div>
    </section>}
  </>;
}
