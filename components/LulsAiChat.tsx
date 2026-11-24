'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string; retry?: string };

const quickPrompts = ['What is LULS?', 'How do I register?', 'Thomson Falls retreat', 'Check my account', 'Get support'];
const whatsappGroupUrl = 'https://chat.whatsapp.com/GQmAeNvM95P2ht4HOsjzke?s=cl&p=a&iam=2';
const supportWhatsAppUrl = 'https://wa.me/254723617436';
const supportPhoneUrl = 'tel:+254723617436';
const welcome = 'Hello. I’m LULS AI. Ask me about joining the community, languages, registration, payment, account lookup, WhatsApp, support, or the Thomson Falls retreat.';

function MessageText({ content }: { content: string }) {
  const parts = content.split(/(https?:\/\/\S+)/g);
  return <>{parts.map((part, index) => part.startsWith('http') ? <a href={part.replace(/[.,]$/, '')} target="_blank" rel="noreferrer" key={`${part}-${index}`}>{part}</a> : part)}</>;
}

export function LulsAiChat() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: welcome }]);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages, loading]);
  useEffect(() => { if (open) window.setTimeout(() => inputRef.current?.focus(), 80); }, [open, expanded]);
  useEffect(() => { function closeOnEscape(event: KeyboardEvent) { if (event.key === 'Escape' && open) setOpen(false); } window.addEventListener('keydown', closeOnEscape); return () => window.removeEventListener('keydown', closeOnEscape); }, [open]);

  function resetChat() { setMessages([{ role: 'assistant', content: welcome }]); setInput(''); window.setTimeout(() => inputRef.current?.focus(), 50); }
  function closeChat() { setOpen(false); setExpanded(false); }

  async function sendMessage(event?: FormEvent, prompt?: string) {
    event?.preventDefault();
    const content = (prompt ?? input).trim();
    if (!content || loading) return;
    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next.slice(-12) }), signal: controller.signal });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'LULS AI is temporarily unavailable.');
      setMessages((current) => [...current, { role: 'assistant', content: body.message || 'Please try asking that another way.' }]);
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'AbortError' ? 'The response took too long.' : error instanceof Error ? error.message : 'I could not connect right now.';
      setMessages((current) => [...current, { role: 'assistant', content: `${message} You can try again or contact LULS support directly.`, retry: content }]);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  return <>
    <button className={open ? 'luls-ai-launcher luls-ai-launcher-open' : 'luls-ai-launcher'} type="button" onClick={() => open ? closeChat() : setOpen(true)} aria-label={open ? 'Close LULS AI chat' : 'Open LULS AI chat'} aria-expanded={open}>
      <span className="luls-ai-launcher-icon">{open ? '×' : '✦'}</span><span className="luls-ai-launcher-label">LULS AI</span>
    </button>
    {open && <section className={expanded ? 'luls-ai-room luls-ai-room-expanded' : 'luls-ai-room'} aria-label="LULS AI chatroom" aria-busy={loading}>
      <header className="luls-ai-header"><div><span className="luls-ai-kicker">LULS COMMUNITY ASSISTANT</span><strong>LULS AI</strong><small>Research · Share · Learn <span className="luls-ai-online"><i /> Ready</span></small></div><div className="luls-ai-header-actions"><button type="button" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? 'Use compact chat view' : 'Expand chat view'}>{expanded ? 'Compact' : 'Expand'}</button><button type="button" onClick={resetChat}>New chat</button><button type="button" onClick={closeChat} aria-label="Close chat">×</button></div></header>
      <div className="luls-ai-messages" aria-live="polite" aria-relevant="additions text">
        {messages.map((message, index) => <div className={`luls-ai-message ${message.role}`} key={`${message.role}-${index}`}><div><MessageText content={message.content} />{message.retry && <button className="luls-ai-retry" type="button" onClick={() => void sendMessage(undefined, message.retry)} disabled={loading}>Try again</button>}</div></div>)}
        {loading && <div className="luls-ai-message assistant"><div className="luls-ai-typing"><span className="luls-ai-dots" aria-hidden="true"><i /><i /><i /></span> Thinking…</div></div>}
        <div ref={messagesEnd} />
      </div>
      <div className="luls-ai-quick"><span className="luls-ai-suggestions-label">Ask about</span>{quickPrompts.map((prompt) => <button type="button" key={prompt} onClick={() => void sendMessage(undefined, prompt)} disabled={loading}>{prompt}</button>)}<a href={whatsappGroupUrl} target="_blank" rel="noreferrer">Join group ↗</a></div>
      <form className="luls-ai-form" onSubmit={sendMessage} aria-label="Send a message to LULS AI"><input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask LULS AI…" maxLength={500} autoComplete="off" aria-label="Ask LULS AI" /><button type="submit" disabled={loading || !input.trim()} aria-label={loading ? 'Sending message' : 'Send message'}>{loading ? '…' : '↗'}</button></form>
      <div className="luls-ai-footer"><small className="luls-ai-disclaimer">General guidance only. Confirm payments and event details on the official portal.</small><div className="luls-ai-support"><a href={supportWhatsAppUrl} target="_blank" rel="noreferrer">Support WhatsApp</a><a href={supportPhoneUrl}>Call support</a></div><button type="button" className="luls-ai-reset" onClick={resetChat}>Start over</button></div>
    </section>}
  </>;
}
