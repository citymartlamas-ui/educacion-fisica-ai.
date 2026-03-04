import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, ArrowLeft, Plus, FileText, Layout,
    CheckCircle, ChevronRight, Search, Sparkles, Loader2,
    Check, Settings, Users, Calendar, Target, Clock, School
} from 'lucide-react';
import { generateLessonPlan } from './gemini';

const STEPS = [
    'Datos Informativos',
    'Contenido y Contexto',
    'Producto y Evaluación',
    'Confirmar y Generar'
];

const UnitsPage = ({ onNavigate, user }) => {
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [currentStep, setCurrentStep] = useState(0);
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState('');

    const [formData, setFormData] = useState({
        // Paso 1: Datos
        docente: '',
        director: '',
        ie: '',
        nivel: '',
        planificarPor: 'Grado', // Grado o Ciclo
        grado: '',
        area: '',
        duracion: '',
        anio: '',
        periodo: '',
        numEstudiantes: '',
        turno: '',
        fechaInicio: '',
        // Paso 2: Contenido
        tituloUnidad: '',
        temasClave: '',
        contexto: '',
        integracionAreas: '',
        iaGenerarSituacion: true,
        situacionManual: '',
        // Paso 3: Competencias y Evaluación
        competencias: [],
        enfoques: [],
        evaluacionFormativa: '',
        productoFinal: ''
    });

    const [units, setUnits] = useState([
        { id: '1', title: 'Unidad 1: Conocemos nuestro cuerpo y sus posibilidades', sessions: 8, status: 'Completado', color: 'var(--color-primary)' },
        { id: '2', title: 'Unidad 2: Juegos tradicionales y populares de nuestra región', sessions: 6, status: 'En Progreso', color: 'var(--color-secondary)' },
        { id: '3', title: 'Unidad 3: Mejoramos nuestra coordinación con el atletismo', sessions: 10, status: 'Planificado', color: 'var(--color-accent)' },
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

    // Calculate end date based on duration and start date (simplified approach)
    const calculateEndDate = (startDate, weeks) => {
        if (!startDate || !weeks) return '';
        const date = new Date(startDate);
        date.setDate(date.getDate() + (weeks * 7));
        return date.toISOString().split('T')[0];
    };

    const calculatedEndDate = calculateEndDate(formData.fechaInicio, formData.duracion);

    const handleGenerate = async () => {
        setGenerating(true);

        let situacionTexto = formData.iaGenerarSituacion
            ? `Crea una situación significativa retadora (de 3 a 4 párrafos) contextualizada para estudiantes de ${formData.grado} de ${formData.nivel}, considerando su entorno: ${formData.contexto || 'entorno general'}. Debe terminar con un reto claro.`
            : formData.situacionManual;

        const prompt = `Actúa como experto en currículo de Educación Física (Perú). Genera una UNIDAD DE APRENDIZAJE estrictamente en formato Markdown y con la siguiente estructura exacta de 14 números romanos:

I. TÍTULO DE LA UNIDAD
"${formData.tituloUnidad || 'Generar título motivador relacionado a los temas'}"

II. DATOS INFORMATIVOS
- Institución Educativa: ${formData.ie || 'No especificada'}
- Director/a: ${formData.director || 'No especificada'}
- Docente: ${formData.docente || 'No especificado'}
- Nivel: ${formData.nivel}
- ${formData.planificarPor}: ${formData.grado}
- Área Curricular: ${formData.area}
- Año Lectivo: ${formData.anio}
- Periodo: ${formData.periodo}
- Duración: ${formData.duracion} semana(s)
- Fecha de Inicio: ${formData.fechaInicio || 'Pendiente'}
- Fecha de Fin: ${calculatedEndDate || 'Pendiente'}
- Nº de Estudiantes: ${formData.numEstudiantes || 'No especificado'}
- Turno: ${formData.turno}

III. JUSTIFICACIÓN
Redacta una justificación fundamentada pedagógicamente (2 a 3 párrafos cortos) de por qué se enseña esta unidad, considerando los temas clave (${formData.temasClave || 'temas pertinentes correspondientes'}) y cómo beneficia a los estudiantes.

IV. SITUACIÓN SIGNIFICATIVA
${situacionTexto}

V. PRODUCTO DE LA UNIDAD
${formData.productoFinal || 'Sugerir un producto tangible/intangible adecuado relacionado a la unidad.'}

VI. PROPÓSITO DE LA UNIDAD
Redactar un párrafo indicando el propósito general alineado a las competencias (${formData.competencias.join(', ')}).

VII. PROPÓSITOS DE APRENDIZAJE
Crea una TABLA Markdown detallada con las columnas: Área | Competencia/Capacidades | Estándar | Desempeños | Evidencias | Instrumentos. Debe incluir las competencias: ${formData.competencias.join(', ')}.

VIII. COMPETENCIAS TRANSVERSALES
Crea una TABLA Markdown con las columnas: Competencia Transversal | Capacidades que se trabajarán | Desempeños/Acciones concretas en esta unidad | Evidencias. Obligatorio incluir: "Gestiona su aprendizaje de manera autónoma" y "Se desenvuelve en entornos virtuales generados por las TIC".

IX. ENFOQUES TRANSVERSALES
Crea una TABLA Markdown con las columnas: Enfoque Transversal | Valores | Actitudes - Estudiantes | Actitudes - Docente. Incluye obligatoriamente: ${formData.enfoques.join(', ')}.

X. SECUENCIA DIDÁCTICA DE LA UNIDAD
Crea una TABLA Markdown con esta lista cronológica para ${formData.duracion} semanas. Columnas: Semana Nº | Área | Título | Propósito | Competencias | Tiempo | Recursos | Evaluación. 

XI. RECURSOS Y MATERIALES
Organízalo con subtítulos:
- Para el docente:
- Para el estudiante:
- Tecnológicos:

XII. ORIENTACIONES PEDAGÓGICAS
Organízalo con subtítulos y redactar breves estrategias para:
A. Estrategias Metodológicas
B. Atención a la Diversidad
C. Uso de Materiales y Recursos
D. Organización del Espacio

XIII. REFERENCIAS BIBLIOGRÁFICAS
Organízalo con subtítulos:
A. Documentos Normativos del MINEDU
B. Materiales Educativos para ${formData.grado}
C. Recursos Digitales del MINEDU

XIV. CAMPO DE FIRMAS
Crear 2 espacios para firmas: "${formData.docente || 'Docente'}" y "${formData.director || 'Director/a'}".

Asegúrate de que todo el documento contenga exclusivamente la estructura pedida con tablas Markdown muy limpias y listas para presentar.`;

        try {
            const res = await generateLessonPlan(prompt);
            setResult(res);
            setCurrentStep(4); // Show result
        } catch (error) {
            console.error("Error generating unit", error);
        } finally {
            setGenerating(false);
        }
    };

    const downloadAsWord = () => {
        if (!result) return;

        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Unidad Didáctica</title></head><body>";
        const footer = "</body></html>";

        // Very basic simple replacement from Markdown to HTML to make Word format it slightly better
        let htmlSource = result
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/\n\n/gim, '<p></p>')
            .replace(/\n/gim, '<br />');

        // Simple table replacements wrapper
        htmlSource = htmlSource.replace(/\|(.+)\|/gim, '<tr><td>$1</td></tr>');
        htmlSource = htmlSource.replace(/<\/tr><br \/><tr>/gim, '</tr><tr>');

        const sourceHTML = header + htmlSource + footer;

        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = `Unidad_Educacion_Fisica_${formData.grado || 'Generada'}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
    };

    // -- Sub-components for Steps --

    const Step1DatosInformativos = () => (
        <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>1. Nombre del Docente:</label>
                    <input type="text" className="form-input" value={formData.docente} onChange={e => setFormData({ ...formData, docente: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>2. Nombre del Director/a:</label>
                    <input type="text" className="form-input" value={formData.director} onChange={e => setFormData({ ...formData, director: e.target.value })} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>3. Institución Educativa:</label>
                    <input type="text" className="form-input" value={formData.ie} onChange={e => setFormData({ ...formData, ie: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>4. Nivel Educativo:</label>
                    <select className="form-select" value={formData.nivel} onChange={e => setFormData({ ...formData, nivel: e.target.value })}>
                        <option value="">Seleccione Nivel</option>
                        <option>Inicial</option>
                        <option>Primaria</option>
                        <option>Secundaria</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>4.1. Planificar por:</label>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="radio" style={{ accentColor: 'var(--color-primary)', width: '1.2rem', height: '1.2rem' }} checked={formData.planificarPor === 'Grado'} onChange={() => setFormData({ ...formData, planificarPor: 'Grado' })} />
                            <span>Por Grado</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="radio" style={{ accentColor: 'var(--color-primary)', width: '1.2rem', height: '1.2rem' }} checked={formData.planificarPor === 'Ciclo'} onChange={() => setFormData({ ...formData, planificarPor: 'Ciclo' })} />
                            <span>Por Ciclo</span>
                        </label>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>5. {formData.planificarPor}:</label>
                    <select className="form-select" value={formData.grado} onChange={e => setFormData({ ...formData, grado: e.target.value })}>
                        <option value="">Seleccione {formData.planificarPor}</option>
                        {formData.planificarPor === 'Grado' ? (
                            <> <option>1er Grado</option><option>2do Grado</option><option>3er Grado</option><option>4to Grado</option><option>5to Grado</option><option>6to Grado</option> </>
                        ) : (
                            <> <option>Ciclo II</option><option>Ciclo III</option><option>Ciclo IV</option><option>Ciclo V</option><option>Ciclo VI</option><option>Ciclo VII</option> </>
                        )}
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>6. Área Curricular:</label>
                    <select className="form-select" value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })}>
                        <option value="">Seleccione Área</option>
                        <option>Educación Física</option>
                        <option>Psicomotricidad</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>7. Duración (Semanas):</label>
                    <select className="form-select" value={formData.duracion} onChange={e => setFormData({ ...formData, duracion: Number(e.target.value) })}>
                        <option value="">Seleccione Semanas</option>
                        {[3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n} semanas</option>)}
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>8. Año Lectivo:</label>
                    <input type="text" className="form-input" value={formData.anio} onChange={e => setFormData({ ...formData, anio: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>9. Periodo:</label>
                    <select className="form-select" value={formData.periodo} onChange={e => setFormData({ ...formData, periodo: e.target.value })}>
                        <option value="">Seleccione Periodo</option>
                        <option>I Bimestre</option><option>II Bimestre</option><option>III Bimestre</option><option>IV Bimestre</option>
                        <option>I Trimestre</option><option>II Trimestre</option><option>III Trimestre</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>10. Número de Estudiantes:</label>
                    <input type="number" className="form-input" value={formData.numEstudiantes} onChange={e => setFormData({ ...formData, numEstudiantes: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>11. Turno:</label>
                    <select className="form-select" value={formData.turno} onChange={e => setFormData({ ...formData, turno: e.target.value })}>
                        <option value="">Seleccione Turno</option>
                        <option>Mañana</option><option>Tarde</option><option>Noche</option><option>Jornada Completa</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>12. Fecha de Inicio:</label>
                    <div style={{ position: 'relative' }}>
                        <input type="date" className="form-input" value={formData.fechaInicio} onChange={e => setFormData({ ...formData, fechaInicio: e.target.value })} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>13. Fecha de Fin:</label>
                    <input type="date" className="form-input" disabled value={calculatedEndDate} style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>Se calcula automáticamente según la duración</span>
                </div>
            </div>
        </div>
    );

    const Step2ContenidoContexto = () => (
        <div style={{ display: 'grid', gap: '2rem' }}>
            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: 0 }}>1. Título de la Unidad:</label>
                    <button className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', gap: '0.3rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'none' }}>
                        <Sparkles size={10} /> Sugerir Título
                    </button>
                </div>
                <input type="text" className="form-input" placeholder="Ej: Conocemos nuestro cuerpo y mejoramos la salud..." value={formData.tituloUnidad} onChange={e => setFormData({ ...formData, tituloUnidad: e.target.value })} />
            </div>

            <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>2. Temas Clave por Área:</label>
                <div style={{ background: 'var(--glass-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--color-primary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Educación Física:</label>
                    <textarea className="form-textarea" placeholder="Ej: Medidas antropométricas, juegos tradicionales, coordinación..." value={formData.temasClave} onChange={e => setFormData({ ...formData, temasClave: e.target.value })} style={{ minHeight: '80px', border: '1px solid rgba(255,255,255,0.05)' }} />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>3. Contexto de los Estudiantes:</label>
                <textarea className="form-textarea" placeholder="Contexto de los estudiantes (Opcional pero recomendado). Ejm: Los estudiantes viven en una zona rural..." value={formData.contexto} onChange={e => setFormData({ ...formData, contexto: e.target.value })} style={{ minHeight: '100px' }} />
            </div>

            <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>3.1. Integración con otras áreas (Opcional):</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Si esta unidad se vincula con otras áreas curriculares, especifica cuáles y cómo. Déjalo vacío si es de área única.</p>
                <textarea className="form-textarea" placeholder="Ejemplo: Esta unidad se vincula con Comunicación para la producción de textos descriptivos..." value={formData.integracionAreas} onChange={e => setFormData({ ...formData, integracionAreas: e.target.value })} style={{ minHeight: '80px' }} />
            </div>

            <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>4. Situación Significativa:</label>

                <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    <label style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
                        background: formData.iaGenerarSituacion ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                        color: formData.iaGenerarSituacion ? '#000' : 'white', cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                        <input type="radio" checked={formData.iaGenerarSituacion} onChange={() => setFormData({ ...formData, iaGenerarSituacion: true })} style={{ accentColor: '#000', width: '1.2rem', height: '1.2rem' }} />
                        <span style={{ fontWeight: formData.iaGenerarSituacion ? 700 : 500 }}>Dejar que la IA genere la Situación Significativa</span>
                        {formData.iaGenerarSituacion && <Sparkles size={16} style={{ marginLeft: 'auto' }} />}
                    </label>
                    <label style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
                        background: !formData.iaGenerarSituacion ? 'var(--glass-bg)' : 'transparent',
                        color: 'white', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s'
                    }}>
                        <input type="radio" checked={!formData.iaGenerarSituacion} onChange={() => setFormData({ ...formData, iaGenerarSituacion: false })} style={{ accentColor: 'var(--color-primary)', width: '1.2rem', height: '1.2rem' }} />
                        <span style={{ fontWeight: !formData.iaGenerarSituacion ? 700 : 500 }}>Escribir la Situación Significativa</span>
                    </label>
                </div>

                {!formData.iaGenerarSituacion && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: '1rem' }}>
                        <textarea className="form-textarea" placeholder="Redacta la situación problemática completa aquí..." value={formData.situacionManual} onChange={e => setFormData({ ...formData, situacionManual: e.target.value })} style={{ minHeight: '150px' }} />
                    </motion.div>
                )}
            </div>
        </div>
    );

    const competenciasFisica = [
        'Se desenvuelve de manera autónoma a través de su motricidad',
        'Asume una vida saludable',
        'Interactúa a través de sus habilidades sociomotrices'
    ];

    const enfoquesLista = [
        'Enfoque de Derechos', 'Enfoque Inclusivo', 'Enfoque Intercultural',
        'Enfoque de Igualdad de Género', 'Enfoque Ambiental', 'Enfoque de Orientación al Bien Común',
        'Enfoque de Búsqueda de la Excelencia'
    ];

    const Step3Competencias = () => (
        <div style={{ display: 'grid', gap: '2.5rem' }}>
            <div>
                <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 600 }}>14. Competencias a desarrollar:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {competenciasFisica.map(comp => (
                        <label key={comp} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <div style={{
                                width: '22px', height: '22px', borderRadius: '4px',
                                border: `2px solid ${formData.competencias.includes(comp) ? 'var(--color-primary)' : 'var(--text-muted)'} `,
                                background: formData.competencias.includes(comp) ? 'var(--color-primary)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {formData.competencias.includes(comp) && <Check size={14} color="#000" strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: '0.95rem', color: formData.competencias.includes(comp) ? 'white' : 'var(--text-secondary)' }}>{comp}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 600 }}>15. Enfoques Transversales a priorizar:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {enfoquesLista.map(enf => (
                        <label key={enf} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <div style={{
                                width: '22px', height: '22px', borderRadius: '4px',
                                border: `2px solid ${formData.enfoques.includes(enf) ? 'var(--color-primary)' : 'var(--text-muted)'} `,
                                background: formData.enfoques.includes(enf) ? 'var(--color-primary)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {formData.enfoques.includes(enf) && <Check size={14} color="#000" strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: '0.9rem', color: formData.enfoques.includes(enf) ? 'white' : 'var(--text-secondary)' }}>{enf}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: 0 }}>16. Producto Final de la Unidad:</label>
                    <button className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', gap: '0.3rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'none' }}>
                        <Sparkles size={10} /> Sugerir Producto
                    </button>
                </div>
                <input type="text" className="form-input" placeholder="Ej: Organización de un mini-torneo deportivo, Exposición sobre vida saludable..." value={formData.productoFinal} onChange={e => setFormData({ ...formData, productoFinal: e.target.value })} />
            </div>

            <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>17. Evaluación Formativa (Ruta general):</label>
                <textarea className="form-textarea" placeholder="Narra los lineamientos de evaluación..." value={formData.evaluacionFormativa} onChange={e => setFormData({ ...formData, evaluacionFormativa: e.target.value })} style={{ minHeight: '100px' }} />
            </div>
        </div>
    );

    const Step4Confirmacion = () => (
        <div style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ color: 'var(--color-primary)', marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>Confirmar Datos</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                <p><strong>Título:</strong> {formData.tituloUnidad || <span style={{ color: 'var(--text-muted)' }}>(Por definir)</span>}</p>
                <p><strong>Planificando:</strong> Por {formData.planificarPor}</p>
                <p><strong>Nivel / Grado:</strong> {formData.nivel} - {formData.grado}</p>
                <p><strong>Área:</strong> {formData.area}</p>
                <p><strong>Año Lectivo / Periodo:</strong> {formData.anio} - {formData.periodo}</p>
                <p><strong>Nº Estudiantes:</strong> {formData.numEstudiantes || 'No especificado'} | <strong>Turno:</strong> {formData.turno}</p>
                <p><strong>Duración:</strong> {formData.duracion} semana(s)</p>

                <div style={{ marginTop: '0.5rem' }}>
                    <strong>Temas por Área:</strong>
                    <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                        <strong>{formData.area}:</strong> {formData.temasClave || 'Proponer por IA'}
                    </div>
                </div>

                <p><strong>Situación Significativa:</strong> {formData.iaGenerarSituacion ? <span style={{ color: 'var(--color-primary)' }}><Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} /> Generada por IA basada en contexto</span> : 'Manual'}</p>

                <p><strong>Competencias:</strong> {formData.competencias.join(', ')}</p>
                <p><strong>Enfoques:</strong> {formData.enfoques.join(', ')}</p>
            </div>

            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                <button
                    className="btn btn-primary"
                    onClick={handleGenerate}
                    disabled={generating}
                    style={{
                        padding: '1.25rem 2.5rem',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        width: '100%',
                        boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
                    }}
                >
                    {generating ? (
                        <><Loader2 size={20} className="animate-spin" /> GENERANDO UNIDAD...</>
                    ) : (
                        <><Sparkles size={20} /> GENERAR UNIDAD DE APRENDIZAJE</>
                    )}
                </button>
            </div>
        </div>
    );


    // --- Main Rendering ---

    if (view === 'list') {
        return (
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
                <header style={{ marginBottom: '3rem' }}>
                    <button className="btn btn-secondary" onClick={() => onNavigate('tools')} style={{ marginBottom: '2rem' }}>
                        <ArrowLeft size={16} /> Volver
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                Generador de <span className="text-gradient">Unidades V.4</span>
                            </h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Potenciado por Inteligencia Artificial para el maestro moderno.</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setView('create')}>
                            <Plus size={18} /> Crear Nueva Unidad
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
                    <h3 style={{ marginBottom: '1.5rem' }}>¿Qué te resuelve el Generador V.4?</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ color: 'var(--color-primary)' }}><Layout size={20} /></div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Situación Significativa Interactiva</div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Creadas con Inteligencia artificial o dictadas paso a paso.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ color: 'var(--color-secondary)' }}><FileText size={20} /></div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Mapeo de Capacidad</div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vincula competencias y enfoques automáticamente al CNEB.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ color: 'var(--color-accent)' }}><BookOpen size={20} /></div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Secuencia Automatizada</div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Formula el título, desempeño y criterio de cada sesión semanal.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Creating View (Wizard)
    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem', maxWidth: '900px', margin: '0 auto' }}>
            {/* Header Wizard */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <button className="btn btn-secondary" onClick={() => setView('list')} style={{ background: 'transparent', padding: '0' }}>
                    <ArrowLeft size={16} /> Salir
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        Generador de Unidades V.4
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Potenciado por Google Gemini</p>
                </div>
                <div style={{ width: '40px' }}></div> {/* Spacer */}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="glass"
                    style={{ padding: '2.5rem' }}
                >
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>Paso {currentStep + 1}: {STEPS[currentStep] || 'Resultado'}</h3>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginTop: '1rem' }}></div>
                    </div>

                    <div style={{ minHeight: '400px' }}>
                        {currentStep === 0 && Step1DatosInformativos()}
                        {currentStep === 1 && Step2ContenidoContexto()}
                        {currentStep === 2 && Step3Competencias()}
                        {currentStep === 3 && Step4Confirmacion()}

                        {currentStep === 4 && result && (
                            <div style={{ background: '#0f172a', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', overflowY: 'auto', maxHeight: '600px', whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '0.95rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                    <button className="btn btn-secondary" onClick={() => { navigator.clipboard.writeText(result); alert("¡Documento Copiado!") }}>Copiar Texto</button>
                                    <button className="btn btn-primary" onClick={downloadAsWord} style={{ background: '#2563eb', border: 'none' }}>Descargar Word</button>
                                </div>
                                {result}
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons (Only if not in generating/result state) */}
                    {currentStep < 3 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <button className="btn btn-secondary" onClick={handlePrev} disabled={currentStep === 0} style={{ opacity: currentStep === 0 ? 0 : 1 }}>
                                ANTERIOR
                            </button>
                            <button className="btn btn-primary" onClick={handleNext} style={{ background: 'var(--color-primary)', color: 'black', fontWeight: 700 }}>
                                SIGUIENTE
                            </button>
                        </div>
                    )}
                    {currentStep === 4 && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                            <button className="btn btn-primary" onClick={() => setView('list')}>Guardar y Volver al Inicio</button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default UnitsPage;
