import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Loader2, ClipboardCheck, Dumbbell,
    GraduationCap, BookOpen, Clock, Package, MapPin,
    Users, ChevronRight, ArrowLeft, Zap, FileText,
    Download, Share2, Copy, Save, CheckCircle2
} from 'lucide-react';
import { generateLessonPlan } from './gemini';

const LEVELS = [
    { id: 'inicial', label: 'Inicial', icon: '🌱' },
    { id: 'primaria', label: 'Primaria', icon: '📚' },
    { id: 'secundaria', label: 'Secundaria', icon: '🎓' }
];

const GRADES_BY_LEVEL = {
    inicial: [
        { value: 'inicial-3', label: '3 años' },
        { value: 'inicial-4', label: '4 años' },
        { value: 'inicial-5', label: '5 años' },
    ],
    primaria: [
        { value: '1-primaria', label: '1° Grado' },
        { value: '2-primaria', label: '2° Grado' },
        { value: '3-primaria', label: '3° Grado' },
        { value: '4-primaria', label: '4° Grado' },
        { value: '5-primaria', label: '5° Grado' },
        { value: '6-primaria', label: '6° Grado' },
    ],
    secundaria: [
        { value: '1-secundaria', label: '1° Grado' },
        { value: '2-secundaria', label: '2° Grado' },
        { value: '3-secundaria', label: '3° Grado' },
        { value: '4-secundaria', label: '4° Grado' },
        { value: '5-secundaria', label: '5° Grado' },
    ]
};

const COMPETENCIAS = [
    'Se desenvuelve de manera autónoma a través de su motricidad',
    'Asume una vida saludable',
    'Interactúa a través de sus habilidades sociomotrices',
];

const TIMES = ['45 min', '90 min'];
const SPACES = [
    { id: 'patio', label: 'Patio', icon: '🏟️' },
    { id: 'losa', label: 'Losa Deportiva', icon: '🏀' },
    { id: 'aula', label: 'Aula', icon: '🏫' },
    { id: 'mixto', label: 'Mixto', icon: '🔄' }
];

function Generator() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState({
        level: '',
        grade: '',
        competencia: COMPETENCIAS[0],
        time: '45 min',
        space: 'patio',
        hasMaterials: 'con',
        topic: ''
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleGenerate = async () => {
        setLoading(true);
        const prompt = `Eres un docente experto de Educación Física en Perú. Genera una sesión de aprendizaje para ${formData.level} - ${formData.grade}.
        Competencia: ${formData.competencia}.
        Tiempo: ${formData.time}.
        Espacio: ${formData.space}.
        Materiales: ${formData.hasMaterials === 'con' ? 'Con materiales diversos' : 'Sin materiales (usar propio cuerpo e imaginación)'}.
        Tema: ${formData.topic || 'A discreción de la IA'}.
        
        Sigue la estructura del CNEB: Datos, Propósito, Inicio/Activación, Desarrollo/Principal, Cierre/Metacognición.`;

        try {
            const response = await generateLessonPlan(prompt);
            setResult(response);
            setStep(7); // Jump to result/editor step
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

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <StepCard title="1️⃣ Seleccionar Nivel" onNext={formData.level ? handleNext : null}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            {LEVELS.map(l => (
                                <button
                                    key={l.id}
                                    className={`glass selectable-card ${formData.level === l.id ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, level: l.id, grade: '' })}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>{l.icon}</span>
                                    <span>{l.label}</span>
                                </button>
                            ))}
                        </div>
                    </StepCard>
                );
            case 2:
                return (
                    <StepCard title="2️⃣ Seleccionar Grado" onNext={formData.grade ? handleNext : null} onBack={handleBack}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                            {GRADES_BY_LEVEL[formData.level]?.map(g => (
                                <button
                                    key={g.value}
                                    className={`glass selectable-card ${formData.grade === g.value ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, grade: g.value })}
                                >
                                    <span>{g.label}</span>
                                </button>
                            ))}
                        </div>
                    </StepCard>
                );
            case 3:
                return (
                    <StepCard title="3️⃣ Seleccionar Competencia" onNext={handleNext} onBack={handleBack}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {COMPETENCIAS.map(c => (
                                <button
                                    key={c}
                                    className={`glass selectable-card ${formData.competencia === c ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, competencia: c })}
                                    style={{ textAlign: 'left', padding: '1rem' }}
                                >
                                    <span style={{ fontSize: '0.85rem' }}>{c}</span>
                                </button>
                            ))}
                        </div>
                    </StepCard>
                );
            case 4:
                return (
                    <StepCard title="4️⃣ Elegir Tiempo" onNext={handleNext} onBack={handleBack}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {TIMES.map(t => (
                                <button
                                    key={t}
                                    className={`glass selectable-card ${formData.time === t ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, time: t })}
                                >
                                    <Clock size={24} />
                                    <span>{t}</span>
                                </button>
                            ))}
                        </div>
                    </StepCard>
                );
            case 5:
                return (
                    <StepCard title="5️⃣ Elegir Espacio" onNext={handleNext} onBack={handleBack}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            {SPACES.map(s => (
                                <button
                                    key={s.id}
                                    className={`glass selectable-card ${formData.space === s.id ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, space: s.id })}
                                >
                                    <span>{s.icon}</span>
                                    <span>{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </StepCard>
                );
            case 6:
                return (
                    <StepCard
                        title="6️⃣ Materiales y Tema"
                        onNext={handleGenerate}
                        onBack={handleBack}
                        nextLabel={loading ? "GENERANDO..." : "GENERAR BORRADOR"}
                        nextIcon={loading ? <Loader2 className="spin" size={18} /> : <Zap size={18} />}
                    >
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">¿Contarás con materiales?</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button
                                    className={`glass selectable-card ${formData.hasMaterials === 'con' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, hasMaterials: 'con' })}
                                >
                                    Con materiales
                                </button>
                                <button
                                    className={`glass selectable-card ${formData.hasMaterials === 'sin' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, hasMaterials: 'sin' })}
                                >
                                    Sin materiales
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tema específico (opcional)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Ej: Fútbol, Salto largo, Coordinación..."
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            />
                        </div>
                    </StepCard>
                );
            case 7:
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem' }}>Editor de Sesión</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={handleCopy} className="btn-icon" title="Copiar"><Copy size={18} /></button>
                                    <button className="btn-icon" title="Descargar PDF"><Download size={18} /></button>
                                </div>
                            </div>
                            <textarea
                                className="form-textarea"
                                style={{ minHeight: '400px', fontSize: '0.9rem', lineHeight: '1.6', background: 'transparent', border: 'none', padding: 0 }}
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button className="btn btn-secondary" onClick={() => setStep(1)}><ArrowLeft size={16} /> NUEVA</button>
                            <button className="btn btn-primary"><Save size={16} /> GUARDAR</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <button className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.05)' }}><Share2 size={16} /> COMPARTIR</button>
                            <button onClick={handleGenerate} className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.05)' }}><Zap size={16} /> REGENERAR</button>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {step < 7 && (
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>PASO {step} DE 6</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round((step / 6) * 100)}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--glass-bg)', borderRadius: '2px', overflow: 'hidden' }}>
                        <motion.div
                            style={{ height: '100%', background: 'var(--color-primary)' }}
                            animate={{ width: `${(step / 6) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                <div key={step}>
                    {renderStep()}
                </div>
            </AnimatePresence>

            <style>{`
                .selectable-card {
                    padding: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 1px solid var(--glass-border);
                    text-align: left;
                }
                .selectable-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.2);
                }
                .selectable-card.active {
                    background: var(--color-primary-glow);
                    border-color: var(--color-primary);
                    color: var(--color-primary);
                }
                .selectable-card span {
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}

function StepCard({ title, children, onNext, onBack, nextLabel = "Siguiente", nextIcon = <ChevronRight size={18} /> }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}>{title}</h2>
            <div style={{ marginBottom: '2rem' }}>
                {children}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                {onBack && (
                    <button className="btn btn-secondary" onClick={onBack} style={{ flex: 1 }}>
                        <ArrowLeft size={18} /> Atrás
                    </button>
                )}
                <button
                    className="btn btn-primary"
                    onClick={onNext}
                    disabled={!onNext}
                    style={{ flex: 2, opacity: onNext ? 1 : 0.5 }}
                >
                    {nextLabel} {nextIcon}
                </button>
            </div>
        </motion.div>
    );
}

export default Generator;
