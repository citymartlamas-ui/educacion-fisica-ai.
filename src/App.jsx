import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Dumbbell, Sparkles, BookOpen, LayoutDashboard, ShieldCheck,
    ChevronRight, ArrowLeft, ClipboardList, Trophy, Target,
    Users, Zap, Heart, Brain, Calendar, FileText, Star,
    LogOut, User, Menu, X, Bell
} from 'lucide-react'
import { useAuth } from './AuthContext'
import LoginPage from './LoginPage'
import Generator from './Generator'

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
    const { user, loading, logout } = useAuth()
    const [currentPage, setCurrentPage] = useState('home')

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
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Dumbbell size={40} style={{ color: 'var(--color-primary)' }} />
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

            {/* Navbar */}
            <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="navbar-inner">
                    <div className="navbar-brand" onClick={() => setCurrentPage('home')}>
                        <div className="navbar-brand-icon">
                            <Dumbbell size={22} />
                        </div>
                        <div className="navbar-brand-text">
                            EDUFISICA <span>AI</span>
                        </div>
                    </div>

                    <ul className="navbar-links" style={{ display: 'flex' }}>
                        <li><a href="#" className={currentPage === 'home' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}>Inicio</a></li>
                        <li><a href="#" className={currentPage === 'tools' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage('tools'); }}>Herramientas</a></li>
                    </ul>

                    <div className="navbar-actions">
                        {user ? (
                            <>
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
                            </>
                        ) : (
                            <button className="btn btn-primary" onClick={() => setCurrentPage('login')}>
                                INGRESAR
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Content Area */}
            <main>
                <AnimatePresence mode="wait">
                    {renderPage()}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div style={{ marginBottom: '1rem', opacity: 0.5 }}>
                        <Dumbbell size={24} />
                    </div>
                    <p>© 2026 EduFisica AI. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    )
}

function LandingPage({ onNavigate, user }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* HERO */}
            <section className="hero">
                <div className="container">
                    <motion.div {...fadeIn}>
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

            {/* FEATURES */}
            <section className="section bg-surface-subtle">
                <div className="container">
                    <div className="section-header">
                        <div className="overline">¿Qué incluye?</div>
                        <h2>Tecnología para <span className="text-secondary">Mejores Docentes</span></h2>
                    </div>

                    <motion.div
                        className="features-grid"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                    >
                        <FeatureCard icon={<Brain size={24} />} title="IA Especializada en EF" desc="No es un generador genérico. Nuestra IA entiende de motricidad, juegos y pedagogía deportiva." color="primary" />
                        <FeatureCard icon={<ShieldCheck size={24} />} title="Gestiona tu Material" desc="Dile qué tienes (balones, conos) y la IA adaptará las sesiones a tu realidad." color="secondary" />
                        <FeatureCard icon={<Calendar size={24} />} title="Plan Anual Automático" desc="Genera tu programación anual alineada al currículo nacional en un clic." color="accent" />
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="section" style={{ paddingBottom: '6rem' }}>
                <div className="container text-center">
                    <motion.div
                        className="glass-static"
                        style={{ padding: '3.5rem 2rem', borderRadius: 'var(--radius-xl)' }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 style={{ marginBottom: '1rem' }}>
                            ¿Listo para revolucionar tus <span className="text-gradient">clases de EF</span>?
                        </h2>
                        <button className="btn btn-primary btn-lg" onClick={() => onNavigate(user ? 'tools' : 'login')}>
                            EMPEZAR AHORA <Zap size={18} />
                        </button>
                    </motion.div>
                </div>
            </section>
        </motion.div>
    )
}

function ToolsPage({ onNavigate, user }) {
    const tools = [
        { id: 'generator', num: '01', title: 'Generador de Sesiones', desc: 'Crea sesiones de EF completas: Inicio, Desarrollo y Cierre.', icon: <ClipboardList size={18} />, tag: 'Más Popular' },
        { id: 'plan-anual', num: '02', title: 'Plan Anual', desc: 'Genera tu programación anual alineada al currículo nacional.', icon: <Calendar size={18} />, tag: 'Próximamente' },
        { id: 'unidades', num: '03', title: 'Unidades Didácticas', desc: 'Diseña unidades completas con competencias y desempeños.', icon: <BookOpen size={18} />, tag: 'Próximamente' },
        { id: 'rubricas', num: '04', title: 'Rúbricas de Evaluación', desc: 'Crea rúbricas específicas para habilidades motrices.', icon: <FileText size={18} />, tag: 'Próximamente' },
        { id: 'games', num: '05', title: 'Banco de Juegos', desc: 'Biblioteca de juegos motores organizados por edad.', icon: <Trophy size={18} />, tag: 'Próximamente' },
        { id: 'calculator', num: '06', title: 'Calculadora Física', desc: 'Test de Cooper, IMC, resistencia y más.', icon: <Target size={18} />, tag: 'Próximamente' },
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

                    <motion.div
                        className="tools-grid"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}
                    >
                        {tools.map((tool, i) => (
                            <motion.div
                                key={i}
                                variants={fadeIn}
                                className="glass tool-card"
                                onClick={() => {
                                    if (!user) onNavigate('login')
                                    else if (tool.id === 'generator') onNavigate(tool.id)
                                }}
                                style={{ padding: '2rem' }}
                            >
                                <div className="tool-card-header">
                                    <span className="tool-card-number">{tool.num}</span>
                                    <div style={{ color: 'var(--color-primary)' }}>{tool.icon}</div>
                                </div>
                                <div className="tool-card-title" style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>{tool.title}</div>
                                <div className="tool-card-desc">{tool.desc}</div>
                                <div className="tool-card-tag" style={{ marginTop: '1rem' }}>
                                    <Star size={12} /> {tool.tag}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
        </motion.div>
    )
}

function GeneratorPage({ onNavigate }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
                <button className="btn btn-secondary" onClick={() => onNavigate('tools')} style={{ marginBottom: '2rem' }}>
                    <ArrowLeft size={16} /> Volver al Panel
                </button>
                <Generator />
            </div>
        </motion.div>
    )
}

function FeatureCard({ icon, title, desc, color }) {
    return (
        <motion.div variants={fadeIn} className="glass feature-card">
            <div className={`feature-card-icon ${color}`}>{icon}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
        </motion.div>
    )
}

export default App
