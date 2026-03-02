import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    ArrowLeft,
    Plus,
    Star,
    Target,
    ClipboardCheck,
    Download,
    Eye
} from 'lucide-react';

const RubricsPage = ({ onNavigate, user }) => {
    const [rubrics, setRubrics] = useState([
        { id: '1', title: 'Evaluación de Salto y Caída', category: 'Salto', level: 'Primaria', date: '2026-02-10' },
        { id: '2', title: 'Test de Resistencia (Cooper)', category: 'Resistencia', level: 'Secundaria', date: '2026-01-20' },
        { id: '3', title: 'Coordinación Óculo-Manual', category: 'Coordinación', level: 'Primaria', date: '2026-02-25' },
    ]);

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <button className="btn btn-secondary" onClick={() => onNavigate('tools')} style={{ marginBottom: '2rem' }}>
                    <ArrowLeft size={16} /> Volver
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Rúbricas de <span className="text-gradient">Evaluación</span></h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Evalúa el progreso de tus alumnos con criterios claros y objetivos.</p>
                    </div>
                    <button className="btn btn-primary">
                        <Plus size={18} /> Crear Rúbrica IA
                    </button>
                </div>
            </header>

            <div className="admin-table-wrapper glass" style={{ padding: '1rem' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Título de la Rúbrica</th>
                            <th>Capacidad</th>
                            <th>Nivel</th>
                            <th>Última Edición</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rubrics.map((rubric, i) => (
                            <motion.tr
                                key={rubric.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ padding: '0.5rem', background: 'var(--color-primary-glow)', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)' }}>
                                            <ClipboardCheck size={18} />
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{rubric.title}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
                                        {rubric.category}
                                    </span>
                                </td>
                                <td>{rubric.level}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{rubric.date}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-icon" title="Ver"><Eye size={16} /></button>
                                        <button className="btn-icon" title="Exportar"><Download size={16} /></button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '3.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div className="glass" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}><Target size={24} /></div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Niveles de Logro</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ya configurados según el currículo: AD (Logro destacado), A, B y C.</p>
                </div>
                <div className="glass" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--color-secondary)', marginBottom: '1rem' }}><Star size={24} /></div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Sugerencias IA</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>La IA te propone indicadores de desempeño basados en la edad del alumno.</p>
                </div>
            </div>
        </div>
    );
};

export default RubricsPage;
