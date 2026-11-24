import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'LULS — Laikipia University Language Scholars Community';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '68px 78px', background: 'linear-gradient(120deg, #12244f 0%, #1f3567 62%, #c9962e 100%)', color: '#fffdf8', fontFamily: 'Arial' }}><div style={{ display: 'flex', alignItems: 'center', gap: 22 }}><div style={{ width: 88, height: 88, borderRadius: 44, border: '3px solid #e8c36c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 31, fontWeight: 700, color: '#e8c36c' }}>LULS</div><div style={{ display: 'flex', flexDirection: 'column', fontSize: 24, letterSpacing: 5, fontWeight: 700 }}><span>LAIKIPIA UNIVERSITY</span><span style={{ color: '#e8c36c', fontSize: 18, letterSpacing: 4, marginTop: 8 }}>LINGUISTICS SCHOLARS</span></div></div><div style={{ display: 'flex', flexDirection: 'column', maxWidth: 950 }}><div style={{ color: '#e8c36c', fontSize: 20, letterSpacing: 6, fontWeight: 700, marginBottom: 20 }}>LANGUAGE · CULTURE · CONNECTION</div><div style={{ fontSize: 76, lineHeight: 1.02, fontWeight: 700, letterSpacing: -3 }}>Make language visible.</div><div style={{ fontSize: 25, lineHeight: 1.35, marginTop: 24, color: '#dce5f4' }}>A living circle of students, researchers, and language champions exploring Kenya and beyond.</div></div><div style={{ display: 'flex', fontSize: 20, letterSpacing: 3, color: '#e8c36c' }}>luls · scholar portal</div></div>, { ...size });
}
