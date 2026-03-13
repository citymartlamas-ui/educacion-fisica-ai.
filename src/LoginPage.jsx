import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Activity, ArrowLeft, X, AlertTriangle } from 'lucide-react';

import { useAuth } from './AuthContext';

function LoginPage({ onNavigate }) {
    const { login, loginWithGoogle, register, deviceError, setDeviceError, user, isChecking } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        setError('');
    }, [isRegister]);

    // Navegación reactiva: Solo ir a home si hay usuario y NO hay error de dispositivos Y terminó de validar
    React.useEffect(() => {
        if (user && !deviceError && !isChecking) {
            onNavigate('home');
        }
    }, [user, deviceError, isChecking, onNavigate]);


    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        dni: '',
        level: '',
        institution: '',
        region: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (setDeviceError) setDeviceError(null);
        setLoading(true);

        try {
            if (isRegister) {
                await register(formData.email, formData.password, formData.name, {
                    dni: formData.dni,
                    level: formData.level,
                    institution: formData.institution,
                    region: formData.region
                });
            } else {
                await login(formData.email, formData.password);
            }
            // No navegamos aquí, esperamos al useEffect reactivo
        } catch (err) {
            const messages = {
                'auth/email-already-in-use': 'Este correo ya está registrado.',
                'auth/invalid-email': 'El correo no es válido.',
                'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
                'auth/user-not-found': 'No existe una cuenta con este correo.',
                'auth/wrong-password': 'Contraseña incorrecta.',
                'auth/invalid-credential': 'Credenciales incorrectas. Verifica tu correo y contraseña.',
            };
            setError(messages[err.code] || 'Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        if (setDeviceError) setDeviceError(null);
        setLoading(true);

        try {
            await loginWithGoogle();
            // No navegamos aquí, esperamos al useEffect reactivo
        } catch (err) {
            setError('Error con Google: ' + err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}
        >
            <div style={{ width: '100%', maxWidth: '420px' }}>
                <button
                    className="btn btn-secondary"
                    onClick={() => onNavigate('home')}
                    style={{ marginBottom: '2rem' }}
                >
                    <ArrowLeft size={16} /> Volver al Inicio
                </button>

                <motion.div
                    className="glass-static"
                    style={{ padding: '2.5rem' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                            overflow: 'hidden',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <img src="/pwa-192x192.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            {isRegister ? 'Crear Cuenta' : 'Bienvenido'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {isRegister ? 'Únete a la comunidad de docentes' : 'Ingresa a tu cuenta'}
                        </p>
                    </div>

                    {/* Mensajes de Validación, Error y Advertencia */}
                    {isChecking && (
                        <div style={{
                            background: 'rgba(52, 211, 153, 0.1)',
                            border: '1px solid var(--color-primary)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem',
                            color: 'var(--color-primary)',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem'
                        }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                <Activity size={18} />
                            </motion.div>
                            <span>Verificando seguridad y dispositivos...</span>
                        </div>
                    )}

                    {(error || deviceError) && !isChecking && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                background: deviceError ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                border: deviceError ? '1px solid #fbbf24' : '1px solid var(--color-error)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                color: 'white',
                                fontSize: '0.9rem',
                                lineHeight: '1.4'
                            }}
                        >
                            <div style={{ color: deviceError ? '#fbbf24' : 'var(--color-error)', flexShrink: 0 }}>
                                {deviceError ? <AlertTriangle size={20} /> : <X size={20} />}
                            </div>
                            <div style={{ flex: 1 }}>{deviceError || error}</div>
                        </motion.div>
                    )}



                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="btn btn-secondary w-full"
                        style={{
                            padding: '0.85rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            width: '100%'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.04 24.04 0 0 0 0 21.56l7.98-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        Continuar con Google
                    </button>

                    {/* Divider */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>o</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {isRegister && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Nombre completo</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="text" className="form-input" placeholder="Tu nombre" style={{ paddingLeft: '2.5rem' }} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label className="form-label">DNI (Opcional)</label>
                                        <input type="text" className="form-input" placeholder="Número DNI" value={formData.dni} onChange={(e) => setFormData({ ...formData, dni: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Nivel</label>
                                        <select className="form-input" value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} required style={{ background: 'var(--color-bg)' }}>
                                            <option value="">Selección...</option>
                                            <option value="inicial">Inicial</option>
                                            <option value="primaria">Primaria</option>
                                            <option value="secundaria">Secundaria</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Institución Educativa</label>
                                    <input type="text" className="form-input" placeholder="Nombre del colegio" value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Región</label>
                                    <input type="text" className="form-input" placeholder="Ej. Lima, Cusco" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} required />
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label className="form-label">Correo electrónico</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{
                                    position: 'absolute',
                                    left: '0.85rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }} />
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="tu@correo.com"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{
                                    position: 'absolute',
                                    left: '0.85rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="Mínimo 6 caracteres"
                                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.85rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: 'var(--radius-sm)',
                                color: '#ef4444',
                                fontSize: '0.85rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                            style={{ padding: '0.85rem', width: '100%', marginTop: '0.5rem' }}
                        >
                            {loading ? 'Cargando...' : (isRegister ? 'CREAR MI CUENTA' : 'INICIAR SESIÓN')}
                        </button>
                    </form>

                    {/* Toggle */}
                    <p style={{
                        textAlign: 'center',
                        marginTop: '1.5rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem'
                    }}>
                        {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
                        <button
                            onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-primary)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                padding: 0
                            }}
                        >
                            {isRegister ? 'Inicia sesión' : 'Regístrate gratis'}
                        </button>
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default LoginPage;
