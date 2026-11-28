import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminContentManager } from '@/components/AdminContentManager';
import { AdminDashboard } from '@/components/AdminDashboard';
import type { PublicPost } from '@/lib/content';
import type { Member } from '@/lib/preview';

const member: Member = {
  slug: 'ed-art-1158-25', regNo: 'ED/ART/1158/25', name: 'Test Member', role: 'LULS member', level: 'Year 4', interests: ['French'], bio: '', email: 'member@example.com', phone: '0712345678', status: 'approved', paymentStatus: 'paid', paymentAmount: 100, paymentCurrency: 'KES', retreatPaymentStatus: 'paid', retreatEmailStatus: 'sent', retreatAnnouncementEmailStatus: 'sent',
};

const event: PublicPost = {
  _id: '507f1f77bcf86cd799439011', type: 'event', title: 'Language research workshop', slug: 'language-research-workshop', excerpt: 'A practical LULS workshop.', body: 'Bring your questions.', tags: ['event'], author: 'LULS Desk', published: true, featured: true, createdAt: '2026-11-28T00:00:00.000Z', updatedAt: '2026-11-28T00:00:00.000Z', eventDate: 'Sunday, 29 November 2026 · 11:00 PM', eventLocation: 'Cherika pickup point', notificationSentCount: 1,
};

test('content manager renders event and retreat publishing controls', () => {
  const html = renderToStaticMarkup(<AdminContentManager initialPosts={[event]} />);
  assert.match(html, /Event announcement/);
  assert.match(html, /Retreat announcement/);
  assert.match(html, /notify again/);
  assert.match(html, /Cherika pickup point/);
});

test('admin dashboard renders all member filter controls and confirmed retreat metrics', () => {
  const html = renderToStaticMarkup(<AdminDashboard members={[member]} posts={[event]} email="admin@example.com" initialTab="search" />);
  assert.match(html, /All statuses/);
  assert.match(html, /All payments/);
  assert.match(html, /With email/);
  assert.match(html, /Retreat bookings/);
  assert.match(html, /1/);
});
