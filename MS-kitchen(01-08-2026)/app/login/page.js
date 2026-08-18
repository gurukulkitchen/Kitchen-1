'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Force light mode on login page
        const html = document.documentElement;
        const hadDark = html.classList.contains('dark');
        const prevTheme = html.getAttribute('data-theme');

        if (hadDark) html.classList.remove('dark');
        html.setAttribute('data-theme', 'light');

        return () => {
            if (hadDark) html.classList.add('dark');
            if (prevTheme) {
                html.setAttribute('data-theme', prevTheme);
            } else {
                html.removeAttribute('data-theme');
            }
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('companyName', data.companyName);

                if (data.companyId) {
                    localStorage.setItem('companyId', data.companyId);
                    localStorage.setItem('selectedCompanyId', data.companyId);
                }

                if (data.assignedCompanies) {
                    localStorage.setItem('assignedCompanies', JSON.stringify(data.assignedCompanies));
                }

                if (data.id) localStorage.setItem('id', data.id);
                if (data.name) localStorage.setItem('name', data.name);

                localStorage.setItem('user', JSON.stringify({
                    id: data.id,
                    name: data.name,
                    role: data.role,
                    companyId: data.companyId,
                    company: data.companyId,
                    assignedCompanies: data.assignedCompanies || [],
                }));

                if (data.loginStartTime && data.loginEndTime) {
                    localStorage.setItem('loginStartTime', data.loginStartTime);
                    localStorage.setItem('loginEndTime', data.loginEndTime);
                } else {
                    localStorage.removeItem('loginStartTime');
                    localStorage.removeItem('loginEndTime');
                }

                try {
                    const routeRes = await fetch('/api/auth/initial-route');
                    if (routeRes.ok) {
                        const routeData = await routeRes.json();
                        router.push(routeData.initialRoute || '/dashboard');
                    } else {
                        router.push('/dashboard');
                    }
                } catch (routeErr) {
                    console.error("Failed to determine initial route", routeErr);
                    router.push('/dashboard');
                }
            } else {
                const data = await res.json();
                setError(data.message || 'Verification failed. Please check credentials.');
            }
        } catch (err) {
            setError('System synchronization error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Force light-mode styles for login page, overriding any dark-mode globals */}
            <style>{`
          #login-page-root input[type="text"] {
            background-color: transparent !important;
            color: #222 !important;
          }
          #login-page-root input[type="password"] {
            background-color: transparent !important;
            color: transparent !important;
            -webkit-text-fill-color: transparent !important;
          }
          
          /* Autofill Overrides */
          #login-page-root input:-webkit-autofill,
          #login-page-root input:-webkit-autofill:hover, 
          #login-page-root input:-webkit-autofill:focus, 
          #login-page-root input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px white inset !important;
            -webkit-text-fill-color: #8F2B1B !important;
          }

          #login-page-root input[type="password"]:-webkit-autofill,
          #login-page-root input[type="password"]:-webkit-autofill:hover, 
          #login-page-root input[type="password"]:-webkit-autofill:focus, 
          #login-page-root input[type="password"]:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px white inset !important;
            -webkit-text-fill-color: transparent !important;
          }

          #login-page-root button[type="submit"] {
            background: linear-gradient(to right, #8F2B1B, #CB5A2B) !important;
            background-image: linear-gradient(to right, #8F2B1B, #CB5A2B) !important;
          }
          #login-page-root label {
            color: #999 !important;
            font-style: italic !important;
          }
          #login-page-root .brand-footer-text {
            font-family: 'ZapfHumnst-BT-Bold' !important;
            font-variant: small-caps !important;
            letter-spacing: 1.5px !important;
            text-align: center !important;
            position: relative !important;
            z-index: 10 !important;
            display: block !important;
          }
        `}</style>
            <div
                id="login-page-root"
                style={{
                    minHeight: '100vh',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundImage: "url('/uploads/login_bg.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Background Overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(95, 34, 15, 0.55)',
                }} />

                {/* Left margin wrapper */}
                <div style={{ position: 'relative', zIndex: 10, marginLeft: '170px' }}>
                    <div style={{ position: 'relative' }}>
                        {/* Tulsi / Mint Leaf Decoration */}
                        <Image
                            src="/uploads/Tulsi 1 (1).png"
                            alt=""
                            width={75}
                            height={75}
                            style={{
                                position: 'absolute',
                                right: '-25px',
                                bottom: '105px',
                                zIndex: 20,
                            }}
                        />
                        <div
                            style={{
                                position: "relative",
                                width: "340px",
                                height: "520px",
                            }}
                        >
                            {/* Outer Border Frame */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: "25px",
                                    left: "-20px",
                                    width: "90%",
                                    height: "95%",
                                    border: "1.5px solid rgba(255,255,255,0.35)",
                                    borderRadius: "24px",
                                    zIndex: 1,
                                }}
                            />

                            {/* Login Card */}
                            <div
                                style={{
                                    position: "relative",
                                    width: "320px",
                                    height: "500px",
                                    background: "rgba(255,255,255,0.97)",
                                    borderRadius: "18px",
                                    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
                                    overflow: "hidden",
                                    zIndex: 2,
                                }}
                            >
                                {/* Background Pattern */}
                                <Image
                                    src="/uploads/Vector.png"
                                    alt=""
                                    fill
                                    style={{ objectFit: 'cover', opacity: 1, pointerEvents: 'none' }}
                                />

                                <div style={{ position: 'relative', zIndex: 10, padding: '30px 32px 0 32px' }}>
                                    {/* Logo */}
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                                        <Image
                                            src="/uploads/Untitled-1.png"
                                            alt="Logo"
                                            width={82}
                                            height={82}
                                        />
                                    </div>

                                    {/* Title */}
                                    <h1 style={{
                                        textAlign: 'center',
                                        marginTop: '6px',
                                        marginBottom: '24px',
                                        color: '#AF4313',
                                        fontFamily: 'SegoePrint, cursive',
                                        fontSize: '21px',
                                        fontWeight: '600',
                                        lineHeight: 1.2,
                                    }}>
                                        <span style={{ fontSize: '30px', color: 'black' }}>G</span>urukul <span style={{ fontSize: '30px', color: 'black' }}>K</span>itchen
                                    </h1>

                                    {/* Error Message */}
                                    {error && (
                                        <div style={{
                                            textAlign: 'center',
                                            color: '#ef4444',
                                            fontSize: '11px',
                                            marginBottom: '10px',
                                        }}>
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        {/* User ID Field */}
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '11px',
                                                fontStyle: 'italic',
                                                color: '#999',
                                                marginBottom: '6px',
                                                paddingLeft: '20px',
                                            }}>
                                                User ID :
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                {/* User Icon */}
                                                <span style={{
                                                    position: 'absolute',
                                                    left: '24px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: '#B1B1B1',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    zIndex: 10,
                                                }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                        <circle cx="12" cy="7" r="4" />
                                                    </svg>
                                                </span>
                                                <div style={{
                                                    position: 'relative',
                                                    borderRadius: '9999px',
                                                    border: '2px solid #CB5A2B',
                                                    backgroundColor: 'white',
                                                    boxShadow: '0 8px 10px #b1b1b1b1',
                                                    overflow: 'hidden',
                                                }}>
                                                    <input
                                                        type="text"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                        style={{
                                                            width: '100%',
                                                            height: '37px',
                                                            paddingLeft: '48px',
                                                            paddingRight: '16px',
                                                            borderRadius: '9999px',
                                                            border: 'none',
                                                            backgroundColor: 'transparent',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            caretColor: '#8F2B1B',
                                                            outline: 'none',
                                                            boxSizing: 'border-box',
                                                            display: 'block',
                                                            background: 'linear-gradient(to right, #CB5A2B, #8F2B1B)',
                                                            WebkitBackgroundClip: 'text',
                                                            WebkitTextFillColor: 'transparent',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Password Field */}
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '11px',
                                                fontStyle: 'italic',
                                                color: '#999',
                                                marginBottom: '6px',
                                                paddingLeft: '20px',

                                            }}>
                                                Password :
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                {/* Lock Icon */}
                                                <span style={{
                                                    position: 'absolute',
                                                    left: '24px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: '#B1B1B1',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    zIndex: 10,
                                                }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                    </svg>
                                                </span>
                                                <div style={{
                                                    position: 'relative',
                                                    borderRadius: '9999px',
                                                    border: '2px solid #CB5A2B',
                                                    backgroundColor: 'white',
                                                    boxShadow: '0 8px 10px #b1b1b1b1',
                                                    overflow: 'hidden',
                                                }}>
                                                    <input
                                                        type="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                        style={{
                                                            width: '100%',
                                                            height: '37px',
                                                            paddingLeft: '48px',
                                                            paddingRight: '16px',
                                                            borderRadius: '9999px',
                                                            border: 'none',
                                                            backgroundColor: 'transparent',
                                                            fontFamily: 'monospace',
                                                            fontSize: '18px',
                                                            letterSpacing: '3px',
                                                            color: 'transparent',
                                                            caretColor: '#8F2B1B',
                                                            outline: 'none',
                                                            boxSizing: 'border-box',
                                                            display: 'block',
                                                        }}
                                                    />
                                                    {/* Gradient Dots Overlay */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: 0,
                                                        height: '37px',
                                                        width: '100%',
                                                        paddingLeft: '48px',
                                                        paddingRight: '16px',
                                                        boxSizing: 'border-box',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        pointerEvents: 'none',
                                                        fontFamily: 'monospace',
                                                        fontSize: '18px',
                                                        letterSpacing: '3px',
                                                        background: 'linear-gradient(to right, #CB5A2B, #8F2B1B)',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                        userSelect: 'none',
                                                        overflow: 'hidden',
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        {'●'.repeat(password.length)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Remember Me */}
                                        <label
                                            htmlFor="rememberMe"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '22px',
                                                cursor: 'pointer',
                                                userSelect: 'none',
                                                paddingLeft: '20px',
                                            }}
                                        >
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '4px',
                                                border: '2px solid transparent',
                                                background: rememberMe
                                                    ? 'linear-gradient(to right, #8F2B1B, #CB5A2B) border-box'
                                                    : 'linear-gradient(white, white) padding-box, linear-gradient(to right, #8F2B1B, #CB5A2B) border-box',
                                                backgroundOrigin: 'border-box',
                                                backgroundClip: 'padding-box, border-box',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxSizing: 'border-box',
                                            }}>
                                                {rememberMe && (
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: '11px',
                                                    fontStyle: 'italic',
                                                    color: '#9a9a9a',
                                                }}
                                            >
                                                Remember
                                            </span>
                                        </label>

                                        {/* Login Button */}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            style={{
                                                width: '100%',
                                                height: '42px',
                                                borderRadius: '9999px',
                                                background: 'linear-gradient(to right, #8F2B1B, #CB5A2B)',
                                                color: 'white',
                                                fontSize: '14px',

                                                fontStyle: 'italic',
                                                letterSpacing: '0.5px',
                                                border: 'none',
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                opacity: loading ? 0.8 : 1,
                                                boxShadow: '0 4px 14px rgba(139, 41, 16, 0.55)',
                                                transition: 'opacity 0.2s',
                                            }}
                                        >
                                            {loading ? "Loading..." : "Log In"}
                                        </button>
                                    </form>
                                </div>
                                <p className='brand-footer-text text-[10px] text-center mt-5 font-[700] text-[#B1B1B1] whitespace-nowrap'>Shree Swaminarayan Gurukul Rajkot Sansthan</p>
                            </div>
                        </div>
                        {/* end outer border frame */}

                        {/* Footer Text */}
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            bottom: '-30px',
                            fontSize: '10px',
                            color: 'white',
                            whiteSpace: 'nowrap',
                            fontWeight: '500',
                            letterSpacing: '0.05em',
                        }} className="brand-footer-text">
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}


