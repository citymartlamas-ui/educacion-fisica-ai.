import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    ArrowLeft,
    Plus,
    Download,
    FileText,
    ChevronRight,
    Edit3,
    Trash2
} from 'lucide-react';

const PlanAnualPage = ({ onNavigate, user }) => {
    const [plans, setPlans] = useState([
        { id: '1', title: 'Planización Anual 2026 - Primaria', level: '1ero a 6to Primaria', lastModified: '2026-02-28', status: 'En Progreso' },
        { id: '2', title: 'Programación Curricular - Secundaria', level: '1ero a 5to Secundaria', lastModified: '2026-01-15', status: 'Completado' },
    ]);

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <button className="btn btn-secondary" onClick={() => onNavigate('tools')} style={{ marginBottom: '2rem' }}>
                    <ArrowLeft size={16} /> Volver
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Plan <span className="text-gradient">Anual Maestro</span></h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Organiza tus unidades y competencias para todo el año escolar.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { }}>
                        <Plus size={18} /> Crear Nuevo Plan
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {plans.map((plan, i) => (
                    <motion.div
                        key={plan.id}
                        className="glass"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}
                    >
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <div style={{ width: '50px', height: '50px', background: 'var(--color-primary-glow)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.25rem' }}>{plan.title}</h3>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <span>{plan.level}</span>
                                    <span>•</span>
                                    <span>Modificado: {plan.lastModified}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.75rem',
                                borderRadius: 'full',
                                background: plan.status === 'Completado' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                color: plan.status === 'Completado' ? '#10b981' : '#fbbf24',
                                fontWeight: 700,
                                border: '1px solid currentColor'
                            }}>
                                {plan.status}
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-icon" title="Editar"><Edit3 size={16} /></button>
                                <button className="btn-icon" title="Descargar PDF"><Download size={16} /></button>
                                <button className="btn-icon" style={{ color: 'var(--color-danger)' }} title="Eliminar"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                <button
                    className="glass"
                    style={{
                        padding: '3rem',
                        border: '2px dashed var(--glass-border)',
                        background: 'transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                >
                    <Plus size={32} />
                    <span>Haga clic para iniciar una nueva programación</span>
                </button>
            </div>

            {/* Curriculum Reference Info */}
            <div style={{ marginTop: '4rem' }}>
                <div className="glass-static" style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                    <div style={{ padding: '1rem', background: 'var(--color-accent-glow)', borderRadius: '50%', color: 'var(--color-accent)' }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Sincronización con el Currículo Nacional</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            Tus planes anuales están pre-configurados con las competencias transversales y capacidades del área de Educación Física:
                        </p>
                        <ul style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <li>• Se desenvuelve de manera autónoma a través de su motricidad.</li>
                            <li>• Asume una vida saludable.</li>
                            <li>• Interactúa a través de sus habilidades sociomotrices.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanAnualPage;
