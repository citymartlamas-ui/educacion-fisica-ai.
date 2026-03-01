import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Dumbbell, Sparkles, BookOpen, LayoutDashboard, ShieldCheck,
    ChevronRight, ArrowLeft, ClipboardList, Trophy, Target,
    Users, Zap, Heart, Brain, Calendar, FileText, Star,
    Menu, X
} from 'lucide-react'
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
    const [currentPage, setCurrentPage] = useState('home')
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <div>
            {/* Background Glows */}
            <div className="bg-glow bg-glow-1" />
            <div className="bg-glow bg-glow-2" />
            <div className="bg-glow bg-glow-3" />

            {/* Navbar */}
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
                        <li><a href="#" onClick={() => setCurrentPage('home')}>Recursos</a></li>
                        <li><a href="#" onClick={() => setCurrentPage('home')}>Comunidad</a></li>
                    </ul>

                    <div className="navbar-actions">
                        <button className="btn btn-secondary" onClick={() => setCurrentPage('home')}>
                            Iniciar Sesión
                        </button>
                        <button className="btn btn-primary" onClick={() => setCurrentPage('tools')}>
                            Registrarse
                        </button>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <AnimatePresence mode="wait">
                {currentPage === 'home' && <HomePage key="home" onNavigate={setCurrentPage} />}
                {currentPage === 'tools' && <ToolsPage key="tools" onNavigate={setCurrentPage} />}
                {currentPage === 'generator' && <GeneratorPage key="generator" onNavigate={setCurrentPage} />}
            </AnimatePresence>

            {/* Footer */}
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
        </div>
    )
}

/* ============================================
   HOME PAGE
   ============================================ */
function HomePage({ onNavigate }) {
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
                            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('tools')}>
                                EMPEZAR GRATIS <ChevronRight size={20} />
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
                        <FeatureCard
                            icon={<Brain size={24} />}
                            title="IA Especializada en EF"
                            desc="No es un generador genérico. Nuestra IA entiende de motricidad, juegos y pedagogía deportiva."
                            color="primary"
                        />
                        <FeatureCard
                            icon={<ShieldCheck size={24} />}
                            title="Gestiona tu Material"
                            desc="Dile qué tienes (3 balones, 5 conos) y la IA adaptará las sesiones a tu realidad."
                            color="secondary"
                        />
                        <FeatureCard
                            icon={<Calendar size={24} />}
                            title="Plan Anual Automático"
                            desc="Genera tu programación anual alineada al currículo nacional en un clic."
                            color="accent"
                        />
                        <FeatureCard
                            icon={<Target size={24} />}
                            title="Rúbricas Inteligentes"
                            desc="Evalúa habilidades motrices (equilibrio, coordinación, velocidad) con criterios objetivos."
                            color="primary"
                        />
                        <FeatureCard
                            icon={<Heart size={24} />}
                            title="Primeros Auxilios"
                            desc="Accede a un módulo de consulta rápida para lesiones comunes en clase de EF."
                            color="secondary"
                        />
                        <FeatureCard
                            icon={<Trophy size={24} />}
                            title="Pruebas Físicas"
                            desc="Calculadora automática de Test de Cooper, IMC y pruebas de velocidad."
                            color="accent"
                        />
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
                        <button className="btn btn-primary btn-lg" onClick={() => onNavigate('tools')}>
                            CREAR MI CUENTA GRATIS <Zap size={18} />
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
function ToolsPage({ onNavigate }) {
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
                                onClick={() => tool.num === '01' && onNavigate('generator')}
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
                <button
                    className="btn btn-secondary"
                    onClick={() => onNavigate('tools')}
                    style={{ marginBottom: '1.5rem' }}
                >
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
        <motion.div
            variants={fadeIn}
            className="glass feature-card"
        >
            <div className={`feature-card-icon ${color}`}>
                {icon}
            </div>
            <h3>{title}</h3>
            <p>{desc}</p>
        </motion.div>
    )
}

export default App
