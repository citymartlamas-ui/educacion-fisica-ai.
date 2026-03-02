import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    ArrowLeft,
    Plus,
    FileText,
    Layout,
    CheckCircle,
    ChevronRight,
    Search
} from 'lucide-react';

const UnitsPage = ({ onNavigate, user }) => {
    const [units, setUnits] = useState([
        { id: '1', title: 'Unidad 1: Conocemos nuestro cuerpo y sus posibilidades', sessions: 8, status: 'Completado', color: 'var(--color-primary)' },
        { id: '2', title: 'Unidad 2: Juegos tradicionales y populares de nuestra región', sessions: 6, status: 'En Progreso', color: 'var(--color-secondary)' },
        { id: '3', title: 'Unidad 3: Mejoramos nuestra coordinación con el atletismo', sessions: 10, status: 'Planificado', color: 'var(--color-accent)' },
    ]);

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <button className="btn btn-secondary" onClick={() => onNavigate('tools')} style={{ marginBottom: '2rem' }}>
                    <ArrowLeft size={16} /> Volver
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Unidades <span className="text-gradient">Didácticas</span></h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Diseña el cuerpo de tus enseñanzas: objetivos, sesiones y evaluación.</p>
                    </div>
                    <button className="btn btn-primary">
                        <Plus size={18} /> Nueva Unidad
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {units.map((unit, i) => (
                    <motion.div
                        key={unit.id}
                        className="glass"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }}
                        whileHover={{ translateY: -5 }}
                    >
                        <div style={{ height: '6px', background: unit.color }}></div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>U{unit.id} • 2026</span>
                                <CheckCircle size={16} style={{ color: unit.status === 'Completado' ? 'var(--color-secondary)' : 'var(--text-muted)' }} />
                            </div>
                            <h3 style={{ marginBottom: '1.5rem', lineHeight: '1.4' }}>{unit.title}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{unit.sessions}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sesiones</div>
                                    </div>
                                </div>
                                <button className="btn btn-icon" style={{ borderRadius: 'var(--radius-full)' }}>
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="glass-static" style={{ marginTop: '3rem', padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>¿Qué incluye cada unidad?</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ color: 'var(--color-primary)' }}><Layout size={20} /></div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Situación Significativa</div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Plantea retos reales para tus alumnos.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ color: 'var(--color-secondary)' }}><FileText size={20} /></div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Matrices de Desempeño</div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vinculación directa con las competencias.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ color: 'var(--color-accent)' }}><BookOpen size={20} /></div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Secuencia de Sesiones</div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>El mapa de ruta para cada semana.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnitsPage;
