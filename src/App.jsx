import React, { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LogOut, User, CheckCircle2, Menu, X, Home,
    Calendar, Layers, Search, MoreHorizontal,
    PlusCircle, Bell, History, FilePlus, Table, BarChart,
    Dumbbell, ClipboardList, ChevronRight, ShieldCheck,
    Target, Trophy, ArrowLeft, LayoutDashboard, FileText,
    Sparkles, BookOpen, Star
} from 'lucide-react'
import { useAuth } from './AuthContext'
import LoginPage from './LoginPage'

// Lazy load large components
const Generator = React.lazy(() => import('./Generator'))
const AdminDashboard = React.lazy(() => import('./AdminDashboard'))
const GamesPage = React.lazy(() => import('./GamesPage'))
const PlanAnualPage = React.lazy(() => import('./PlanAnualPage'))
const UnitsPage = React.lazy(() => import('./UnitsPage'))
const RubricsPage = React.lazy(() => import('./RubricsPage'))

console.log("App.jsx: Modules loaded");

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
}

function App() {
    const { user, loading, logout } = useAuth()
    const [currentPage, setCurrentPage] = useState('home')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    console.log("App Render - User:", user?.email, "Loading:", loading, "Page:", currentPage);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#060b18',
                color: '#00e5ff'
            }}>
                <div style={{ marginBottom: '2rem', animation: 'spin 2s linear infinite' }}>
                    <Dumbbell size={60} />
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '2px' }}>
                    CARGANDO...
                </div>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        )
    }

    if (!user) {
        return (
            <AnimatePresence mode="wait">
                {currentPage === 'login' ? (
                    <LoginPage key="login" onNavigate={setCurrentPage} />
                ) : (
                    <SplashPage key="splash" onNavigate={setCurrentPage} />
                )}
            </AnimatePresence>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--text-primary)' }}>
            <Suspense fallback={<div className="loading-fallback">Cargando módulo...</div>}>
                <AnimatePresence mode="wait">
                    {/* TOP NAV / HEADER */}
                    <header className="glass" style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 100,
                        padding: '1rem',
                        borderBottom: '1px solid var(--glass-border)'
                    }}>
                        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="navbar-brand" onClick={() => setCurrentPage('home')}>
                                <div className="navbar-brand-icon">
                                    <Dumbbell size={22} />
                                </div>
                                <div className="navbar-brand-text">
                                    EDUFISICA <span>AI</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="btn-icon" onClick={() => setCurrentPage('mas')}>
                                    <User size={20} />
                                </button>
                                <button className="btn-icon" onClick={() => setIsMobileMenuOpen(true)}>
                                    <Menu size={20} />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* MAIN CONTENT */}
                    <main style={{ paddingBottom: '6rem' }}>
                        <AnimatePresence mode="wait">
                            {currentPage === 'home' && <DashboardPrincipal key="home" user={user} onNavigate={setCurrentPage} />}

                            {currentPage === 'generator' && (
                                <motion.div key="generator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                                        <button className="btn btn-secondary" onClick={() => setCurrentPage('planificacion')} style={{ marginBottom: '1.5rem' }}>
                                            <ArrowLeft size={16} /> Volver
                                        </button>
                                        <Generator />
                                    </div>
                                </motion.div>
                            )}

                            {currentPage === 'planificacion' && (
                                <div className="container" style={{ paddingTop: '2rem' }}>
                                    <div className="section-header">
                                        <h2>Módulo de <span className="text-gradient">Planificación</span></h2>
                                        <p>Gestiona tu año escolar, unidades y sesiones.</p>
                                    </div>
                                    <div className="tools-grid">
                                        <ToolItem icon={<Calendar size={24} />} title="Plan Anual" desc="Programación anual CNEB" onClick={() => setCurrentPage('plan-anual')} />
                                        <ToolItem icon={<Layers size={24} />} title="Unidades" desc="Unidades didácticas" onClick={() => setCurrentPage('unidades')} />
                                        <ToolItem icon={<FilePlus size={24} />} title="Sesiones" desc="Generador de sesiones IA" onClick={() => setCurrentPage('generator')} />
                                    </div>
                                </div>
                            )}

                            {currentPage === 'evaluacion' && (
                                <div className="container" style={{ paddingTop: '2rem' }}>
                                    <div className="section-header">
                                        <h2>Módulo de <span className="text-gradient">Evaluación</span></h2>
                                        <p>Rúbricas, listas de cotejo y registros.</p>
                                    </div>
                                    <div className="tools-grid">
                                        <ToolItem icon={<Table size={24} />} title="Rúbricas" desc="Crear rúbricas IA" onClick={() => setCurrentPage('rubricas')} />
                                        <ToolItem icon={<ClipboardList size={24} />} title="Lista de Cotejo" desc="Evaluación rápida" onClick={() => setCurrentPage('home')} />
                                        <ToolItem icon={<BarChart size={24} />} title="Registros" desc="Seguimiento por alumno" onClick={() => setCurrentPage('home')} />
                                    </div>
                                </div>
                            )}

                            {currentPage === 'admin' && <AdminDashboard key="admin" />}
                            {currentPage === 'games' && <GamesPage key="games" onNavigate={setCurrentPage} user={user} />}
                            {currentPage === 'plan-anual' && <PlanAnualPage key="plan-anual" onNavigate={setCurrentPage} user={user} />}
                            {currentPage === 'unidades' && <UnitsPage key="unidades" onNavigate={setCurrentPage} user={user} />}
                            {currentPage === 'rubricas' && <RubricsPage key="rubricas" onNavigate={setCurrentPage} user={user} />}
                            {currentPage === 'mas' && <ConfigPage key="mas" onNavigate={setCurrentPage} user={user} logout={logout} />}
                        </AnimatePresence>
                    </main>

                    {/* BOTTOM NAV */}
                    <nav className="bottom-nav">
                        <button className={`bottom-nav-item ${currentPage === 'home' ? 'active' : ''}`} onClick={() => setCurrentPage('home')}>
                            <Home size={22} />
                            <span>Inicio</span>
                        </button>
                        <button className={`bottom-nav-item ${currentPage === 'planificacion' ? 'active' : ''}`} onClick={() => setCurrentPage('planificacion')}>
                            <Calendar size={22} />
                            <span>Planes</span>
                        </button>
                        <button className={`bottom-nav-item ${currentPage === 'games' ? 'active' : ''}`} onClick={() => setCurrentPage('games')}>
                            <Dumbbell size={22} />
                            <span>Actividades</span>
                        </button>
                        <button className={`bottom-nav-item ${currentPage === 'evaluacion' ? 'active' : ''}`} onClick={() => setCurrentPage('evaluacion')}>
                            <ClipboardList size={22} />
                            <span>Evaluar</span>
                        </button>
                        <button className={`bottom-nav-item ${currentPage === 'mas' ? 'active' : ''}`} onClick={() => setCurrentPage('mas')}>
                            <MoreHorizontal size={22} />
                            <span>Más</span>
                        </button>
                    </nav>
                </AnimatePresence>
            </Suspense>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'var(--color-bg)',
                            zIndex: 1000,
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                            <button className="btn-icon" onClick={() => setIsMobileMenuOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <button className="btn btn-secondary w-full" onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }}>INICIO</button>
                            <button className="btn btn-secondary w-full" onClick={() => { setCurrentPage('planificacion'); setIsMobileMenuOpen(false); }}>PLANIFICACIÓN</button>
                            <button className="btn btn-secondary w-full" onClick={() => { setCurrentPage('evaluacion'); setIsMobileMenuOpen(false); }}>EVALUACIÓN</button>
                            <button className="btn btn-secondary w-full" onClick={() => { setCurrentPage('games'); setIsMobileMenuOpen(false); }}>BANCO DE JUEGOS</button>
                            {user?.role === 'admin' && (
                                <button className="btn btn-primary w-full" onClick={() => { setCurrentPage('admin'); setIsMobileMenuOpen(false); }}>ADMINISTRACIÓN</button>
                            )}
                            <button className="btn btn-danger w-full" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>CERRAR SESIÓN</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ============================================
   STYLING BLOCKS
   ============================================ */

function SplashPage({ onNavigate }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hero">
            <div className="container">
                <motion.div {...fadeIn}>
                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <div className="navbar-brand-icon" style={{ width: 80, height: 80 }}>
                            <Dumbbell size={40} />
                        </div>
                    </div>
                    <h1>
                        EDUFISICA <span className="text-gradient">AI</span>
                    </h1>
                    <p className="hero-subtitle" style={{ fontSize: '1.4rem', fontWeight: 600 }}>
                        “Planifica, enseña y evalúa con respaldo del CNEB”
                    </p>
                    <div className="hero-buttons" style={{ flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '2rem auto 0' }}>
                        <button className="btn btn-primary btn-lg w-full" onClick={() => onNavigate('login')}>
                            INGRESAR
                        </button>
                        <button className="btn btn-secondary btn-lg w-full" onClick={() => onNavigate('login')}>
                            CREAR CUENTA
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}

function DashboardPrincipal({ user, onNavigate }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container" style={{ paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem' }}>¡Hola, {user.displayName?.split(' ')[0] || 'Docente'}! 👋</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Hoy es un buen día para enseñar.</p>
                </div>
                <button className="btn-icon" style={{ background: 'var(--glass-bg)' }}>
                    <Bell size={20} />
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                        <History size={18} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>PRÓXIMAS SESIONES</h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="glass-static" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                            <div style={{ fontWeight: 600 }}>Velocidad y Reacción</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>3ro Secundaria • Mañana</div>
                        </div>
                    </div>
                </div>

                <div className="glass" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--color-secondary)' }}>
                        <Layers size={18} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>UNIDADES ACTIVAS</h4>
                    </div>
                    <div className="glass-static" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 600 }}>Unidad 1: Mi cuerpo</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>3 de 5 sesiones</div>
                    </div>
                </div>
            </div>

            <h4 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>ACCIONES RÁPIDAS</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <QuickButton icon={<FilePlus size={20} />} label="Nueva Sesión" color="primary" onClick={() => onNavigate('generator')} />
                <QuickButton icon={<PlusCircle size={20} />} label="Nueva Unidad" color="secondary" onClick={() => onNavigate('planificacion')} />
                <QuickButton icon={<Star size={20} />} label="Evaluar" color="accent" onClick={() => onNavigate('evaluacion')} />
                <QuickButton icon={<Search size={20} />} label="Buscar Juego" color="primary" onClick={() => onNavigate('games')} />
            </div>
        </motion.div>
    )
}

function QuickButton({ icon, label, color, onClick }) {
    return (
        <button className="glass quick-button" onClick={onClick}>
            <div className={`quick-icon ${color}`}>{icon}</div>
            <span>{label}</span>
        </button>
    )
}

function ToolItem({ icon, title, desc, onClick }) {
    return (
        <div className="glass tool-card" onClick={onClick} style={{ padding: '1.5rem' }}>
            <div className="tool-card-icon primary">{icon}</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{desc}</p>
        </div>
    )
}

function ConfigPage({ onNavigate, user, logout }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container" style={{ paddingTop: '2rem' }}>
            <div className="section-header">
                <h2>Configuración y <span className="text-gradient">Más</span></h2>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="glass" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--color-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={24} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700 }}>{user?.displayName || 'Docente'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                    </div>
                </div>
                <div className="glass" style={{ padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>SISTEMA</h4>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <MenuNavItem icon={<BookOpen size={18} />} label="Marco Normativo CNEB" onClick={() => { }} />
                        {user?.role === 'admin' && (
                            <MenuNavItem icon={<ShieldCheck size={18} />} label="Panel Administrador" onClick={() => onNavigate('admin')} color="var(--color-primary)" />
                        )}
                    </div>
                </div>
                <button className="btn btn-danger w-full" onClick={logout} style={{ marginTop: '1rem' }}>
                    <LogOut size={16} /> CERRAR SESIÓN
                </button>
            </div>
        </motion.div>
    )
}

function MenuNavItem({ icon, label, onClick, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '0.5rem 0' }} onClick={onClick}>
            <div style={{ color: color || 'var(--text-secondary)' }}>{icon}</div>
            <div style={{ fontSize: '0.95rem', color: color || 'var(--text-primary)' }}>{label}</div>
            <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </div>
    )
}

export default App
