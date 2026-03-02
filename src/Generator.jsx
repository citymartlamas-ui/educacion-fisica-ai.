import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Loader2, ClipboardCheck, Dumbbell,
    GraduationCap, BookOpen, Clock, Package, MapPin,
    Users, ChevronDown, Zap, FileText, Download,
    School, UserCheck, Star
} from 'lucide-react';
import { generateLessonPlan } from './gemini';

const GRADES = [
    { value: 'inicial-3', label: 'Inicial - 3 años', group: 'Inicial' },
    { value: 'inicial-4', label: 'Inicial - 4 años', group: 'Inicial' },
    { value: 'inicial-5', label: 'Inicial - 5 años', group: 'Inicial' },
    { value: '1-primaria', label: '1° Primaria', group: 'Primaria' },
    { value: '2-primaria', label: '2° Primaria', group: 'Primaria' },
    { value: '3-primaria', label: '3° Primaria', group: 'Primaria' },
    { value: '4-primaria', label: '4° Primaria', group: 'Primaria' },
    { value: '5-primaria', label: '5° Primaria', group: 'Primaria' },
    { value: '6-primaria', label: '6° Primaria', group: 'Primaria' },
    { value: '1-secundaria', label: '1° Secundaria', group: 'Secundaria' },
    { value: '2-secundaria', label: '2° Secundaria', group: 'Secundaria' },
    { value: '3-secundaria', label: '3° Secundaria', group: 'Secundaria' },
    { value: '4-secundaria', label: '4° Secundaria', group: 'Secundaria' },
    { value: '5-secundaria', label: '5° Secundaria', group: 'Secundaria' },
];

const COMPETENCIAS = [
    'Se desenvuelve de manera autónoma a través de su motricidad',
    'Asume una vida saludable',
    'Interactúa a través de sus habilidades sociomotrices',
];

const TOPICS = [
    'Coordinación motriz', 'Equilibrio estático y dinámico', 'Velocidad y agilidad',
    'Fútbol', 'Vóleibol', 'Básquetbol', 'Atletismo', 'Gimnasia',
    'Juegos cooperativos', 'Juegos predeportivos', 'Expresión corporal',
    'Capacidades físicas', 'Lateralidad', 'Orientación espacial',
    'Salto largo', 'Lanzamiento', 'Carrera de relevos',
];

const MATERIALS_LIST = [
    { icon: '⚽', name: 'Balones', id: 'balones' },
    { icon: '🔶', name: 'Conos', id: 'conos' },
    { icon: '🪢', name: 'Cuerdas', id: 'cuerdas' },
    { icon: '🏐', name: 'Pelotas', id: 'pelotas' },
    { icon: '🎽', name: 'Petos/Chalecos', id: 'petos' },
    { icon: '🪄', name: 'Bastones', id: 'bastones' },
    { icon: '🏃', name: 'Vallas', id: 'vallas' },
    { icon: '🥏', name: 'Aros', id: 'aros' },
    { icon: '🎯', name: 'Colchonetas', id: 'colchonetas' },
    { icon: '🧱', name: 'Bloques', id: 'bloques' },
    { icon: '📏', name: 'Cintas métricas', id: 'cintas' },
    { icon: '🎵', name: 'Parlante/Música', id: 'musica' },
];

const DURATIONS = ['30 min', '40 min', '45 min', '50 min', '60 min', '80 min', '90 min'];

function Generator() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);
    const [activeTopicInput, setActiveTopicInput] = useState('');
    const [formData, setFormData] = useState({
        // Datos institucionales
        institucion: '',
        ugel: '',
        dre: '',
        docente: '',
        director: '',
        anioLectivo: new Date().getFullYear().toString(),
        situacionSignificativa: '',
        // Datos de sesión
        grade: '',
        competencia: '',
        topic: '',
        customTopic: '',
        materials: [],
        customMaterials: '',
        duration: '45 min',
        students: '30',
        space: 'patio',
        notes: ''
    });

    const toggleMaterial = (id) => {
        setFormData(prev => ({
            ...prev,
            materials: prev.materials.includes(id)
                ? prev.materials.filter(m => m !== id)
                : [...prev.materials, id]
        }));
    };

    const getSelectedGradeLabel = () => {
        const found = GRADES.find(g => g.value === formData.grade);
        return found ? found.label : '';
    };

    const handleGenerate = async () => {
        const topic = formData.topic || formData.customTopic;
        if (!topic || !formData.grade) return;
        setLoading(true);

        const selectedMaterials = formData.materials
            .map(id => MATERIALS_LIST.find(m => m.id === id)?.name)
            .filter(Boolean);

        const allMaterials = [...selectedMaterials];
        if (formData.customMaterials.trim()) {
            allMaterials.push(formData.customMaterials.trim());
        }

        const prompt = `Eres un experto docente de Educación Física en Perú, especializado en el Currículo Nacional. Genera una sesión de aprendizaje detallada y profesional con las siguientes especificaciones:

🏫 DATOS INSTITUCIONALES:
- Institución Educativa: ${formData.institucion || 'No especificada'}
- UGEL: ${formData.ugel || 'No especificada'}
- DRE: ${formData.dre || 'No especificada'}
- Docente: ${formData.docente || 'No especificado'}
- Director(a): ${formData.director || 'No especificado'}
- Año Lectivo: ${formData.anioLectivo}
${formData.situacionSignificativa ? `- Situación Significativa: ${formData.situacionSignificativa}` : ''}

📋 DATOS DE LA SESIÓN:
- Grado/Nivel: ${getSelectedGradeLabel()}
- Competencia: ${formData.competencia || 'A criterio del docente'}
- Tema/Actividad: ${topic}
- Duración: ${formData.duration}
- N° de estudiantes: ${formData.students} aproximadamente
- Espacio: ${formData.space === 'patio' ? 'Patio/Campo abierto' : formData.space === 'salon' ? 'Salón/Aula' : 'Gimnasio/Polideportivo'}
- Materiales disponibles: ${allMaterials.length > 0 ? allMaterials.join(', ') : 'Ninguno especificado (adaptar sin materiales)'}
${formData.notes ? `- Observaciones del docente: ${formData.notes}` : ''}

📝 ESTRUCTURA REQUERIDA:
La sesión DEBE incluir las siguientes secciones bien diferenciadas:

1. **DATOS INFORMATIVOS** (tabla resumen con todos los datos institucionales y de la sesión arriba indicados)
2. **SITUACIÓN SIGNIFICATIVA** (contextualización del aprendizaje${formData.situacionSignificativa ? ` usando la situación significativa indicada: ${formData.situacionSignificativa}` : ''})
3. **PROPÓSITO DE APRENDIZAJE** (competencia, capacidades, desempeños, enfoque transversal)
4. **INICIO / CALENTAMIENTO** (10-15 min): motivación, saberes previos, juego de activación
5. **DESARROLLO** (20-30 min): actividades principales con variantes por dificultad, explicaciones claras paso a paso
6. **CIERRE / VUELTA A LA CALMA** (5-10 min): estiramiento, reflexión, metacognición con preguntas orientadoras
7. **EVALUACIÓN**: criterios observables

Usa un lenguaje profesional, motivador. Incluye variantes para estudiantes con diferentes niveles de habilidad. Los tiempos deben sumar la duración total indicada.`;

        const response = await generateLessonPlan(prompt);
        setResult(response);
        setLoading(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isFormValid = (formData.topic || formData.customTopic) && formData.grade;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
                <div style={{
                    width: '48px', height: '48px',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white'
                }}>
                    <Sparkles size={24} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '0.15rem' }}>Generador de Sesiones</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Crea sesiones completas alineadas al Currículo Nacional</p>
                </div>
            </motion.div>

            {/* Form */}
            <motion.div
                className="glass-static"
                style={{ padding: '2rem' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {/* Section 0: Datos Institucionales */}
                <SectionTitle icon={<School size={16} />} title="Datos Institucionales" number="00" />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">🏫 Institución Educativa</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: I.E. N° 2087 República Oriental del Uruguay"
                            value={formData.institucion}
                            onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">📅 Año Lectivo</label>
                        <select
                            className="form-select"
                            value={formData.anioLectivo}
                            onChange={(e) => setFormData({ ...formData, anioLectivo: e.target.value })}
                        >
                            {['2023', '2024', '2025', '2026', '2027'].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">🏛️ UGEL</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: UGEL 02 Rímac"
                            value={formData.ugel}
                            onChange={(e) => setFormData({ ...formData, ugel: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">📍 DRE</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: DRE Lima Metropolitana"
                            value={formData.dre}
                            onChange={(e) => setFormData({ ...formData, dre: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">👨‍🏫 Nombre del Docente</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Prof. Juan Pérez García"
                            value={formData.docente}
                            onChange={(e) => setFormData({ ...formData, docente: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">🎓 Nombre del Director(a)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Dir. María López Quispe"
                            value={formData.director}
                            onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label className="form-label">✨ Situación Significativa</label>
                    <textarea
                        className="form-textarea"
                        placeholder="Ej: Los estudiantes del colegio han notado que muchos de sus compañeros prefieren el tiempo libre frente a pantallas. A través de actividades lúdicas y deportivas, buscaremos despertar el amor por el movimiento y la vida saludable..."
                        value={formData.situacionSignificativa}
                        onChange={(e) => setFormData({ ...formData, situacionSignificativa: e.target.value })}
                        style={{ minHeight: '90px' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                        💡 La situación significativa contextualiza el aprendizaje y le da sentido a la sesión.
                    </p>
                </div>

                {/* Section 1: Info Básica */}
                <SectionTitle icon={<GraduationCap size={16} />} title="Información Básica" number="01" />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="form-group">
                        <label className="form-label">Grado / Nivel *</label>
                        <select
                            className="form-select"
                            value={formData.grade}
                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        >
                            <option value="">Seleccionar grado...</option>
                            <optgroup label="🌱 Inicial">
                                {GRADES.filter(g => g.group === 'Inicial').map(g => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="📚 Primaria">
                                {GRADES.filter(g => g.group === 'Primaria').map(g => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="🎓 Secundaria">
                                {GRADES.filter(g => g.group === 'Secundaria').map(g => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Competencia</label>
                        <select
                            className="form-select"
                            value={formData.competencia}
                            onChange={(e) => setFormData({ ...formData, competencia: e.target.value })}
                        >
                            <option value="">Seleccionar...</option>
                            {COMPETENCIAS.map((c, i) => (
                                <option key={i} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Section 2: Tema */}
                <SectionTitle icon={<BookOpen size={16} />} title="Tema de la Sesión" number="02" />

                <div style={{ marginBottom: '2rem' }}>
                    <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
                        Selecciona un tema o escribe uno personalizado *
                    </label>
                    <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem'
                    }}>
                        {TOPICS.map((topic) => (
                            <button
                                key={topic}
                                onClick={() => setFormData({ ...formData, topic: topic, customTopic: '' })}
                                style={{
                                    padding: '0.4rem 0.85rem',
                                    borderRadius: 'var(--radius-full)',
                                    border: `1px solid ${formData.topic === topic ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                                    background: formData.topic === topic ? 'var(--color-primary-glow)' : 'transparent',
                                    color: formData.topic === topic ? 'var(--color-primary)' : 'var(--text-secondary)',
                                    fontSize: '0.8rem',
                                    fontWeight: formData.topic === topic ? 600 : 400,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'Inter, sans-serif'
                                }}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="O escribe tu propio tema aquí..."
                        value={formData.customTopic}
                        onChange={(e) => setFormData({ ...formData, customTopic: e.target.value, topic: '' })}
                    />
                </div>

                {/* Section 3: Materiales */}
                <SectionTitle icon={<Package size={16} />} title="Materiales Disponibles" number="03" />

                <div style={{ marginBottom: '2rem' }}>
                    <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
                        Marca los materiales que tienes (la IA adaptará la sesión)
                    </label>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        {MATERIALS_LIST.map((mat) => {
                            const isSelected = formData.materials.includes(mat.id);
                            return (
                                <button
                                    key={mat.id}
                                    onClick={() => toggleMaterial(mat.id)}
                                    style={{
                                        padding: '0.6rem 0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: `1px solid ${isSelected ? 'var(--color-secondary)' : 'var(--glass-border)'}`,
                                        background: isSelected ? 'var(--color-secondary-glow)' : 'var(--color-surface)',
                                        color: isSelected ? 'var(--color-secondary)' : 'var(--text-secondary)',
                                        fontSize: '0.8rem',
                                        fontWeight: isSelected ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontFamily: 'Inter, sans-serif',
                                        textAlign: 'left'
                                    }}
                                >
                                    <span style={{ fontSize: '1rem' }}>{mat.icon}</span>
                                    {mat.name}
                                </button>
                            );
                        })}
                    </div>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Otros materiales no listados..."
                        value={formData.customMaterials}
                        onChange={(e) => setFormData({ ...formData, customMaterials: e.target.value })}
                    />
                </div>

                {/* Section 4: Configuración */}
                <SectionTitle icon={<Clock size={16} />} title="Configuración" number="04" />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="form-group">
                        <label className="form-label">Duración</label>
                        <select
                            className="form-select"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        >
                            {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">N° Estudiantes</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.students}
                            onChange={(e) => setFormData({ ...formData, students: e.target.value })}
                            min="5"
                            max="50"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Espacio</label>
                        <select
                            className="form-select"
                            value={formData.space}
                            onChange={(e) => setFormData({ ...formData, space: e.target.value })}
                        >
                            <option value="patio">🏟️ Patio/Campo</option>
                            <option value="salon">🏫 Salón/Aula</option>
                            <option value="gimnasio">🏋️ Gimnasio</option>
                        </select>
                    </div>
                </div>

                {/* Optional Notes */}
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label className="form-label">Observaciones adicionales (opcional)</label>
                    <textarea
                        className="form-textarea"
                        placeholder="Ej: Hay 2 estudiantes con discapacidad motriz, el grupo es muy inquieto, quiero enfatizar el trabajo en equipo..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        style={{ minHeight: '80px' }}
                    />
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={loading || !isFormValid}
                    className="btn btn-primary btn-lg w-full"
                    style={{
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1rem',
                        opacity: (!isFormValid && !loading) ? 0.5 : 1
                    }}
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                            GENERANDO TU SESIÓN...
                        </>
                    ) : (
                        <>
                            <Zap size={20} />
                            GENERAR SESIÓN DE APRENDIZAJE
                        </>
                    )}
                </button>

                {!isFormValid && (
                    <p style={{
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        marginTop: '0.75rem'
                    }}>
                        * Selecciona un grado y un tema para generar
                    </p>
                )}
            </motion.div>

            {/* Results */}
            <AnimatePresence>
                {(result || loading) && (
                    <motion.div
                        className="glass-static"
                        style={{ padding: '2rem' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        {loading ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem 1rem'
                            }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    style={{ display: 'inline-block', marginBottom: '1rem' }}
                                >
                                    <Dumbbell size={40} style={{ color: 'var(--color-primary)' }} />
                                </motion.div>
                                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Creando tu sesión...</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    La IA está diseñando una sesión personalizada para ti
                                </p>
                                <div style={{
                                    width: '200px',
                                    height: '4px',
                                    background: 'var(--color-surface-2)',
                                    borderRadius: '2px',
                                    margin: '1.5rem auto 0',
                                    overflow: 'hidden'
                                }}>
                                    <motion.div
                                        style={{
                                            height: '100%',
                                            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                                            borderRadius: '2px',
                                        }}
                                        animate={{ width: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Result Header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1.5rem',
                                    paddingBottom: '1rem',
                                    borderBottom: '1px solid var(--glass-border)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{
                                            padding: '0.3rem 0.7rem',
                                            background: 'var(--color-secondary-glow)',
                                            border: '1px solid rgba(57, 255, 20, 0.3)',
                                            borderRadius: 'var(--radius-sm)',
                                            color: 'var(--color-secondary)',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            letterSpacing: '1px',
                                            fontFamily: 'Orbitron, monospace'
                                        }}>
                                            ✅ SESIÓN GENERADA
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            {getSelectedGradeLabel()} • {formData.topic || formData.customTopic}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={handleCopy} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                                            <ClipboardCheck size={14} />
                                            {copied ? '¡Copiado!' : 'Copiar'}
                                        </button>
                                    </div>
                                </div>

                                {/* Result Content */}
                                <div style={{
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.8,
                                    fontSize: '0.9rem'
                                }}>
                                    {result.split('\n').map((line, i) => {
                                        if (!line.trim()) return <br key={i} />;
                                        if (line.startsWith('**') && line.endsWith('**')) {
                                            return <h3 key={i} style={{ color: 'var(--color-primary)', marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1rem' }}>{line.replace(/\*\*/g, '')}</h3>;
                                        }
                                        if (line.includes('**')) {
                                            return (
                                                <p key={i} style={{ marginBottom: '0.4rem' }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary)">$1</strong>')
                                                    }}
                                                />
                                            );
                                        }
                                        return <p key={i} style={{ marginBottom: '0.4rem' }}>{line}</p>;
                                    })}
                                </div>

                                {/* Actions */}
                                <div style={{
                                    display: 'flex', gap: '0.75rem', marginTop: '2rem',
                                    paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)'
                                }}>
                                    <button onClick={handleGenerate} className="btn btn-secondary" style={{ flex: 1 }}>
                                        <Sparkles size={16} /> Regenerar
                                    </button>
                                    <button onClick={handleCopy} className="btn btn-primary" style={{ flex: 1 }}>
                                        <ClipboardCheck size={16} /> {copied ? '¡Copiado!' : 'Copiar Sesión'}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* Section Title Component */
function SectionTitle({ icon, title, number }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--glass-border)'
        }}>
            <span style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                background: 'var(--color-primary-glow)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)'
            }}>
                {number}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
            <span style={{
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'var(--text-primary)'
            }}>
                {title}
            </span>
        </div>
    );
}

export default Generator;
