import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, ArrowLeft, Plus, Download, FileText, Check,
    ChevronRight, Edit3, Trash2, CheckCircle2,
    Sparkles, Loader2, Save, Building2, User, BookOpen, Layers, Target, Activity
} from 'lucide-react';
import { generateLessonPlan } from './gemini';

const STEPS = [
    'Datos Informativos',
    'Justificación y Perfil',
    'Calendarización',
    'Transversales',
    'Tutoría (TOE)',
    'Evaluación y Recursos',
    'Generar Plan'
];

const PlanAnualPage = ({ onNavigate, user }) => {
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [currentStep, setCurrentStep] = useState(0);
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState('');

    const [formData, setFormData] = useState({
        modalidad: 'EBR - Educación Básica Regular',
        generarPor: 'Grado',
        nivel: 'Secundaria',
        grado: 'Tercero',
        area: 'Educación Física',
        ie: '',
        director: '',
        subdirector: '',
        docente: '',
        anio: new Date().getFullYear().toString(),
        contexto: '',
        justificacion: '',
        perfilEgreso: '',
        divisionAno: 'Bimestres',
        semanasLectivas: 38,
        unidades: [
            { id: 1, periodo: 1, titulo: 'Evaluación Diagnóstica y Medidas Antropométricas', fechaInicio: '', fechaFin: '' },
        ],
        enfoques: [],
        dimensionesTutoria: [],
        actividadesTutoria: '',
        evaluacion: 'Evaluación Formativa (Listas de cotejo, rúbricas de evaluación, fichas de observación, autoevaluación y coevaluación).',
        recursos: 'Material deportivo estructurado y no estructurado, patios, losas deportivas, silbatos, cronómetros.'
    });

    const [plans, setPlans] = useState([
        { id: '1', title: 'Planización Anual 2026 - Primaria', level: '1ero a 6to Primaria', lastModified: '2026-02-28', status: 'En Progreso' },
        { id: '2', title: 'Programación Curricular - Secundaria', level: '1ero a 5to Secundaria', lastModified: '2026-01-15', status: 'Completado' },
    ]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const toggleArrayItem = (field, value) => {
        setFormData(prev => {
            const arr = prev[field];
            if (arr.includes(value)) {
                return { ...prev, [field]: arr.filter(i => i !== value) };
            } else {
                return { ...prev, [field]: [...arr, value] };
            }
        });
    };

    const addUnidad = (periodoIndex) => {
        setFormData(prev => ({
            ...prev,
            unidades: [
                ...prev.unidades,
                { id: Date.now(), periodo: periodoIndex, titulo: '', fechaInicio: '', fechaFin: '' }
            ]
        }));
    };

    const updateUnidad = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            unidades: prev.unidades.map(u => u.id === id ? { ...u, [field]: value } : u)
        }));
    };

    const removeUnidad = (id) => {
        setFormData(prev => ({
            ...prev,
            unidades: prev.unidades.filter(u => u.id !== id)
        }));
    };

    const handleGenerate = async () => {
        setGenerating(true);
        const prompt = `Actúa como un planificador experto del Ministerio de Educación de Perú. Genera el PLAN ANUAL DE EDUCACIÓN FÍSICA en formato Markdown muy profesional, estético y estructurado.
        
        Usa estrictamente esta información para el desarrollo:
        I. DATOS INFORMATIVOS:
        - I.E: ${formData.ie || 'No especificada'}
        - Nivel: ${formData.nivel}, Grado: ${formData.grado}, Modalidad: ${formData.modalidad}
        - Director: ${formData.director || 'No especificado'}, Subdirector: ${formData.subdirector || 'No especificado'}, Docente: ${formData.docente || 'No especificado'}
        - Año: ${formData.anio}.
        - Contexto y Realidad: ${formData.contexto || 'Se considerará la diversidad del aula.'}

        II. JUSTIFICACIÓN Y PERFIL DE EGRESO:
        - Justificación: ${formData.justificacion || 'Enfoque de corporeidad y salud integral.'}
        - Perfil de Egreso: ${formData.perfilEgreso || 'Estudiante autónomo, crítico, con hábitos de vida saludable.'}

        III. ENFOQUES TRANSVERSALES:
        Los seleccionados son: ${formData.enfoques.length > 0 ? formData.enfoques.join(', ') : 'No especificados (Sugerir los más pertinentes al área)'}.

        IV. ORGANIZACIÓN DEL TIEMPO Y UNIDADES:
        (Redactar en formato de tabla o viñetas muy limpias)
        - Se divide en ${formData.divisionAno}, ${formData.semanasLectivas} semanas lectivas en total.
        Distribución de Unidades:
        ${formData.unidades.map(u => `- ${formData.divisionAno.slice(0, -1)} ${u.periodo}: "${u.titulo}" (Desde: ${u.fechaInicio || 'no especificado'} Hasta: ${u.fechaFin || 'no especificado'})`).join('\n')}

        V. TUTORÍA Y ORIENTACIÓN EDUCATIVA (TOE):
        - Dimensiones: ${formData.dimensionesTutoria.join(', ') || 'Todas las pertinentes'}.
        - Actividades sugeridas: ${formData.actividadesTutoria || 'Talleres de convivencia y prevención.'}

        VI. EVALUACIÓN Y RECURSOS:
        - Evaluación: ${formData.evaluacion}
        - Recursos y Materiales: ${formData.recursos}

        Genera el documento completo, desarrollando todo con lenguaje oficial pedagógico alineado al CNEB 2026. Usa tablas markdown si mejora la presentación.`;

        try {
            const res = await generateLessonPlan(prompt);
            setResult(res);
            setCurrentStep(7); // Show result
        } catch (error) {
            console.error("Error generating plan", error);
        } finally {
            setGenerating(false);
        }
    };

    // -- Sub-components for Steps --

    const Step1Datos = () => (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Modalidad</label>
                    <select className="form-select" value={formData.modalidad} onChange={e => setFormData({ ...formData, modalidad: e.target.value })}>
                        <option>EBR - Educación Básica Regular</option>
                        <option>EBE - Educación Básica Especial</option>
                        <option>EBA - Educación Básica Alternativa</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Nivel</label>
                    <select className="form-select" value={formData.nivel} onChange={e => setFormData({ ...formData, nivel: e.target.value })}>
                        <option>Inicial</option>
                        <option>Primaria</option>
                        <option>Secundaria</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Grado</label>
                    <select className="form-select" value={formData.grado} onChange={e => setFormData({ ...formData, grado: e.target.value })}>
                        <option>Primero</option>
                        <option>Segundo</option>
                        <option>Tercero</option>
                        <option>Cuarto</option>
                        <option>Quinto</option>
                        <option>Sexto</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Institución Educativa</label>
                    <div style={{ position: 'relative' }}>
                        <Building2 size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="Nombre de la I.E." value={formData.ie} onChange={e => setFormData({ ...formData, ie: e.target.value })} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Docente Responsable</label>
                    <div style={{ position: 'relative' }}>
                        <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="Tu nombre" value={formData.docente} onChange={e => setFormData({ ...formData, docente: e.target.value })} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Director(a)</label>
                    <input type="text" className="form-input" placeholder="Nombre" value={formData.director} onChange={e => setFormData({ ...formData, director: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Subdirector(a)</label>
                    <input type="text" className="form-input" placeholder="Nombre (opcional)" value={formData.subdirector} onChange={e => setFormData({ ...formData, subdirector: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Año Lectivo</label>
                    <input type="text" className="form-input" value={formData.anio} onChange={e => setFormData({ ...formData, anio: e.target.value })} />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Realidad de la Localidad (Contexto)</label>
                <textarea className="form-textarea" placeholder="Describe brevemente el entorno socioeconómico y cultural de los estudiantes..." value={formData.contexto} onChange={e => setFormData({ ...formData, contexto: e.target.value })} style={{ minHeight: '100px' }} />
            </div>
        </div>
    );

    const Step2Justificacion = () => (
        <div style={{ display: 'grid', gap: '2rem' }}>
            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Justificación del Área</label>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <Sparkles size={12} /> Sugerir con IA
                    </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Explica la importancia de la Educación Física para este grupo en este año escolar.</p>
                <textarea className="form-textarea" placeholder="Ej: La presente planificación busca desarrollar la corporeidad..." value={formData.justificacion} onChange={e => setFormData({ ...formData, justificacion: e.target.value })} style={{ minHeight: '150px' }} />
            </div>

            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Perfil de Egreso (Vinculación)</label>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <Sparkles size={12} /> Sugerir con IA
                    </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>¿Cómo aporta el área este año a los rasgos del perfil de egreso?</p>
                <textarea className="form-textarea" placeholder="Ej: El estudiante afirma su identidad, practica la vida activa y saludable..." value={formData.perfilEgreso} onChange={e => setFormData({ ...formData, perfilEgreso: e.target.value })} style={{ minHeight: '150px' }} />
            </div>
        </div>
    );

    const Step3Calendario = () => {
        const periodos = formData.divisionAno === 'Bimestres' ? 4 : 3;

        return (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div className="glass-static" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">División del Año</label>
                        <select className="form-select" value={formData.divisionAno} onChange={e => setFormData({ ...formData, divisionAno: e.target.value, unidades: [] })}>
                            <option>Bimestres</option>
                            <option>Trimestres</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Semanas Lectivas (Total)</label>
                        <input type="number" className="form-input" value={formData.semanasLectivas} onChange={e => setFormData({ ...formData, semanasLectivas: Number(e.target.value) })} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Array.from({ length: periodos }).map((_, i) => {
                        const periodoNum = i + 1;
                        const unidadesDelPeriodo = formData.unidades.filter(u => u.periodo === periodoNum);
                        const labelPeriodo = formData.divisionAno.slice(0, -1);

                        return (
                            <div key={periodoNum} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{labelPeriodo} {periodoNum}</h4>
                                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => addUnidad(periodoNum)}>
                                        <Plus size={14} /> Añadir Unidad
                                    </button>
                                </div>

                                {unidadesDelPeriodo.length === 0 ? (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin unidades. Añade una para comenzar.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {unidadesDelPeriodo.map((u, index) => (
                                            <div key={u.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Título de la Unidad</label>
                                                        <button
                                                            className="btn btn-secondary"
                                                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', gap: '0.3rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'none' }}
                                                            title="Sugerir Título con IA"
                                                        >
                                                            <Sparkles size={10} /> Sugerir
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder={`Título de la Unidad ${index + 1}`}
                                                        value={u.titulo}
                                                        onChange={e => updateUnidad(u.id, 'titulo', e.target.value)}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>De:</span>
                                                    <input
                                                        type="date"
                                                        className="form-input"
                                                        style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                                                        value={u.fechaInicio || ''}
                                                        onChange={e => updateUnidad(u.id, 'fechaInicio', e.target.value)}
                                                    />
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>a:</span>
                                                    <input
                                                        type="date"
                                                        className="form-input"
                                                        style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                                                        value={u.fechaFin || ''}
                                                        onChange={e => updateUnidad(u.id, 'fechaFin', e.target.value)}
                                                    />
                                                </div>
                                                <button onClick={() => removeUnidad(u.id)} className="btn-icon" style={{ padding: '0.8rem', color: 'var(--color-danger)', border: '1px solid var(--glass-border)' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const enfoquesList = [
        { name: 'De Derecho', desc: 'Conciencia de derechos, Libertad y responsabilidad, Diálogo y concertación' },
        { name: 'Inclusivo', desc: 'Respeto por las diferencias, Equidad en la enseñanza, Confianza en la persona' },
        { name: 'Intercultural', desc: 'Respeto a la identidad cultural, Justicia, Diálogo intercultural' },
        { name: 'Igualdad de Género', desc: 'Igualdad y Dignidad, Justicia, Empatía' },
        { name: 'Ambiental', desc: 'Solidaridad planetaria, Justicia y solidaridad, Respeto a toda forma de vida' },
        { name: 'Orientación al Bien Común', desc: 'Equidad y justicia, Solidaridad, Empatía, Responsabilidad' },
        { name: 'Búsqueda de la Excelencia', desc: 'Flexibilidad y apertura, Superación personal' }
    ];

    const Step4Enfoques = () => (
        <div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Selecciona los enfoques transversales a priorizar durante el año.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {enfoquesList.map(enf => (
                    <label key={enf.name} style={{
                        display: 'flex', flexDirection: 'column', gap: '0.5rem',
                        background: formData.enfoques.includes(enf.name) ? 'var(--color-primary-glow)' : 'var(--glass-bg)',
                        border: `1px solid ${formData.enfoques.includes(enf.name) ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                        padding: '1.25rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                                type="checkbox"
                                style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--color-primary)' }}
                                checked={formData.enfoques.includes(enf.name)}
                                onChange={() => toggleArrayItem('enfoques', enf.name)}
                            />
                            <span style={{ fontWeight: formData.enfoques.includes(enf.name) ? 700 : 600, color: formData.enfoques.includes(enf.name) ? 'var(--color-primary)' : 'var(--text-primary)' }}>{enf.name}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: formData.enfoques.includes(enf.name) ? 'var(--text-primary)' : 'var(--text-muted)', marginLeft: '2rem', lineHeight: 1.4 }}>
                            {enf.desc}
                        </p>
                    </label>
                ))}
            </div>
        </div>
    );

    const dimensionesList = [
        { name: 'Personal', sub: 'Autoconocimiento, identidad' },
        { name: 'Social', sub: 'Convivencia, relaciones' },
        { name: 'De los Aprendizajes', sub: 'Técnicas, motivación' },
        { name: 'Vocacional', sub: 'Proyecto de vida' },
        { name: 'Salud Corporal y Mental', sub: 'Hábitos, salud' },
        { name: 'Cultura y Actualidad', sub: 'Identidad, noticias' }
    ];

    const Step5Tutoria = () => (
        <div style={{ display: 'grid', gap: '2rem' }}>
            <div>
                <h4 style={{ marginBottom: '1rem', color: 'white' }}>Dimensiones de la Tutoría (TOE)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
                    {dimensionesList.map(dim => (
                        <label key={dim.name} style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                            background: formData.dimensionesTutoria.includes(dim.name) ? 'rgba(52, 211, 153, 0.1)' : 'var(--glass-bg)',
                            border: `1px solid ${formData.dimensionesTutoria.includes(dim.name) ? '#34d399' : 'var(--glass-border)'}`,
                            padding: '1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                style={{ marginTop: '0.2rem', accentColor: '#34d399' }}
                                checked={formData.dimensionesTutoria.includes(dim.name)}
                                onChange={() => toggleArrayItem('dimensionesTutoria', dim.name)}
                            />
                            <div>
                                <span style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: formData.dimensionesTutoria.includes(dim.name) ? '#34d399' : 'white' }}>{dim.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dim.sub}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Actividades y Estrategias del Docente</label>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <Sparkles size={12} /> Sugerir con IA
                    </button>
                </div>
                <textarea className="form-textarea" placeholder="Narra las estrategias generales de tutoría..." value={formData.actividadesTutoria} onChange={e => setFormData({ ...formData, actividadesTutoria: e.target.value })} style={{ minHeight: '100px' }} />
            </div>
        </div>
    );

    const Step6Evaluacion = () => (
        <div style={{ display: 'grid', gap: '2rem' }}>
            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Lineamientos de Evaluación</label>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <Sparkles size={12} /> Sugerir con IA
                    </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Establece cómo se evaluará a los estudiantes a lo largo del año (Formativa, Sumativa, Instrumentos).</p>
                <textarea className="form-textarea" value={formData.evaluacion} onChange={e => setFormData({ ...formData, evaluacion: e.target.value })} style={{ minHeight: '120px' }} />
            </div>

            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Recursos y Materiales Generales</label>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <Sparkles size={12} /> Sugerir con IA
                    </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>¿Qué implementos usarás primordialmente en el año?</p>
                <textarea className="form-textarea" value={formData.recursos} onChange={e => setFormData({ ...formData, recursos: e.target.value })} style={{ minHeight: '120px' }} />
            </div>
        </div>
    );

    // Main View Render
    if (view === 'list') {
        return (
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
                <header style={{ marginBottom: '3rem' }}>
                    <button className="btn btn-secondary" onClick={() => onNavigate('tools')} style={{ marginBottom: '2rem' }}>
                        <ArrowLeft size={16} /> Volver
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Plan <span className="text-gradient">Anual Maestro</span></h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Generador avanzado de planificación curricular para Educación Física.</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setView('create')}>
                            <Plus size={18} /> Nuevo Plan Anual
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
                        </motion.div>
                    ))}

                    <button
                        className="glass"
                        style={{ padding: '3rem', border: '2px dashed var(--glass-border)', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                        onClick={() => setView('create')}
                    >
                        <Plus size={32} />
                        <span>Haga clic para iniciar un nuevo Plan Anual</span>
                    </button>
                </div>
            </div>
        );
    }

    // Creating View (Wizard)
    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
            {/* Header Wizard */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <button className="btn btn-secondary" onClick={() => setView('list')}>
                    <ArrowLeft size={16} /> Salir
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Generador de Planificación Anual</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Paso {currentStep + 1} de {STEPS.length}</p>
                </div>
                <div style={{ width: '80px' }}></div> {/* Spacer for centering */}
            </div>

            {/* Custom Vertical Navigation or Progress Bar */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

                {/* Left Sidebar Steps */}
                <div className="glass-static" style={{
                    width: '280px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'sticky',
                    top: '2rem'
                }}>
                    <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Progreso</h5>
                    {STEPS.map((step, index) => {
                        const isPast = index < currentStep;
                        const isActive = index === currentStep;

                        return (
                            <div
                                key={step}
                                onClick={() => index <= currentStep && setCurrentStep(index)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    color: isActive ? 'var(--color-primary)' : isPast ? 'white' : 'var(--text-muted)',
                                    cursor: index <= currentStep ? 'pointer' : 'default',
                                    transition: 'all 0.2s',
                                    padding: '0.5rem 0'
                                }}
                            >
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: isActive ? 'var(--color-primary)' : isPast ? 'var(--glass-border)' : 'transparent',
                                    border: `2px solid ${isActive || isPast ? (isActive ? 'var(--color-primary)' : 'var(--glass-border)') : 'var(--text-muted)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.75rem', fontWeight: 700, color: isActive ? '#060b18' : isPast ? 'white' : 'inherit'
                                }}>
                                    {isPast ? <Check size={14} /> : (index + 1)}
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 400 }}>{step}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Right Form Container */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass"
                            style={{ padding: '2.5rem', minHeight: '500px', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>{STEPS[currentStep] || 'Resultado Generado'}</h3>
                                <div style={{ height: '1px', background: 'var(--glass-border)', marginTop: '0.75rem' }}></div>
                            </div>


                            <div style={{ flex: 1 }}>
                                {currentStep === 0 && Step1Datos()}
                                {currentStep === 1 && Step2Justificacion()}
                                {currentStep === 2 && Step3Calendario()}
                                {currentStep === 3 && Step4Enfoques()}
                                {currentStep === 4 && Step5Tutoria()}
                                {currentStep === 5 && Step6Evaluacion()}
                                {currentStep === 6 && (
                                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                        {generating ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                                <Loader2 size={48} className="animate-spin text-primary" />
                                                <h3 style={{ color: 'var(--color-primary)' }}>Procesando Inteligencia Artificial...</h3>
                                                <p style={{ color: 'var(--text-muted)' }}>Mapeando CNEB, redactando desempeños y estructurando unidades.</p>
                                            </div>
                                        ) : !result ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                                <div style={{ width: '80px', height: '80px', background: 'var(--color-primary-glow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                                    <Sparkles size={40} />
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Todo Listo</h3>
                                                    <p style={{ color: 'var(--text-muted)' }}>La IA generará un Plan Anual completo, profesional y adaptado a los lineamientos vigentes.</p>
                                                </div>
                                                <button className="btn btn-primary" onClick={handleGenerate} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                                                    Generar Plan Anual Ahora
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                {currentStep === 7 && result && (
                                    <div style={{ background: '#0f172a', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', overflowY: 'auto', maxHeight: '600px', whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '0.95rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <button className="btn btn-secondary" onClick={() => { navigator.clipboard.writeText(result); alert("Copiado!") }}>Copiar</button>
                                        </div>
                                        {result}
                                    </div>
                                )}
                            </div>

                            {/* Form Navigation Controls */}
                            {currentStep < 6 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                                    <button className="btn btn-secondary" onClick={handlePrev} disabled={currentStep === 0} style={{ opacity: currentStep === 0 ? 0 : 1 }}>
                                        Atrás
                                    </button>
                                    <button className="btn btn-primary" onClick={handleNext}>
                                        Siguiente Paso <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PlanAnualPage;
