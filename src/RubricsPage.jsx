import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Plus, Star, Target, ClipboardCheck, Download, Eye, ChevronRight, Check
} from 'lucide-react';
import { generateRubric } from './gemini';

const RubricsPage = ({ onNavigate, user }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [rubricResult, setRubricResult] = useState(null);

    const [savedLists, setSavedLists] = useState([]);

    const [formData, setFormData] = useState({
        nivel: '',
        grado: '',
        competencia: '',
        capacidad: '',
        tema: '',
        listaAlumnos: '',
        nombreLista: ''
    });
    const [isSuggestingTopic, setIsSuggestingTopic] = useState(false);

    const [rubrics, setRubrics] = useState([
        { id: '1', title: 'Evaluación de Salto y Caída', category: 'Salto', level: 'Primaria', date: '2026-02-10' },
        { id: '2', title: 'Test de Resistencia (Cooper)', category: 'Resistencia', level: 'Secundaria', date: '2026-01-20' },
    ]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('edufisica_saved_lists');
            if (saved) setSavedLists(JSON.parse(saved));
        } catch (e) {
            console.error(e);
        }
    }, []);

    const handleSelectList = (e) => {
        const id = e.target.value;
        const list = savedLists.find(l => l.id === id);
        if (list) {
            setFormData({ ...formData, listaAlumnos: list.students, nombreLista: list.name });
        } else {
            setFormData({ ...formData, listaAlumnos: '', nombreLista: '' });
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setCurrentStep(2); // Mostrar el panel de generando (que es el paso 3 visible pero el índice 2)
        const res = await generateRubric(formData);
        if (res.success) {
            setRubricResult(res.data);
            setRubrics([{ id: Date.now().toString(), title: formData.tema, category: formData.competencia, level: formData.nivel, date: new Date().toISOString().split('T')[0] }, ...rubrics]);
        } else {
            alert("Error al generar la rúbrica: " + res.error);
            setCurrentStep(1); // Volver al paso de agregar alumnos si falla
        }
        setLoading(false);
    };

    const handleSuggestTopic = async () => {
        if (!formData.nivel || !formData.grado || !formData.competencia) {
            alert("Selecciona Nivel, Grado y Competencia primero para sugerir un tema.");
            return;
        }
        setIsSuggestingTopic(true);
        // Usaremos el mismo helper de gemini, pero le pediremos un tema
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `Actúa como un profesor experto de educación física. 
Sugiere UN SOLO título atractivo y descriptivo para una unidad didáctica de educación física para el nivel ${formData.nivel}, ${formData.grado}, trabajando la competencia: "${formData.competencia}". 
Solo devuelve el título, sin comillas ni texto adicional. Ejemplo: "Juegos Cooperativos y Trabajo en Equipo"`;
            const result = await model.generateContent(prompt);
            setFormData({ ...formData, tema: result.response.text().trim() });
        } catch (e) {
            console.error("Error sugiriendo tema:", e);
        }
        setIsSuggestingTopic(false);
    };

    // Funciones que retornan JSX directamente (sin ser componentes para evitar perder foco)
    const renderStep1Config = () => (
        <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Configuración de la Rúbrica</h3>
            <div className="form-group">
                <label className="form-label">Nivel Educativo</label>
                <select className="form-select" value={formData.nivel} onChange={e => setFormData({ ...formData, nivel: e.target.value })}>
                    <option value="">Selecciona nivel...</option>
                    <option value="Inicial">Inicial</option>
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                </select>
            </div>
            {formData.nivel && (
                <div className="form-group">
                    <label className="form-label">Grado / Edad</label>
                    <select className="form-select" value={formData.grado} onChange={e => setFormData({ ...formData, grado: e.target.value })}>
                        <option value="">Selecciona grado / edad...</option>
                        {formData.nivel === 'Inicial' && (
                            <>
                                <option value="3 años">3 años</option>
                                <option value="4 años">4 años</option>
                                <option value="5 años">5 años</option>
                            </>
                        )}
                        {formData.nivel === 'Primaria' && (
                            <>
                                <option value="1er Grado">1er Grado</option>
                                <option value="2do Grado">2do Grado</option>
                                <option value="3er Grado">3er Grado</option>
                                <option value="4to Grado">4to Grado</option>
                                <option value="5to Grado">5to Grado</option>
                                <option value="6to Grado">6to Grado</option>
                            </>
                        )}
                        {formData.nivel === 'Secundaria' && (
                            <>
                                <option value="1er Año">1er Año</option>
                                <option value="2do Año">2do Año</option>
                                <option value="3er Año">3er Año</option>
                                <option value="4to Año">4to Año</option>
                                <option value="5to Año">5to Año</option>
                            </>
                        )}
                    </select>
                </div>
            )}
            <div className="form-group">
                <label className="form-label">Competencia a Evaluar</label>
                <select className="form-select" value={formData.competencia} onChange={e => setFormData({ ...formData, competencia: e.target.value })}>
                    <option value="">Selecciona competencia...</option>
                    <option value="Se desenvuelve de manera autónoma a través de su motricidad">Se desenvuelve de manera autónoma a través de su motricidad</option>
                    <option value="Asume una vida saludable">Asume una vida saludable</option>
                    <option value="Interactúa a través de sus habilidades sociomotrices">Interactúa a través de sus habilidades sociomotrices</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Tópico o Título de la Unidad</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Ej: Juegos Tradicionales y Cooperativos" value={formData.tema} onChange={e => setFormData({ ...formData, tema: e.target.value })} />
                    <button className="btn btn-secondary" onClick={handleSuggestTopic} disabled={isSuggestingTopic} title="Sugerir Tópico con IA">
                        {isSuggestingTopic ? <Star size={18} className="spin" /> : <Star size={18} />}
                    </button>
                </div>
            </div>
        </motion.div>
    );

    const renderStep2Alumnos = () => (
        <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Alumnos a Evaluar</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Selecciona una lista que hayas guardado previamente al crear sesiones, o ingresa nombres manualmente.
            </p>
            <div className="form-group">
                <label className="form-label">Listas Guardadas</label>
                <select
                    className="form-select"
                    onChange={handleSelectList}
                    value={savedLists.find(l => l.name === formData.nombreLista)?.id || ''}
                >
                    <option value="">-- Ingresar manual --</option>
                    {savedLists.map((list) => (
                        <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Nombres de Alumnos (Uno por línea)</label>
                <textarea
                    className="form-textarea"
                    placeholder="Juan Perez\nMaria Gomez"
                    rows={8}
                    value={formData.listaAlumnos}
                    onChange={e => setFormData({ ...formData, listaAlumnos: e.target.value })}
                />
            </div>
        </motion.div>
    );

    const renderStep3Generar = () => (
        <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center" style={{ padding: '3rem 1rem' }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--color-primary-glow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--color-primary)' }}>
                <Target size={40} />
            </div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>¡Todo listo!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                La IA procesará la competencia seleccionada para el tema "{formData.tema}" y generará indicadores específicos en escala AD-A-B-C.
            </p>
            <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }} onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generando Magia...' : 'Generar Rúbrica con IA'}
            </button>
        </motion.div>
    );

    const renderResult = () => {
        if (!rubricResult) return null;

        let alumnosArray = [];
        if (formData.listaAlumnos) {
            alumnosArray = formData.listaAlumnos.split('\n').filter(a => a.trim());
        }

        const downloadAsWord = () => {
            if (!rubricResult) return;

            const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Rúbrica de Educación Física</title><style>table {border-collapse: collapse; width: 100%;} th, td {border: 1px solid black; padding: 8px; text-align: left;}</style></head><body>";
            const footer = "</body></html>";

            let htmlSource = `<h1>${rubricResult.titulo}</h1>`;

            // Build the Rubric Criteria Table
            htmlSource += `<h2>Criterios de Evaluación</h2>`;
            htmlSource += `<table><thead><tr><th width="20%">Criterio</th><th width="20%">AD (Destacado)</th><th width="20%">A (Esperado)</th><th width="20%">B (En Proceso)</th><th width="20%">C (En Inicio)</th></tr></thead><tbody>`;
            rubricResult.criterios.forEach(crit => {
                htmlSource += `<tr>
                    <td><strong>${crit.nombre}</strong></td>
                    <td>${crit.descripciones.AD}</td>
                    <td>${crit.descripciones.A}</td>
                    <td>${crit.descripciones.B}</td>
                    <td>${crit.descripciones.C}</td>
                </tr>`;
            });
            htmlSource += `</tbody></table><br/>`;

            // Build the Registration Sheet
            if (alumnosArray.length > 0) {
                htmlSource += `<h2>Ficha de Registro: ${formData.nombreLista || 'Lista Personalizada'}</h2>`;
                htmlSource += `<table><thead><tr><th rowspan="2" align="center">N°</th><th rowspan="2">Apellidos y Nombres</th>`;

                rubricResult.criterios.forEach(crit => {
                    htmlSource += `<th colspan="4" align="center">${crit.nombre}</th>`;
                });
                htmlSource += `<th rowspan="2" align="center">Calificación Final</th></tr><tr>`;

                rubricResult.criterios.forEach(() => {
                    htmlSource += `<th>AD</th><th>A</th><th>B</th><th>C</th>`;
                });
                htmlSource += `</tr></thead><tbody>`;

                alumnosArray.forEach((alumno, idx) => {
                    htmlSource += `<tr>
                        <td align="center">${idx + 1}</td>
                        <td>${alumno}</td>`;
                    rubricResult.criterios.forEach(() => {
                        htmlSource += `<td align="center"> </td><td align="center"> </td><td align="center"> </td><td align="center"> </td>`;
                    });
                    htmlSource += `<td align="center"> </td></tr>`;
                });
                htmlSource += `</tbody></table>`;
            }

            const sourceHTML = header + htmlSource + footer;
            const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
            const fileDownload = document.createElement("a");
            document.body.appendChild(fileDownload);
            fileDownload.href = source;
            fileDownload.download = `Rubrica_${formData.grado || 'Educacion_Fisica'}.doc`;
            fileDownload.click();
            document.body.removeChild(fileDownload);
        };

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', marginTop: '2rem', overflowX: 'auto' }}>
                <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>{rubricResult.titulo}</h2>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <button className="btn btn-secondary" onClick={() => { setIsGenerating(false); setCurrentStep(0); setRubricResult(null); }}>
                        Volver a la Lista
                    </button>
                    <button className="btn btn-secondary" onClick={downloadAsWord}>
                        <FileText size={16} style={{ marginRight: '0.5rem' }} /> Descargar en Word
                    </button>
                    <button className="btn btn-primary" onClick={() => window.print()}>
                        <Download size={16} style={{ marginRight: '0.5rem' }} /> Guardar / Imprimir PDF
                    </button>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table" style={{ marginBottom: '0' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '25%' }}>Criterio</th>
                                <th>Niveles de Logro (AD - C)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rubricResult.criterios.map((crit, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontWeight: 'bold' }}>{crit.nombre}</td>
                                    <td>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                                            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                                <div style={{ fontWeight: 'bold', color: '#22c55e', marginBottom: '5px' }}>AD (Destacado)</div>
                                                <div style={{ fontSize: '0.85rem' }}>{crit.descripciones.AD}</div>
                                            </div>
                                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                                <div style={{ fontWeight: 'bold', color: '#3b82f6', marginBottom: '5px' }}>A (Esperado)</div>
                                                <div style={{ fontSize: '0.85rem' }}>{crit.descripciones.A}</div>
                                            </div>
                                            <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                                                <div style={{ fontWeight: 'bold', color: '#eab308', marginBottom: '5px' }}>B (En Proceso)</div>
                                                <div style={{ fontSize: '0.85rem' }}>{crit.descripciones.B}</div>
                                            </div>
                                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                <div style={{ fontWeight: 'bold', color: '#ef4444', marginBottom: '5px' }}>C (En Inicio)</div>
                                                <div style={{ fontSize: '0.85rem' }}>{crit.descripciones.C}</div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {alumnosArray.length > 0 && (
                    <div style={{ marginTop: '3rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Ficha de Registro: {formData.nombreLista || 'Lista Personalizada'}</h3>
                        <div className="admin-table-wrapper">
                            <table className="admin-table text-center">
                                <thead>
                                    <tr>
                                        <th rowSpan={2} style={{ verticalAlign: 'middle', width: '50px' }}>N°</th>
                                        <th rowSpan={2} style={{ verticalAlign: 'middle', textAlign: 'left', minWidth: '200px' }}>Apellidos y Nombres</th>
                                        {rubricResult.criterios.map((crit, idx) => (
                                            <th colSpan={4} key={idx} style={{ textAlign: 'center', fontSize: '0.85rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                                                {crit.nombre}
                                            </th>
                                        ))}
                                        <th rowSpan={2} style={{ verticalAlign: 'middle', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>Calificación Final</th>
                                    </tr>
                                    <tr>
                                        {rubricResult.criterios.map((_, idx) => (
                                            <React.Fragment key={idx}>
                                                <th style={{ fontSize: '0.75rem', padding: '0.5rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>AD</th>
                                                <th style={{ fontSize: '0.75rem', padding: '0.5rem' }}>A</th>
                                                <th style={{ fontSize: '0.75rem', padding: '0.5rem' }}>B</th>
                                                <th style={{ fontSize: '0.75rem', padding: '0.5rem' }}>C</th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {alumnosArray.map((alumno, idx) => (
                                        <tr key={idx}>
                                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                            <td style={{ textAlign: 'left', fontWeight: 500 }}>{alumno}</td>
                                            {rubricResult.criterios.map((_, cIdx) => (
                                                <React.Fragment key={cIdx}>
                                                    <td style={{ textAlign: 'center', borderLeft: '2px solid rgba(255,255,255,0.1)' }}><div style={{ width: '16px', height: '16px', border: '1px solid var(--glass-border)', borderRadius: '4px', margin: '0 auto' }}></div></td>
                                                    <td style={{ textAlign: 'center' }}><div style={{ width: '16px', height: '16px', border: '1px solid var(--glass-border)', borderRadius: '4px', margin: '0 auto' }}></div></td>
                                                    <td style={{ textAlign: 'center' }}><div style={{ width: '16px', height: '16px', border: '1px solid var(--glass-border)', borderRadius: '4px', margin: '0 auto' }}></div></td>
                                                    <td style={{ textAlign: 'center' }}><div style={{ width: '16px', height: '16px', border: '1px solid var(--glass-border)', borderRadius: '4px', margin: '0 auto' }}></div></td>
                                                </React.Fragment>
                                            ))}
                                            <td style={{ textAlign: 'center', borderLeft: '2px solid rgba(255,255,255,0.1)' }}><span style={{ opacity: 0.2 }}>__</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <button className="btn btn-secondary" onClick={() => isGenerating ? setIsGenerating(false) : onNavigate('tools')} style={{ marginBottom: '2rem' }}>
                    <ArrowLeft size={16} /> Volver
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Rúbricas de <span className="text-gradient">Evaluación</span></h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Evalúa el progreso de tus alumnos con criterios claros y objetivos.</p>
                    </div>
                    {!isGenerating && (
                        <button className="btn btn-primary" onClick={() => setIsGenerating(true)}>
                            <Plus size={18} /> Crear Rúbrica IA
                        </button>
                    )}
                </div>
            </header>

            {!isGenerating ? (
                <>
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
                </>
            ) : (
                <div className="wizard-container">
                    {!rubricResult && (
                        <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                            {[0, 1, 2].map((step) => (
                                <React.Fragment key={step}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '0.9rem',
                                        background: currentStep >= step ? 'var(--color-primary)' : 'var(--color-surface)',
                                        color: currentStep >= step ? '#000' : 'var(--text-muted)',
                                        border: `2px solid ${currentStep >= step ? 'var(--color-primary)' : 'var(--glass-border)'}`
                                    }}>
                                        {currentStep > step ? <Check size={16} /> : step + 1}
                                    </div>
                                    {step < 2 && (
                                        <div style={{
                                            height: '2px', width: '50px',
                                            background: currentStep > step ? 'var(--color-primary)' : 'var(--glass-border)'
                                        }} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {!rubricResult && (
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                            <AnimatePresence mode="wait">
                                {currentStep === 0 && renderStep1Config()}
                                {currentStep === 1 && renderStep2Alumnos()}
                                {currentStep === 2 && renderStep3Generar()}
                            </AnimatePresence>

                            <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                    style={{ visibility: currentStep === 0 || currentStep === 2 ? 'hidden' : 'visible' }}
                                >
                                    Anterior
                                </button>

                                {currentStep < 2 && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setCurrentStep(Math.min(2, currentStep + 1))}
                                        disabled={(currentStep === 0 && (!formData.nivel || !formData.tema || !formData.competencia))}
                                    >
                                        Continuar <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {rubricResult && renderResult()}
                </div>
            )}
        </div>
    );
};

export default RubricsPage;
