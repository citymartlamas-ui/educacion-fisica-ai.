import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Send, Loader2, ClipboardCheck, Dumbbell,
    Copy, Download, Share2, Zap, ArrowLeft,
    GraduationCap, BookOpen, Clock, Package
} from 'lucide-react';
import { generateLessonPlan } from './gemini';

function Generator() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState({
        level: 'Primaria',
        topic: '',
        materials: '',
        duration: '45 min',
        competencia: 'Se desenvuelve de manera autónoma a través de su motricidad'
    });

    const handleGenerate = async () => {
        if (!formData.topic) return;
        setLoading(true);

        const prompt = `Eres un docente experto de Educación Física en Perú. Genera una sesión de aprendizaje detallada alineada al CNEB.
        Nivel/Grado: ${formData.level}. 
        Tema principal: ${formData.topic}. 
        Competencia: ${formData.competencia}.
        Materiales disponibles: ${formData.materials || 'Uso de propio cuerpo e imaginación'}. 
        Duración: ${formData.duration}.
        
        La sesión debe seguir la estructura:
        1. Datos Informativos (Propósito, Grado, Tiempo).
        2. Inicio (Activación corporal, Saberes previos, Motivación).
        3. Desarrollo (Reto motriz, Actividades principales, Variantes pedagógicas).
        4. Cierre (Vuelta a la calma, Metacognición, Reflexión).
        
        Usa un lenguaje profesional y motivador para el docente.`;

        try {
            const response = await generateLessonPlan(prompt);
            setResult(response);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ minHeight: '80vh' }}>
            <div className="generator-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

                {/* Left Side: Input Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass"
                    style={{ padding: '2rem', height: 'fit-content', borderTop: '2px solid var(--color-primary)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--color-primary-glow)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Nueva Sesión</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Inteligencia Artificial Especializada</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Nivel / Grado</label>
                            <select
                                className="form-select"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                            >
                                <option>Inicial (3-5 años)</option>
                                <option>Primaria (Baja)</option>
                                <option>Primaria (Alta)</option>
                                <option>Secundaria (1° - 2°)</option>
                                <option>Secundaria (3° - 5°)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tema Principal</label>
                            <input
                                type="text"
                                placeholder="Ej: Coordinación con balón, Atletismo..."
                                className="form-input"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Competencia CNEB</label>
                            <select
                                className="form-select"
                                value={formData.competencia}
                                onChange={(e) => setFormData({ ...formData, competencia: e.target.value })}
                            >
                                <option>Se desenvuelve de manera autónoma a través de su motricidad</option>
                                <option>Asume una vida saludable</option>
                                <option>Interactúa a través de sus habilidades sociomotrices</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Duración</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {['45 min', '90 min'].map(t => (
                                    <button
                                        key={t}
                                        className={`btn ${formData.duration === t ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{ flex: 1 }}
                                        onClick={() => setFormData({ ...formData, duration: t })}
                                    >
                                        <Clock size={16} /> {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Materiales (Opcional)</label>
                            <textarea
                                placeholder="Ej: 5 pelotas, 10 conos..."
                                className="form-textarea"
                                value={formData.materials}
                                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                                style={{ minHeight: '80px' }}
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !formData.topic}
                            className="btn btn-primary"
                            style={{ padding: '1.25rem', marginTop: '1rem', width: '100%', fontSize: '1rem' }}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> GENERAR SESIÓN MAESTRA</>}
                        </button>
                    </div>
                </motion.div>

                {/* Right Side: Result Output */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ position: 'relative' }}
                >
                    <AnimatePresence mode="wait">
                        {!result && !loading ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="glass"
                                style={{
                                    padding: '3rem',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    borderStyle: 'dashed'
                                }}
                            >
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'var(--glass-bg)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.5rem'
                                }}>
                                    <Dumbbell size={40} style={{ opacity: 0.2 }} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tu sesión aparecerá aquí</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Completa el formulario y deja que la IA haga el trabajo pesado por ti.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass result-container"
                                style={{
                                    padding: '2rem',
                                    height: '100%',
                                    maxHeight: '90vh',
                                    overflowY: 'auto'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1.5rem',
                                    position: 'sticky',
                                    top: 0,
                                    background: 'rgba(6,11,24,0.8)',
                                    backdropFilter: 'blur(10px)',
                                    padding: '0.5rem 0',
                                    zIndex: 10
                                }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        color: 'var(--color-secondary)',
                                        border: '1px solid var(--color-secondary-glow)',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: 'var(--radius-sm)'
                                    }}>
                                        INTELIGENCIA ARTIFICIAL GENERADA
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={handleCopy} className="btn-icon" title="Copiar">
                                            {copied ? <ClipboardCheck size={18} color="var(--color-secondary)" /> : <Copy size={18} />}
                                        </button>
                                        <button className="btn-icon" title="Descargar PDF"><Download size={18} /></button>
                                    </div>
                                </div>

                                <div className="session-content" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.8' }}>
                                    {result}
                                </div>

                                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                                    <button onClick={handleGenerate} className="btn btn-secondary" style={{ flex: 1 }}>
                                        <Zap size={16} /> REGENERAR
                                    </button>
                                    <button className="btn btn-primary" style={{ flex: 1 }}>
                                        COMPARTIR
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

            </div>
        </div>
    );
}

export default Generator;
