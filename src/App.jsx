import React, { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Dumbbell, Sparkles, BookOpen, LayoutDashboard, ShieldCheck,
    ChevronRight, ArrowLeft, ClipboardList, Trophy, Target,
    Users, Zap, Heart, Brain, Calendar, FileText, Star,
    LogOut, User, Menu, X, Bell, CheckCircle2, Activity,
    Timer, Lock
} from 'lucide-react'
import { useAuth } from './AuthContext'
import LoginPage from './LoginPage'

// Static load components to prevent chunk load errors on deploy
import Generator from './Generator'
import AdminDashboard from './AdminDashboard'
import GamesPage from './GamesPage'
import PlanAnualPage from './PlanAnualPage'
import UnitsPage from './UnitsPage'
import ExamsPage from './ExamsPage'
import CalculadoraPage from './CalculadoraPage'
import ClassTimer from './ClassTimer'
import DiagnosticoPage from './DiagnosticoPage'

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
}

const staggerContainer = {
    animate: {
        transition: { staggerChildren: 0.1 }
    }
}

function App() {
    const { user, loading, logout, deviceError } = useAuth()

    // Validate that the hash is a valid page, otherwise default to home
    const [currentPage, setCurrentPage] = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return hash || 'home';
    })

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // FORCE REDIRECT TO LOGIN ON DEVICE ERROR
    useEffect(() => {
        if (deviceError && currentPage !== 'login') {
            setCurrentPage('login');
        }
    }, [deviceError, currentPage]);


    useEffect(() => {
        window.location.hash = currentPage;
    }, [currentPage]);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && hash !== currentPage) {
                setCurrentPage(hash);
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [currentPage]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg)'
            }}>
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <img src="/pwa-192x192.png" alt="Loading" style={{ width: 60, height: 60, borderRadius: '12px' }} />
                </motion.div>
            </div>
        )
    }

    const renderPage = () => {
        if (!user && currentPage !== 'login') {
            return <LandingPage onNavigate={setCurrentPage} user={user} />
        }

        switch (currentPage) {
            case 'login':
                return <LoginPage onNavigate={setCurrentPage} />
            case 'home':
                return <LandingPage onNavigate={setCurrentPage} user={user} />
            case 'tools':
                return <ToolsPage onNavigate={setCurrentPage} user={user} />
            case 'generator':
                return <GeneratorPage onNavigate={setCurrentPage} />
            case 'games':
                return <Suspense fallback={<LoadingModule />}><GamesPage onNavigate={setCurrentPage} user={user} /></Suspense>
            case 'plan-anual':
                return <Suspense fallback={<LoadingModule />}><PlanAnualPage onNavigate={setCurrentPage} user={user} /></Suspense>
            case 'unidades':
                return <Suspense fallback={<LoadingModule />}><UnitsPage onNavigate={setCurrentPage} user={user} /></Suspense>
            case 'fichas':
                return <Suspense fallback={<LoadingModule />}><ExamsPage onNavigate={setCurrentPage} user={user} /></Suspense>
            case 'calculadora':
                return <Suspense fallback={<LoadingModule />}><CalculadoraPage onNavigate={setCurrentPage} user={user} /></Suspense>
            case 'timer':
                return <Suspense fallback={<LoadingModule />}><ClassTimer onNavigate={setCurrentPage} user={user} /></Suspense>
            case 'diagnostico':
                return <DiagnosticoPage onNavigate={setCurrentPage} user={user} />
            case 'admin':
                return <Suspense fallback={<LoadingModule />}><AdminDashboard /></Suspense>
            default:
                return <LandingPage onNavigate={setCurrentPage} user={user} />
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--text-primary)', position: 'relative', overflowX: 'hidden' }}>
            {/* Background Glows */}
            <div className="bg-glow bg-glow-1" />
            <div className="bg-glow bg-glow-2" />
            <div className="bg-glow bg-glow-3" />

            {/* Notification Banner */}
            <motion.div 
                initial={{ y: -50 }} 
                animate={{ y: 0 }} 
                style={{ 
                    background: 'linear-gradient(90deg, #ff0080, #7928ca)', 
                    color: 'white', 
                    padding: '0.8rem', 
                    textAlign: 'center', 
                    fontSize: '0.9rem', 
                    fontWeight: '800',
                    position: 'relative',
                    zIndex: 1001,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
            >
                <span>✨ VERSIÓN 4.4: Unidades Didácticas Premium y Profesionales</span>
            </motion.div>

            {/* Navbar */}
            <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="navbar-inner">
                    <div className="navbar-brand" onClick={() => setCurrentPage('home')}>
                        <div className="navbar-brand-icon" style={{ padding: 0, overflow: 'hidden' }}>
                            <img src="/pwa-192x192.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div className="navbar-brand-text">
                            EDUFISICA <span className="hidden-mobile">AI</span>
                        </div>
                    </div>

                    <ul className="navbar-links">
                        <li><a href="#" className={currentPage === 'home' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}>Inicio</a></li>
                        <li><a href="#" className={currentPage === 'tools' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage('tools'); }}>Herramientas</a></li>
                        {user?.role === 'admin' && (
                            <li><a href="#" className={currentPage === 'admin' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage('admin'); }}>Admin</a></li>
                        )}
                    </ul>

                    <div className="navbar-actions">
                        {user ? (
                            <div className="hidden-mobile" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <div className="user-profile-badge" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.4rem 0.75rem',
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                                    ) : (
                                        <User size={14} />
                                    )}
                                    <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                                    </span>
                                </div>
                                <button className="btn-icon btn" onClick={logout} title="Cerrar sesión">
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <button className="btn btn-primary hidden-mobile" onClick={() => setCurrentPage('login')}>
                                INGRESAR
                            </button>
                        )}

                        <button
                            className="mobile-menu-toggle btn-icon"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                                background: 'var(--color-surface)',
                                borderBottom: '1px solid var(--glass-border)',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }}>Inicio</button>
                                <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => { setCurrentPage('tools'); setIsMobileMenuOpen(false); }}>Herramientas</button>
                                {user?.role === 'admin' && (
                                    <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => { setCurrentPage('admin'); setIsMobileMenuOpen(false); }}>Panel Admin</button>
                                )}
                                <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />
                                {user ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0 0.5rem' }}>Conectado como: {user.email}</div>
                                        <button className="btn btn-primary" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>Cerrar Sesión</button>
                                    </div>
                                ) : (
                                    <button className="btn btn-primary" onClick={() => { setCurrentPage('login'); setIsMobileMenuOpen(false); }}>Ingresar</button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Content Area */}
            <main>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderPage()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Bottom Navigation for Mobile PWA */}
            <div className="bottom-nav hidden-desktop" style={{ display: 'flex' }}>
                <button className={`bottom-nav-item ${currentPage === 'home' ? 'active' : ''}`} onClick={() => setCurrentPage('home')}>
                    <Activity size={20} />
                    <span>Inicio</span>
                </button>
                <button className={`bottom-nav-item ${currentPage === 'tools' ? 'active' : ''}`} onClick={() => setCurrentPage('tools')}>
                    <LayoutDashboard size={20} />
                    <span>Herramientas</span>
                </button>
                {user?.role === 'admin' && (
                    <button className={`bottom-nav-item ${currentPage === 'admin' ? 'active' : ''}`} onClick={() => setCurrentPage('admin')}>
                        <ShieldCheck size={20} />
                        <span>Admin</span>
                    </button>
                )}
                {user ? (
                    <>
                        <button className={`bottom-nav-item ${currentPage === 'perfil' ? 'active' : ''}`} onClick={() => setCurrentPage('perfil')}>
                            <User size={20} />
                            <span>Perfil</span>
                        </button>
                        <button className="bottom-nav-item" onClick={logout} style={{ color: 'var(--color-error)' }}>
                            <LogOut size={20} />
                            <span>Salir</span>
                        </button>
                    </>
                ) : (
                    <button className={`bottom-nav-item ${currentPage === 'login' ? 'active' : ''}`} onClick={() => setCurrentPage('login')}>
                        <User size={20} />
                        <span>Ingresar</span>
                    </button>
                )}
            </div>

            {/* Footer */}
            <footer className="footer" style={{ paddingBottom: '90px' }}>
                <div className="container">
                    <div style={{ marginBottom: '1rem', opacity: 0.8 }}>
                        <img src="/pwa-192x192.png" alt="Logo" style={{ width: 32, height: 32, borderRadius: '8px' }} />
                    </div>
                    <p>© 2026 EduFisica AI. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    )
}

function LoadingModule() {
    return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <Sparkles size={32} color="var(--color-primary)" />
            </motion.div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando módulo inteligente...</p>
        </div>
    )
}

function LandingPage({ onNavigate, user }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <section className="hero">
                <div className="container">
                    <motion.div {...fadeIn}>
                        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                            <img src="/pwa-192x192.png" alt="EduFisica Logo" style={{ width: '80px', height: '80px', borderRadius: '15px', boxShadow: '0 0 30px rgba(52, 211, 153, 0.2)' }} />
                        </div>
                        <div className="hero-badge">
                            <Sparkles size={14} /> LA NUEVA ERA DE LA EDUCACIÓN FÍSICA
                        </div>
                        <h1>
                            Planifica tus clases en <span className="text-gradient">segundos</span> con IA
                        </h1>
                        <p className="hero-subtitle">
                            La primera plataforma inteligente diseñada específicamente para docentes de Educación Física en Perú, alineada al CNEB.
                        </p>
                        <div className="hero-buttons">
                            <button className="btn btn-primary btn-lg" onClick={() => onNavigate(user ? 'tools' : 'login')}>
                                {user ? 'MIS HERRAMIENTAS' : 'EMPEZAR AHORA'} <Zap size={18} />
                            </button>
                            <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('tools')}>
                                EXPLORAR MÓDULOS
                            </button>
                        </div>

                        <div className="hero-stats">
                            <div className="hero-stat">
                                <div className="hero-stat-value">+500</div>
                                <div className="hero-stat-label">Juegos Motores</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-value">100%</div>
                                <div className="hero-stat-label">Alineado CNEB</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-value">⚡</div>
                                <div className="hero-stat-label">Ahorro de Tiempo</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <div className="overline">¿Qué incluye?</div>
                        <h2>Tecnología para <span className="text-secondary">Mejores Docentes</span></h2>
                    </div>

                    <div className="features-grid">
                        <FeatureCard 
                            icon={<Activity size={24} />} 
                            title="Evaluación Diagnóstica" 
                            desc="NUEVO: Genera retos diagnósticos, criterios e instrumentos alineados al CNEB." 
                            color="accent" 
                            onClick={() => onNavigate(user ? 'diagnostico' : 'login')}
                        />
                        <FeatureCard 
                            icon={<Brain size={24} />} 
                            title="IA Especializada en EF" 
                            desc="No es un generador genérico. Nuestra IA entiende de motricidad, juegos y pedagogía deportiva." 
                            color="primary" 
                            onClick={() => onNavigate(user ? 'tools' : 'login')}
                        />
                        <FeatureCard 
                            icon={<ShieldCheck size={24} />} 
                            title="Gestiona tu Material" 
                            desc="Dile qué tienes (balones, conos) y la IA adaptará las sesiones a tu realidad." 
                            color="secondary" 
                            onClick={() => onNavigate(user ? 'tools' : 'login')}
                        />
                    </div>
                </div>
            </section>

            <section id="pricing-section" className="section" style={{ background: 'var(--glass-bg)' }}>
                <div className="container">
                    <div className="section-header">
                        <div className="overline">Planes y Precios</div>
                        <h2>Invierte en tu <span className="text-secondary">Desarrollo Profesional</span></h2>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginTop: '3rem' }}>
                        {/* Plan Oferta */}
                        <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', maxWidth: '350px', width: '100%', border: '2px solid var(--color-primary)', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '-15px', right: '20px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'var(--color-bg)', padding: '0.4rem 1rem', borderRadius: '1rem', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                OFERTA ESPECIAL
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Trimestral</h3>
                            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-primary)', marginBottom: '1rem', lineHeight: 1 }}>S/ 15 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 3 meses</span></div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>La oferta ideal para iniciar y transformar tus clases todo un trimestre.</p>
                            
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem', listStyle: 'none', padding: 0 }}>
                                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={18} color="var(--color-primary)" /> <span>Generador de Sesiones IA</span></li>
                                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={18} color="var(--color-primary)" /> <span>Plan Anual Automático</span></li>
                                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={18} color="var(--color-primary)" /> <span>Banco de Juegos Motores</span></li>
                                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={18} color="var(--color-primary)" /> <span>Calculadora Física</span></li>
                            </ul>
                            <button 
                                className="btn btn-primary w-full" 
                                style={{ width: '100%' }}
                                onClick={() => window.open('https://wa.me/51928403248?text=Hola!%20Deseo%20adquirir%20la%20Oferta%20Especial%20de%20EduFisica%20AI%20(S/%2015%20por%203%20meses).%20Adjunto%20mi%20voucher%20de%20pago.', '_blank')}
                            >
                                Comprar Oferta
                            </button>
                        </div>

                        {/* Plan Regular */}
                        <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', maxWidth: '350px', width: '100%', opacity: 0.9 }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Mensual</h3>
                            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1 }}>S/ 10 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ mes</span></div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Renovación automática tras finalizar los 3 meses iniciales.</p>

                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem', listStyle: 'none', padding: 0 }}>
                                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={18} color="var(--color-primary)" /> <span>Acceso total a herramientas</span></li>
                                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={18} color="var(--color-primary)" /> <span>Nuevas funciones mensuales</span></li>
                                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={18} color="var(--color-primary)" /> <span>Actualizaciones CNEB</span></li>
                                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={18} color="var(--color-primary)" /> <span>Soporte prioritario</span></li>
                            </ul>
                            <button 
                                className="btn btn-secondary w-full" 
                                style={{ width: '100%' }}
                                onClick={() => window.open('https://wa.me/51928403248?text=Hola!%20Deseo%20informaci%C3%B3n%20sobre%20el%20Plan%20Mensual%20de%20EduFisica%20AI.', '_blank')}
                            >
                                Consultar Plan
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </motion.div>
    )
}

function ToolsPage({ onNavigate, user }) {
    const tools = [
        { id: 'diagnostico', num: '01', title: 'Evaluación Diagnóstica', desc: 'Genera el reto diagnóstico, criterios e instrumentos iniciales.', icon: <Activity size={18} />, tag: 'Destacado' },
        { id: 'generator', num: '02', title: 'Generador de Sesiones', desc: 'Crea sesiones de EF completas: Inicio, Desarrollo y Cierre.', icon: <ClipboardList size={18} />, tag: 'Más Popular' },
        { id: 'plan-anual', num: '03', title: 'Plan Anual', desc: 'Genera tu programación anual alineada al currículo nacional.', icon: <Calendar size={18} />, tag: 'IA Avanzada' },
        { id: 'unidades', num: '04', title: 'Unidades Didácticas', desc: 'Diseña unidades completas con competencias y desempeños.', icon: <BookOpen size={18} />, tag: 'Nuevo' },
        { id: 'fichas', num: '05', title: 'Fichas y Exámenes', desc: 'Crea fichas de aprendizaje y evaluaciones teóricas.', icon: <FileText size={18} />, tag: 'IA Avanzada' },
        { id: 'timer', num: '06', title: 'Cronómetro Maestro', desc: 'Gestiona tiempos y estaciones de clase con silbato automático.', icon: <Timer size={18} />, tag: 'Plus' },
        { id: 'games', num: '07', title: 'Banco de Juegos', desc: 'Biblioteca de juegos motores organizados por edad.', icon: <Trophy size={18} />, tag: 'Recurso' },
        { id: 'portafolio', num: '08', title: 'Portafolio Docente', desc: 'Organiza tus evidencias y documentos de gestión en un solo lugar.', icon: <LayoutDashboard size={18} />, tag: 'Próximamente' },
        { id: 'calculadora', num: '09', title: 'Calculadora Física', desc: 'Test de Cooper, IMC, resistencia y más.', icon: <Target size={18} />, tag: 'Mejora' },
    ]

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <div className="overline">Panel de Control</div>
                        <h2>Tus <span className="text-gradient">Herramientas</span> IA</h2>
                        <p>Diseñadas para maximizar tu impacto en el patio y ahorrarte horas de escritorio.</p>
                    </div>

                    {!user?.isPremium && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            style={{ 
                                background: 'rgba(251, 191, 36, 0.1)', 
                                border: '1px solid rgba(251, 191, 36, 0.3)', 
                                padding: '1.25rem', 
                                borderRadius: '12px', 
                                marginBottom: '2rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1rem' 
                            }}
                        >
                            <div style={{ width: '40px', height: '40px', background: 'rgba(251, 191, 36, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', flexShrink: 0 }}>
                                <Lock size={20} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, color: 'var(--color-accent)', marginBottom: '0.1rem' }}>Acceso Limitado</div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Genera sesiones, planes anuales y unidades completas activando tu cuenta premium vinculada a tu DNI.</p>
                            </div>
                            <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }} onClick={() => { onNavigate('home'); setTimeout(() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>
                                VER PLANES
                            </button>
                        </motion.div>
                    )}

                    <div className="tools-grid">
                        {tools.map((tool, i) => {
                            const isLocked = !user?.isPremium;
                            return (
                                <motion.div
                                    key={i}
                                    variants={fadeIn}
                                    className={`glass tool-card ${isLocked ? 'locked' : ''}`}
                                    onClick={() => {
                                        if (!user) onNavigate('login')
                                        else if (isLocked) {
                                            onNavigate('home');
                                            setTimeout(() => {
                                                document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
                                            }, 100);
                                        }
                                        else onNavigate(tool.id)
                                    }}
                                    style={{ 
                                        position: 'relative', 
                                        opacity: isLocked ? 0.75 : 1,
                                        cursor: isLocked ? 'pointer' : 'pointer'
                                    }}
                                >
                                    {isLocked && (
                                        <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'var(--color-accent)' }}>
                                            <Lock size={16} />
                                        </div>
                                    )}
                                    <div className="tool-card-header">
                                        <span className="tool-card-number">{tool.num}</span>
                                        <div style={{ color: isLocked ? 'var(--text-muted)' : 'var(--color-primary)' }}>{tool.icon}</div>
                                    </div>
                                    <div className="tool-card-title">{tool.title}</div>
                                    <div className="tool-card-desc">{tool.desc}</div>
                                    <div className="tool-card-tag">
                                        <Star size={12} /> {tool.tag}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>
        </motion.div>
    )
}

function GeneratorPage({ onNavigate }) {
    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <button className="btn btn-secondary" onClick={() => onNavigate('tools')} style={{ marginBottom: '2rem' }}>
                <ArrowLeft size={16} /> Volver al Panel
            </button>
            <Generator />
        </div>
    )
}

function FeatureCard({ icon, title, desc, color, onClick }) {
    return (
        <div className="glass feature-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            <div className={`feature-card-icon ${color}`}>{icon}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
        </div>
    )
}

export default App
