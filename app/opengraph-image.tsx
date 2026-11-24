import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'LULS — Laikipia University Language Scholars Community';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '58px 72px', background: 'linear-gradient(120deg, #12244f 0%, #1f3567 62%, #c9962e 100%)', color: '#fffdf8', fontFamily: 'Arial' }}><div style={{ display: 'flex', alignItems: 'center', gap: 22 }}><img src="https://luls-club.leetec.online/icon.jpg" width="104" height="104" style={{ borderRadius: 52, objectFit: 'cover', border: '3px solid #e8c36c' }} /><div style={{ display: 'flex', flexDirection: 'column', fontSize: 23, letterSpacing: 4, fontWeight: 700 }}><span>LAIKIPIA UNIVERSITY</span><span style={{ color: '#e8c36c', fontSize: 18, letterSpacing: 3, marginTop: 8 }}>LANGUAGE SCHOLARS COMMUNITY</span></div></div><div style={{ display: 'flex', flexDirection: 'column', maxWidth: 950 }}><div style={{ color: '#e8c36c', fontSize: 19, letterSpacing: 5, fontWeight: 700, marginBottom: 18 }}>RESEARCH · SHARE · LEARN</div><div style={{ fontSize: 72, lineHeight: 1.02, fontWeight: 700, letterSpacing: -3 }}>Make language visible.</div><div style={{ fontSize: 24, lineHeight: 1.35, marginTop: 22, color: '#dce5f4' }}>A welcoming student community exploring German, Spanish, sign language, French, English, Kiswahili, and more.</div></div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, letterSpacing: 3, color: '#e8c36c' }}><span>LULS · SCHOLAR PORTAL</span><span>luls-club.leetec.online</span></div></div>, { ...size });
}
