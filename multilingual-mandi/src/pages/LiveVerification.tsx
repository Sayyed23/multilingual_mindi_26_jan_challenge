import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/dashboard/Dashboard.css';

const LiveVerification: React.FC = () => {
    const navigate = useNavigate();
    const [transcription, setTranscription] = useState<string>("The color consistency indicates Grade A ripeness. This batch will be verified for export.");
    const [isAiActive, setIsAiActive] = useState(true);

    // Mock captured images
    const captures = [
        { id: 1, color: '#eab308' }, // Yellowish
        { id: 2, color: '#4ade80' }, // Greenish
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#0f172a',
            color: '#fff',
            zIndex: 9999,
            display: 'flex',
            overflow: 'hidden'
        }}>
            {/* Top Header Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: '#22c55e', fontSize: '1.5rem' }}>☘️</div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>AgriMarket B2B</h3>
                        <div style={{ fontSize: '0.75rem', color: '#4ade80' }}>Quality Verification • #98234-ORD</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '4px 12px', background: 'rgba(220, 38, 38, 0.2)', color: '#ef4444', borderRadius: '4px', border: '1px solid rgba(220, 38, 38, 0.5)', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span> LIVE
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>⏰ 12:44</div>
                    <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px', borderRadius: '8px', color: '#fff' }}>📶</button>
                    <div style={{ width: '32px', height: '32px', background: '#4ade80', borderRadius: '50%', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14532d', fontWeight: 'bold' }}>JD</div>
                </div>
            </div>

            {/* Left Sidebar - Captures */}
            <div style={{
                width: '80px',
                padding: '1rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                zIndex: 10,
                marginTop: '60px'
            }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', textAlign: 'center' }}>Captures</div>
                {captures.map(cap => (
                    <div key={cap.id} style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: '8px',
                        background: cap.color, // Placeholder for image
                        border: '2px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer'
                    }}></div>
                ))}
                <button style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px dashed rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.5)'
                }}>📷</button>
            </div>

            {/* Main Video Feed Area */}
            <div style={{ flex: 1, position: 'relative', background: '#1e293b' }}>
                {/* Background Video Mock - Using Image would go here */}
                <img
                    src="/_artifacts/avocado_inspection_bg.png"
                    alt="Live Feed"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.style.background = 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)';
                    }}
                />

                {/* AI Overlay Box */}
                {isAiActive && (
                    <div style={{
                        position: 'absolute',
                        top: '40%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '280px',
                        height: '280px',
                        border: '2px solid #4ade80',
                        borderRadius: '24px',
                        boxShadow: '0 0 0 1000px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Corner Markers */}
                        <div style={{ position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTop: '4px solid #4ade80', borderLeft: '4px solid #4ade80', borderTopLeftRadius: 20 }}></div>
                        <div style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTop: '4px solid #4ade80', borderRight: '4px solid #4ade80', borderTopRightRadius: 20 }}></div>
                        <div style={{ position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottom: '4px solid #4ade80', borderLeft: '4px solid #4ade80', borderBottomLeftRadius: 20 }}></div>
                        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottom: '4px solid #4ade80', borderRight: '4px solid #4ade80', borderBottomRightRadius: 20 }}></div>

                        <div style={{
                            position: 'absolute',
                            top: '-16px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#22c55e',
                            color: '#000',
                            fontSize: '0.6rem',
                            fontWeight: 'bold',
                            padding: '2px 8px',
                            borderRadius: '12px'
                        }}>
                            AI ANALYSIS ACTIVE
                        </div>

                        {/* Analysis Data */}
                        <div style={{
                            marginTop: '40px',
                            alignSelf: 'center',
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(8px)',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            minWidth: '180px'
                        }}>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '1px' }}>Ripeness</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1.2rem' }}>Grade A -</div>
                                    <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1rem' }}>Optimal</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Confidence</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>98.4%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PIP View */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '200px',
                    aspectRatio: '16/9',
                    background: '#334155',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <img
                        src="/_artifacts/buyer_avatar_pip.png"
                        alt="Buyer"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.style.background = '#475569';
                            e.currentTarget.parentElement!.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem">👤</div>';
                        }}
                    />
                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>� You (Buyer)</div>
                </div>

                {/* Live Translation Overlay */}
                <div style={{
                    position: 'absolute',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '90%',
                    maxWidth: '600px',
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.65rem', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid #4ade80', padding: '2px 6px', borderRadius: '4px' }}>
                            Live Translation · ES → EN
                        </span>
                    </div>
                    <p style={{ fontSize: '1.1rem', margin: 0, lineHeight: 1.5 }}>
                        "{transcription}"
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                        <button style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '0.8rem' }}>Standard View</button>
                        <button style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>Quality Verification Mode</button>
                    </div>
                </div>

                {/* Bottom Control Bar */}
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <button style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>�️</button>
                    <button style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</button>
                    <button style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚙️</button>

                    <button style={{
                        padding: '0 1.5rem',
                        height: '48px',
                        borderRadius: '12px',
                        background: '#22c55e',
                        border: 'none',
                        color: '#000',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginLeft: '1rem',
                        marginRight: '1rem'
                    }}>
                        <span>📸</span> Take Quality Photo
                    </button>

                    <button onClick={() => navigate('/')} style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ef4444', border: 'none', color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📞</button>
                </div>
            </div>
        </div>
    );
};

export default LiveVerification;
