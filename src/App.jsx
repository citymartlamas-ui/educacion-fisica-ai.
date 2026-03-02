import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Dumbbell, Sparkles, BookOpen, LayoutDashboard, ShieldCheck,
    ChevronRight, ArrowLeft, ClipboardList, Trophy, Target,
    Users, Zap, Heart, Brain, Calendar, FileText, Star,
    LogOut, User, CheckCircle2
} from 'lucide-react'
import { useAuth } from './AuthContext'
import LoginPage from './LoginPage'
import Generator from './Generator'
import AdminDashboard from './AdminDashboard'
import GamesPage from './GamesPage'
import PlanAnualPage from './PlanAnualPage'
import UnitsPage from './UnitsPage'
import RubricsPage from './RubricsPage'

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

    return (
        <div>
            {/* Background Glows */}
            <div className="bg-glow bg-glow-1" />
            <div className="bg-glow bg-glow-2" />
            <div className="bg-glow bg-glow-3" />

            {/* Navbar - hidden on login page */}
            {currentPage !== 'login' && (
                <nav className="navbar">
                    <div className="navbar-inner">
                        <div className="navbar-brand" onClick={() => setCurrentPage('home')}>
                            <div className="navbar-brand-icon">
                                <Dumbbell size={22} />
                            </div>
                            <div className="navbar-brand-text">
                                EDUFISICA <span>AI</span>
                            </div>
                        </div>

                        <ul className="navbar-links">
                            <li><a href="#" className={currentPage === 'home' ? 'active' : ''} onClick={() => setCurrentPage('home')}>Inicio</a></li>
                            <li><a href="#" className={currentPage === 'tools' ? 'active' : ''} onClick={() => setCurrentPage('tools')}>Herramientas</a></li>
                            {user?.role === 'admin' && (
                                <li><a href="#" className={currentPage === 'admin' ? 'active' : ''} onClick={() => setCurrentPage('admin')}>Administración</a></li>
                            )}
                            <li><a href="#" className={currentPage === 'profile' ? 'active' : ''} onClick={() => setCurrentPage('profile')}>Mi Perfil</a></li>
                            <li><a href="#" onClick={() => setCurrentPage('home')}>Recursos</a></li>
                            <li><a href="#" onClick={() => setCurrentPage('home')}>Comunidad</a></li>
                        </ul>

                        <div className="navbar-actions">
                            {user ? (
                                <>
                                    <div style={{
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
                                            {user.displayName || user.email}
                                        </span>
                                        {user.role === 'admin' && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '0.1rem 0.4rem',
                                                background: 'var(--color-primary)',
                                                color: 'white',
                                                borderRadius: 'var(--radius-sm)',
                                                fontWeight: 800,
                                                marginLeft: '0.25rem'
                                            }}>
                                                ADMIN
                                            </span>
                                        )}
                                    </div>
                                    <button className="btn-icon btn" onClick={logout} title="Cerrar sesión">
                                        <LogOut size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="btn btn-secondary" onClick={() => setCurrentPage('login')}>
                                        Iniciar Sesión
                                    </button>
                                    <button className="btn btn-primary" onClick={() => setCurrentPage('login')}>
                                        Registrarse
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </nav>
            )}

            {/* Content */}
            <AnimatePresence mode="wait">
                {currentPage === 'home' && <HomePage key="home" onNavigate={setCurrentPage} user={user} />}
                {currentPage === 'tools' && <ToolsPage key="tools" onNavigate={setCurrentPage} user={user} />}
                {currentPage === 'generator' && <GeneratorPage key="generator" onNavigate={setCurrentPage} />}

                {currentPage === 'banco' && <GamesPage key="banco" user={user} onNavigate={setCurrentPage} />}
                {currentPage === 'plan-anual' && <PlanAnualPage key="plan-anual" user={user} onNavigate={setCurrentPage} />}
                {currentPage === 'unidades' && <UnitsPage key="unidades" user={user} onNavigate={setCurrentPage} />}
                {currentPage === 'rubricas' && <RubricsPage key="rubricas" user={user} onNavigate={setCurrentPage} />}

                {currentPage === 'calculadora' && (
                    <UnderConstructionPage
                        key="calculadora"
                        title="Calculadora Física"
                        onNavigate={setCurrentPage}
                    />
                )}

                {currentPage === 'admin' && user?.role === 'admin' && (
                    <div className="container" style={{ paddingTop: '2rem' }}>
                        <AdminDashboard key="admin" />
                    </div>
                )}
                {currentPage === 'profile' && <ProfilePage key="profile" user={user} onNavigate={setCurrentPage} />}
                {currentPage === 'login' && <LoginPage key="login" onNavigate={setCurrentPage} />}
            </AnimatePresence>

            {/* Footer */}
            {currentPage !== 'login' && (
                <footer className="footer">
                    <div className="container">
                        <ul className="footer-links">
                            <li><a href="#">Términos</a></li>
                            <li><a href="#">Privacidad</a></li>
                            <li><a href="#">Contacto</a></li>
                            <li><a href="#">Soporte</a></li>
                        </ul>
                        <p>© 2026 EduFisica AI — Hecho con 💪 para docentes de Educación Física</p>
                    </div>
                </footer>
            )}
        </div>
    )
}

/* ============================================
   HOME PAGE
   ============================================ */
function HomePage({ onNavigate, user }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* Hero */}
            <section className="hero">
                <div className="container">
                    <motion.div {...fadeIn}>
                        <div className="hero-badge">
                            <Sparkles size={14} /> POTENCIADO CON INTELIGENCIA ARTIFICIAL
                        </div>
                        <h1>
                            TU ASISTENTE DE<br />
                            <span className="text-gradient">EDUCACIÓN FÍSICA</span>
                        </h1>
                        <p className="hero-subtitle">
                            La plataforma que todo docente nuevo necesita. Genera sesiones, gestiona materiales
                            y planifica tu año escolar en minutos, no en horas.
                        </p>
                        <div className="hero-buttons">
                            <button className="btn btn-primary btn-lg" onClick={() => onNavigate(user ? 'tools' : 'login')}>
                                {user ? 'IR A MIS HERRAMIENTAS' : 'EMPEZAR GRATIS'} <ChevronRight size={20} />
                            </button>
                            <button className="btn btn-secondary btn-lg">
                                VER DEMOSTRACIÓN
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        className="hero-stats"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="hero-stat">
                            <div className="hero-stat-value">12+</div>
                            <div className="hero-stat-label">Herramientas IA</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">500+</div>
                            <div className="hero-stat-label">Juegos Motores</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">100%</div>
                            <div className="hero-stat-label">Currículo Nacional</div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <div className="overline">¿Por qué EduFisica AI?</div>
                        <h2>Todo lo que necesitas en <span className="text-gradient">un solo lugar</span></h2>
                        <p>Diseñada para docentes de Educación Física que quieren ahorrar tiempo y ofrecer clases increíbles.</p>
                    </div>

                    <motion.div
                        className="features-grid"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                    >
                        <FeatureCard icon={<Brain size={24} />} title="IA Especializada en EF" desc="No es un generador genérico. Nuestra IA entiende de motricidad, juegos y pedagogía deportiva." color="primary" />
                        <FeatureCard icon={<ShieldCheck size={24} />} title="Gestiona tu Material" desc="Dile qué tienes (3 balones, 5 conos) y la IA adaptará las sesiones a tu realidad." color="secondary" />
                        <FeatureCard icon={<Calendar size={24} />} title="Plan Anual Automático" desc="Genera tu programación anual alineada al currículo nacional en un clic." color="accent" />
                        <FeatureCard icon={<Target size={24} />} title="Rúbricas Inteligentes" desc="Evalúa habilidades motrices (equilibrio, coordinación, velocidad) con criterios objetivos." color="primary" />
                        <FeatureCard icon={<Heart size={24} />} title="Primeros Auxilios" desc="Accede a un módulo de consulta rápida para lesiones comunes en clase de EF." color="secondary" />
                        <FeatureCard icon={<Trophy size={24} />} title="Pruebas Físicas" desc="Calculadora automática de Test de Cooper, IMC y pruebas de velocidad." color="accent" />
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
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                            Únete a la comunidad de docentes que ya están usando IA para planificar mejor.
                        </p>
                        <button className="btn btn-primary btn-lg" onClick={() => onNavigate(user ? 'tools' : 'login')}>
                            {user ? 'IR A MIS HERRAMIENTAS' : 'CREAR MI CUENTA GRATIS'} <Zap size={18} />
                        </button>
                    </motion.div>
                </div>
            </section>
        </motion.div>
    )
}

/* ============================================
   TOOLS PAGE
   ============================================ */
function ToolsPage({ onNavigate, user }) {
    const tools = [
        { num: '01', title: 'Generador de Sesiones', desc: 'Crea sesiones de EF completas: calentamiento, desarrollo y vuelta a la calma.', icon: <ClipboardList size={18} />, tag: 'Más Popular' },
        { num: '02', title: 'Plan Anual', desc: 'Genera tu programación anual alineada al currículo nacional.', icon: <Calendar size={18} />, tag: 'IA Avanzada' },
        { num: '03', title: 'Unidades Didácticas', desc: 'Diseña unidades completas con competencias y desempeños.', icon: <BookOpen size={18} />, tag: 'Nuevo' },
        { num: '04', title: 'Rúbricas de Evaluación', desc: 'Crea rúbricas específicas para habilidades motrices.', icon: <FileText size={18} />, tag: 'IA Avanzada' },
        { num: '05', title: 'Banco de Juegos', desc: 'Más de 500 juegos motores organizados por edad y objetivo.', icon: <Trophy size={18} />, tag: 'Recurso' },
        { num: '06', title: 'Calculadora Física', desc: 'Test de Cooper, IMC, resistencia y más. Resultados al instante.', icon: <Target size={18} />, tag: 'Herramienta' },
    ]

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <section className="section">
                <div className="container">
                    {user && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: '1rem 1.5rem',
                                background: 'var(--color-primary-glow)',
                                border: '1px solid rgba(0, 229, 255, 0.2)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '2rem',
                                fontSize: '0.9rem',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div>
                                👋 ¡Hola, <strong>{user.displayName || user.email}</strong>! Selecciona una herramienta para comenzar.
                            </div>
                            {user.role === 'admin' && (
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '0.3rem 0.6rem',
                                    background: 'var(--color-accent)',
                                    color: 'white',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: 700
                                }}>
                                    MODO ADMINISTRADOR ACTIVADO
                                </span>
                            )}
                        </motion.div>
                    )}

                    <div className="section-header">
                        <div className="overline">Herramientas</div>
                        <h2>Tus <span className="text-gradient">Superpoderes</span> Docentes</h2>
                        <p>Cada herramienta está diseñada específicamente para el área de Educación Física.</p>
                    </div>

                    <motion.div
                        className="tools-grid"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {tools.map((tool, i) => (
                            <motion.div
                                key={i}
                                variants={fadeIn}
                                className="glass tool-card"
                                onClick={() => {
                                    if (!user) {
                                        onNavigate('login');
                                    } else if (tool.num === '01') {
                                        onNavigate('generator');
                                    } else if (tool.num === '02') {
                                        onNavigate('plan-anual');
                                    } else if (tool.num === '03') {
                                        onNavigate('unidades');
                                    } else if (tool.num === '04') {
                                        onNavigate('rubricas');
                                    } else if (tool.num === '05') {
                                        onNavigate('banco');
                                    } else if (tool.num === '06') {
                                        onNavigate('calculadora');
                                    }
                                }}
                            >
                                <div className="tool-card-header">
                                    <span className="tool-card-number">{tool.num}</span>
                                    {tool.icon}
                                </div>
                                <div className="tool-card-title">{tool.title}</div>
                                <div className="tool-card-desc">{tool.desc}</div>
                                <div className="tool-card-tag">
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

/* ============================================
   GENERATOR PAGE
   ============================================ */
function GeneratorPage({ onNavigate }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                <button className="btn btn-secondary" onClick={() => onNavigate('tools')} style={{ marginBottom: '1.5rem' }}>
                    <ArrowLeft size={16} /> Volver a Herramientas
                </button>
                <Generator />
            </div>
        </motion.div>
    )
}

/* ============================================
   FEATURE CARD COMPONENT
   ============================================ */
function FeatureCard({ icon, title, desc, color }) {
    return (
        <motion.div variants={fadeIn} className="glass feature-card">
            <div className={`feature-card-icon ${color}`}>{icon}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
        </motion.div>
    )
}

/* ============================================
   PROFILE PAGE
   ============================================ */
function ProfilePage({ user, onNavigate }) {
    if (!user) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
            <div className="glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'var(--color-primary-glow)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        fontSize: '3rem',
                        border: '2px solid var(--color-primary)'
                    }}>
                        {user.photoURL ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : user.displayName?.[0] || user.email?.[0]}
                    </div>
                    <h2>{user.displayName || 'Usuario'}</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="glass-static" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>ROL DE USUARIO</div>
                            <div style={{ fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: user.role === 'admin' ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                                {user.role === 'admin' ? 'Administrador' : 'Docente'}
                            </div>
                        </div>
                        {user.role === 'admin' ? <ShieldCheck size={24} style={{ color: 'var(--color-primary)' }} /> : <User size={24} style={{ color: 'var(--text-secondary)' }} />}
                    </div>

                    <div className="glass-static" style={{ padding: '1.25rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>ESTADÍSTICAS</div>
                        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user.materials?.length || 0}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Materiales</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user.savedSessions?.length || 0}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sesiones</div>
                            </div>
                        </div>
                    </div>

                    {user.role === 'admin' && (
                        <button className="btn btn-primary" onClick={() => onNavigate('admin')} style={{ width: '100%' }}>
                            <LayoutDashboard size={18} /> IR AL PANEL DE CONTROL
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

/* ============================================
   UNDER CONSTRUCTION PAGE
   ============================================ */
function UnderConstructionPage({ title, onNavigate }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container" style={{ paddingTop: '3rem', paddingBottom: '6rem', textAlign: 'center' }}>
            <button className="btn btn-secondary" onClick={() => onNavigate('tools')} style={{ marginBottom: '3rem' }}>
                <ArrowLeft size={16} /> Volver a Herramientas
            </button>

            <div className="glass" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'var(--color-primary-glow)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem',
                    color: 'var(--color-primary)'
                }}>
                    <LayoutDashboard size={40} />
                </div>
                <h1 style={{ marginBottom: '1rem' }}>{title}</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                    Estamos construyendo esta herramienta para que tengas la mejor experiencia posible.<br />
                    ¡Pronto estará disponible para potenciar tus clases!
                </p>
                <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', textAlign: 'left' }}>
                    <div className="glass-static" style={{ padding: '1.5rem' }}>
                        <div style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}><CheckCircle2 size={20} /></div>
                        <h4 style={{ marginBottom: '0.5rem' }}>Diseño Premium</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Interfaz optimizada para el flujo de trabajo docente.</p>
                    </div>
                    <div className="glass-static" style={{ padding: '1.5rem' }}>
                        <div style={{ color: 'var(--color-secondary)', marginBottom: '0.5rem' }}><Sparkles size={20} /></div>
                        <h4 style={{ marginBottom: '0.5rem' }}>IA Especializada</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Modelos entrenados en pedagogía deportiva.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default App
