import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, ArrowLeft, Plus, FileText, Layout, Download,
    CheckCircle, ChevronRight, Search, Sparkles, Loader2,
    Check, Settings, Users, Calendar, Target, Clock, School
} from 'lucide-react';
import { generateStructuredUnit, generateFastSuggestion } from './gemini';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, HeadingLevel, ShadingType } from 'docx';
import { saveAs } from 'file-saver';

// ==================== WORD EXPORT ====================
// ==================== WORD EXPORT HELPERS ====================
const NO_BORDERS = { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } };

const makeTextRuns = (str, bold = false, size = 18, color = '000000') => {
    const text = (str == null ? '' : str).toString();
    const sections = text.split('**');
    const runs = [];
    sections.forEach((part, i) => {
        const lines = part.split('\\n');
        lines.forEach((line, j) => {
            if (j > 0) runs.push(new TextRun({ break: 1 }));
            runs.push(new TextRun({ text: line, bold: bold || (i % 2 === 1), size, font: 'Calibri', color }));
        });
    });
    return runs;
};

const makeHeaderCell = (text, colSpan = 1) => new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: (text || '').toString(), bold: true, color: 'ffffff', size: 20, font: 'Calibri' })], alignment: AlignmentType.CENTER })],
    shading: { type: ShadingType.SOLID, color: '1a56db', fill: '1a56db' },
    borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
    columnSpan: colSpan, verticalAlign: 'center',
});

const makeSubHeaderCell = (text, colSpan = 1) => new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: (text || '').toString(), bold: true, size: 18, font: 'Calibri', color: '1e40af' })], alignment: AlignmentType.LEFT })],
    shading: { type: ShadingType.SOLID, color: 'f1f5f9', fill: 'f1f5f9' },
    borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
    columnSpan: colSpan, verticalAlign: 'center',
});

const makeCell = (text, colSpan = 1, bold = false, align = AlignmentType.LEFT) => new TableCell({
    children: [new Paragraph({ children: makeTextRuns(text, bold), alignment: align, spacing: { before: 80, after: 80 } })],
    borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
    columnSpan: colSpan, verticalAlign: 'center',
});

const spacer = (size = 200) => new Paragraph({ text: '', spacing: { before: size } });

// ==================== WORD EXPORT ====================
const exportToWord = async (data) => {
    try {
        const d = data.datos_informativos;

        const doc = new Document({
            sections: [{
                properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: (data.titulo_unidad || 'UNIDAD DE APRENDIZAJE').toUpperCase(), bold: true, size: 28, font: 'Calibri', color: '1a56db' })],
                        alignment: AlignmentType.CENTER, spacing: { after: 300 }
                    }),

                    // II. DATOS INFORMATIVOS
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [makeHeaderCell('II. DATOS INFORMATIVOS', 4)] }),
                            new TableRow({ children: [makeSubHeaderCell('DOCENTE'), makeCell(d.docente, 1), makeSubHeaderCell('I.E.'), makeCell(d.ie, 1)] }),
                            new TableRow({ children: [makeSubHeaderCell('DIRECTOR(A)'), makeCell(d.director, 1), makeSubHeaderCell('NIVEL'), makeCell(d.nivel, 1)] }),
                            new TableRow({ children: [makeSubHeaderCell('CICLO/GRADO'), makeCell(d.ciclo_grado, 1), makeSubHeaderCell('ÁREA'), makeCell(d.area, 1)] }),
                            new TableRow({ children: [makeSubHeaderCell('AÑO Y PERIODO'), makeCell(`${d.anio} - ${d.periodo}`, 1), makeSubHeaderCell('DURACIÓN'), makeCell(d.duracion, 1)] }),
                            new TableRow({ children: [makeSubHeaderCell('FECHAS'), makeCell(d.fechas, 1), makeSubHeaderCell('ESTUDIANTES'), makeCell(`${d.num_estudiantes} / ${d.turno}`, 1)] }),
                        ]
                    }),
                    spacer(),

                    // III. JUSTIFICACIÓN Y PROPÓSITO
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [makeHeaderCell('III. JUSTIFICACIÓN Y PROPÓSITO', 1)] }),
                            new TableRow({ children: [makeCell(`**JUSTIFICACIÓN:**\\n${data.justificacion}\\n\\n**PROPÓSITO:**\\n${data.proposito_unidad}`)] }),
                        ]
                    }),
                    spacer(),

                    // IV. SITUACIÓN SIGNIFICATIVA
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [makeHeaderCell('IV. SITUACIÓN SIGNIFICATIVA / RETO', 1)] }),
                            new TableRow({ children: [makeCell(data.situacion_significativa)] }),
                        ]
                    }),
                    spacer(),

                    // V. PRODUCTO
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [makeHeaderCell('V. PRODUCTO DE LA UNIDAD', 1)] }),
                            new TableRow({ children: [makeCell(data.producto_unidad, 1, true, AlignmentType.CENTER)] }),
                        ]
                    }),
                    spacer(),

                    // VI. PROPÓSITOS DE APRENDIZAJE
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [makeHeaderCell('VI. PROPÓSITOS DE APRENDIZAJE', 3)] }),
                            new TableRow({ children: [makeSubHeaderCell('COMPETENCIA / CAPACIDADES'), makeSubHeaderCell('ESTÁNDAR DE APRENDIZAJE'), makeSubHeaderCell('DESEMPEÑOS PRECISADOS')] }),
                            ...(data.competencias_capacidades_estandar || []).map(comp => new TableRow({
                                children: [
                                    makeCell(`**${comp.competencia}**\\n\\n` + (comp.capacidades || []).map(c => `• ${c}`).join('\\n')),
                                    makeCell(comp.estandar, 1, false),
                                    makeCell((comp.desempenos || []).map(d => `• ${d}`).join('\\n'))
                                ]
                            }))
                        ]
                    }),
                    spacer(),

                    // VII. ENFOQUES
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [makeHeaderCell('VII. ENFOQUES TRANSVERSALES', 3)] }),
                            new TableRow({ children: [makeSubHeaderCell('ENFOQUE'), makeSubHeaderCell('VALORES'), makeSubHeaderCell('ACTITUDES')] }),
                            ...(data.enfoques_transversales || []).map(enf => new TableRow({
                                children: [
                                    makeCell(enf.enfoque, 1, true),
                                    makeCell(enf.valores),
                                    makeCell(`Estudiantes: ${enf.actitudes}\\n\\nDocente: ${enf.actitud_docente}`)
                                ]
                            }))
                        ]
                    }),
                    spacer(),

                    // VIII. SECUENCIA DIDÁCTICA
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [makeHeaderCell('VIII. SECUENCIA DIDÁCTICA DE SESIONES', 4)] }),
                            new TableRow({ children: [makeSubHeaderCell('SEMANA'), makeSubHeaderCell('TÍTULO DE LA SESIÓN'), makeSubHeaderCell('PROPÓSITO'), makeSubHeaderCell('TIEMPO')] }),
                            ...(data.secuencia_sesiones || []).map(ses => new TableRow({
                                children: [
                                    makeCell(ses.semana, 1, true, AlignmentType.CENTER),
                                    makeCell(ses.titulo, 1, true),
                                    makeCell(ses.proposito),
                                    makeCell(ses.tiempo, 1, false, AlignmentType.CENTER)
                                ]
                            }))
                        ]
                    }),
                    spacer(),

                    // IX. EVALUACIÓN e INSTRUMENTOS
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [makeHeaderCell('IX. EVALUACIÓN Y ORIENTACIONES', 2)] }),
                            new TableRow({ children: [makeSubHeaderCell('CRITERIOS Y EVIDENCIAS'), makeSubHeaderCell('ORIENTACIONES PEDAGÓGICAS')] }),
                            new TableRow({
                                children: [
                                    makeCell(`**Criterios:**\\n${(data.evaluacion.criterios || []).join('\\n')}\\n\\n**Evidencias:**\\n${(data.evaluacion.evidencias || []).join('\\n')}\\n\\n**Instrumentos:**\\n${(data.evaluacion.instrumentos || []).join('\\n')}`),
                                    makeCell(data.orientaciones_pedagogicas)
                                ]
                            })
                        ]
                    }),
                    spacer(400),

                    // FIRMAS
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '__________________________', size: 18, font: 'Calibri' })] }),
                                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'DIRECTOR(A)', bold: true, size: 18, font: 'Calibri' })] })
                                        ], borders: NO_BORDERS
                                    }),
                                    new TableCell({
                                        children: [
                                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '__________________________', size: 18, font: 'Calibri' })] }),
                                            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'DOCENTE DE ÁREA', bold: true, size: 18, font: 'Calibri' })] })
                                        ], borders: NO_BORDERS
                                    })
                                ]
                            })
                        ]
                    })
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Unidad_${(d.ciclo_grado || 'Grado').replace(/\s+/g, '_')}_EduFisica.docx`);
    } catch (error) {
        console.error("Error Word:", error);
        alert("Error: " + error.message);
    }
};


// ==================== UNIT PREVIEW COMPONENT ====================
function UnitPreview({ data }) {
    if (!data) return null;
    const d = data.datos_informativos;

    const tableStyle = {
        width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem',
    };
    const thStyle = {
        background: 'linear-gradient(135deg, #1a56db, #1e40af)', color: '#fff',
        padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 700,
        fontSize: '0.85rem', border: '1px solid #334155',
    };
    const subThStyle = {
        background: 'rgba(30, 64, 175, 0.15)', color: 'var(--color-primary)',
        padding: '0.5rem 0.8rem', fontWeight: 600, fontSize: '0.8rem',
        border: '1px solid rgba(100, 116, 139, 0.3)', whiteSpace: 'nowrap',
    };
    const tdStyle = {
        padding: '0.5rem 0.8rem', border: '1px solid rgba(100, 116, 139, 0.3)',
        color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.82rem',
    };

    return (
        <div className="admin-table-wrapper" style={{ padding: '0.5rem', background: '#0f172a' }}>
            {/* TÍTULO */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                    📖 {data.titulo_unidad || 'UNIDAD DE APRENDIZAJE'}
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Alineado al CNEB</span>
            </div>

            {/* I. DATOS INFORMATIVOS */}
            <table style={tableStyle}>
                <thead><tr><th colSpan="4" style={thStyle}>II. DATOS INFORMATIVOS</th></tr></thead>
                <tbody>
                    <tr><td style={subThStyle}>Docente</td><td style={tdStyle}>{d.docente}</td><td style={subThStyle}>I.E.</td><td style={tdStyle}>{d.ie}</td></tr>
                    <tr><td style={subThStyle}>Director(a)</td><td style={tdStyle}>{d.director}</td><td style={subThStyle}>Área</td><td style={tdStyle}>{d.area}</td></tr>
                    <tr><td style={subThStyle}>Nivel</td><td style={tdStyle}>{d.nivel}</td><td style={subThStyle}>Grado/Ciclo</td><td style={tdStyle}>{d.ciclo_grado}</td></tr>
                    <tr><td style={subThStyle}>Año Lectivo</td><td style={tdStyle}>{d.anio} ({d.periodo})</td><td style={subThStyle}>Duración</td><td style={tdStyle}>{d.duracion}</td></tr>
                    <tr><td style={subThStyle}>Fechas</td><td style={tdStyle}>{d.fechas}</td><td style={subThStyle}>Estudiantes/Turno</td><td style={tdStyle}>{d.num_estudiantes} / {d.turno}</td></tr>
                </tbody>
            </table>

            {/* JUSTIFICACIÓN Y PROPÓSITO */}
            <table style={tableStyle}>
                <thead><tr><th style={thStyle}>III. JUSTIFICACIÓN Y PROPÓSITO DE LA UNIDAD</th></tr></thead>
                <tbody>
                    <tr><td style={{ ...tdStyle, lineHeight: 1.8 }}><strong>Justificación:</strong><br />{data.justificacion}</td></tr>
                    <tr><td style={{ ...tdStyle, lineHeight: 1.8 }}><strong>Propósito General:</strong><br />{data.proposito_unidad}</td></tr>
                </tbody>
            </table>

            {/* SITUACIÓN SIGNIFICATIVA */}
            <table style={tableStyle}>
                <thead><tr><th style={thStyle}>IV. SITUACIÓN SIGNIFICATIVA / RETO</th></tr></thead>
                <tbody><tr><td style={{ ...tdStyle, lineHeight: 1.8, fontStyle: 'italic', background: 'rgba(39, 174, 96, 0.05)' }}>{data.situacion_significativa}</td></tr></tbody>
            </table>

            {/* PRODUCTO */}
            <table style={tableStyle}>
                <thead><tr><th style={thStyle}>V. PRODUCTO DE LA UNIDAD</th></tr></thead>
                <tbody><tr><td style={{ ...tdStyle, lineHeight: 1.8, fontWeight: 700, color: 'var(--color-primary)' }}>{data.producto_unidad}</td></tr></tbody>
            </table>

            {/* PROPÓSITOS DE APRENDIZAJE */}
            <table style={tableStyle}>
                <thead><tr><th colSpan="3" style={thStyle}>VI. PROPÓSITOS DE APRENDIZAJE</th></tr></thead>
                <tbody>
                    <tr><td style={subThStyle}>Competencia y Capacidades</td><td style={subThStyle}>Estándar (CNEB)</td><td style={subThStyle}>Desempeños</td></tr>
                    {(data.competencias_capacidades_estandar || []).map((comp, i) => (
                        <tr key={i}>
                            <td style={{ ...tdStyle, width: '30%' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{comp.competencia}</strong>
                                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', marginBottom: 0 }}>
                                    {(comp.capacidades || []).map((c, j) => <li key={j} style={{ marginBottom: '0.2rem' }}>{c}</li>)}
                                </ul>
                            </td>
                            <td style={{ ...tdStyle, width: '35%', fontStyle: 'italic', opacity: 0.9 }}>{comp.estandar}</td>
                            <td style={{ ...tdStyle, width: '35%' }}>
                                <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                    {(comp.desempenos || []).map((d, j) => <li key={j} style={{ marginBottom: '0.4rem' }}>{d}</li>)}
                                </ul>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ENFOQUES TRANSVERSALES */}
            <table style={tableStyle}>
                <thead><tr><th colSpan="3" style={thStyle}>VII. ENFOQUES TRANSVERSALES</th></tr></thead>
                <tbody>
                    <tr><td style={subThStyle}>Enfoque</td><td style={subThStyle}>Valores</td><td style={subThStyle}>Actitudes</td></tr>
                    {(data.enfoques_transversales || []).map((enf, i) => (
                        <tr key={i}>
                            <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-primary)', width: '25%' }}>{enf.enfoque}</td>
                            <td style={{ ...tdStyle, width: '25%' }}>{enf.valores}</td>
                            <td style={{ ...tdStyle }}>
                                <div style={{ marginBottom: '0.5rem' }}><strong>Estudiantes:</strong> {enf.actitudes}</div>
                                <div><strong>Docente:</strong> {enf.actitud_docente}</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* SECUENCIA DE SESIONES */}
            <table style={tableStyle}>
                <thead>
                    <tr><th colSpan="4" style={thStyle}>VIII. SECUENCIA DIDÁCTICA DE SESIONES</th></tr>
                    <tr><td style={{ ...subThStyle, textAlign: 'center' }}>Semana</td><td style={subThStyle}>Título de la Sesión</td><td style={subThStyle}>Propósito</td><td style={{ ...subThStyle, textAlign: 'center' }}>Tiempo</td></tr>
                </thead>
                <tbody>
                    {(data.secuencia_sesiones || []).map((ses, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                            <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--color-primary)', textAlign: 'center', width: '10%' }}>{ses.semana}</td>
                            <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-primary)', width: '35%' }}>{ses.titulo}</td>
                            <td style={{ ...tdStyle, width: '45%' }}>{ses.proposito}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', width: '10%' }}>{ses.tiempo}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* EVALUACIÓN */}
            {data.evaluacion && (
                <table style={tableStyle}>
                    <thead><tr><th colSpan="3" style={thStyle}>IX. EVALUACIÓN DE LA UNIDAD</th></tr></thead>
                    <tbody>
                        <tr><td style={subThStyle}>Criterios Generales</td><td style={subThStyle}>Evidencias</td><td style={subThStyle}>Instrumentos</td></tr>
                        <tr>
                            <td style={tdStyle}><ul style={{ paddingLeft: '1.2rem', margin: 0 }}>{(data.evaluacion.criterios || []).map((c, i) => <li key={i}>{c}</li>)}</ul></td>
                            <td style={tdStyle}><ul style={{ paddingLeft: '1.2rem', margin: 0 }}>{(data.evaluacion.evidencias || []).map((e, i) => <li key={i}>{e}</li>)}</ul></td>
                            <td style={tdStyle}><ul style={{ paddingLeft: '1.2rem', margin: 0 }}>{(data.evaluacion.instrumentos || []).map((inst, i) => <li key={i}>{inst}</li>)}</ul></td>
                        </tr>
                    </tbody>
                </table>
            )}

            {/* ORIENTACIONES Y REFERENCIAS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <table style={{ ...tableStyle, marginBottom: 0 }}>
                    <thead><tr><th style={thStyle}>X. ORIENTACIONES PEDAGÓGICAS</th></tr></thead>
                    <tbody><tr><td style={{ ...tdStyle, lineHeight: 1.6 }}>{data.orientaciones_pedagogicas}</td></tr></tbody>
                </table>
                <table style={{ ...tableStyle, marginBottom: 0 }}>
                    <thead><tr><th style={thStyle}>XI. REFERENCIAS BIBLIOGRÁFICAS</th></tr></thead>
                    <tbody><tr><td style={{ ...tdStyle, lineHeight: 1.6 }}><ul style={{ paddingLeft: '1.2rem', margin: 0 }}>{(data.referencias || []).map((r, i) => <li key={i}>{r}</li>)}</ul></td></tr></tbody>
                </table>
            </div>
        </div>
    );
}


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
    const [unitData, setUnitData] = useState(null);

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

    const [suggestingField, setSuggestingField] = useState(null);

    const handleSuggestAI = async (field) => {
        setSuggestingField(field);
        let prompt = "";
        const contextoGrado = `${formData.grado || 'un grado'} de ${formData.nivel || 'un nivel'}`;

        switch (field) {
            case 'tituloUnidad':
                prompt = `Actúa como experto en educación. Sugiere 1 único título completo, motivador y creativo (máximo 12 palabras) para una unidad de aprendizaje de Educación Física para estudiantes de ${contextoGrado}. Temas: ${formData.temasClave || 'educación física'}. REGLA: Devuelve SOLO el título. PROHIBIDO usar puntos suspensivos (...). PROHIBIDO usar comillas o introducciones.`;
                break;
            case 'temasClave':
                prompt = `Sugiere temas clave para una unidad de Educación Física para ${contextoGrado}. REGLA: Devuelve SOLO los temas separados por comas, finalizando con un punto final. PROHIBIDO usar puntos suspensivos, viñetas o texto de introducción.`;
                break;
            case 'contexto':
                prompt = `Sugiere un breve contexto sociodemográfico y necesidades de aprendizaje típicas de estudiantes de ${contextoGrado} en Perú, para Educación Física. REGLA: Devuelve SOLO un párrafo completo redactado, finalizado con punto final. PROHIBIDO usar puntos suspensivos.`;
                break;
            case 'integracionAreas':
                prompt = `Sugiere áreas curriculares con las que se podría integrar una unidad de Educación Física sobre ${formData.temasClave || 'deportes y salud'} para ${contextoGrado}, y explícalo de forma breve. REGLA: Devuelve SOLO el párrafo redactado completo. PROHIBIDO usar puntos suspensivos.`;
                break;
            case 'productoFinal':
                prompt = `Sugiere un producto final (tangible o indirecto) completo para una unidad de Educación Física de ${contextoGrado} sobre ${formData.temasClave || 'educación física'}. REGLA: Devuelve SOLO la descripción completa terminando en punto. PROHIBIDO usar puntos suspensivos.`;
                break;
            case 'evaluacionFormativa':
                prompt = `Redacta un breve párrafo con los lineamientos de evaluación formativa orientados a competencias para una unidad de Educación Física de ${contextoGrado}. REGLA: Termina la idea completamente con un punto. PROHIBIDO usar puntos suspensivos.`;
                break;
            default:
                break;
        }

        try {
            const res = await generateFastSuggestion(prompt);
            setFormData(prev => ({ ...prev, [field]: res.replace(/^"|"$/g, '').trim() }));
        } catch (error) {
            console.error(`Error generating suggestion for ${field}`, error);
        } finally {
            setSuggestingField(null);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);

        try {
            const result = await generateStructuredUnit(formData);
            if (result.success) {
                setUnitData(result.data);
                setCurrentStep(4);
            } else {
                alert("Error: " + result.error);
            }
        } catch (error) {
            console.error("Error generating unit", error);
            alert("Error: " + error.message);
        } finally {
            setGenerating(false);
        }
    };

    const downloadAsWord = async () => {
        if (!unitData) return;
        try {
            await exportToWord(unitData);
        } catch (err) {
            console.error("Error exportando Word:", err);
            alert("Error al intentar descargar Word.");
        }
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
                    <button type="button" onClick={() => handleSuggestAI('tituloUnidad')} disabled={suggestingField === 'tituloUnidad'} className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', gap: '0.3rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'none' }}>
                        {suggestingField === 'tituloUnidad' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Sugerir Título
                    </button>
                </div>
                <textarea className="form-textarea" placeholder="Ej: Conocemos nuestro cuerpo y mejoramos la salud..." value={formData.tituloUnidad} onChange={e => setFormData({ ...formData, tituloUnidad: e.target.value })} style={{ minHeight: '60px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: 0 }}>2. Temas Clave por Área:</label>
                    <button type="button" onClick={() => handleSuggestAI('temasClave')} disabled={suggestingField === 'temasClave'} className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', gap: '0.3rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'none' }}>
                        {suggestingField === 'temasClave' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Sugerir Temas
                    </button>
                </div>
                <div style={{ background: 'var(--glass-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--color-primary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Educación Física:</label>
                    <textarea className="form-textarea" placeholder="Ej: Medidas antropométricas, juegos tradicionales, coordinación..." value={formData.temasClave} onChange={e => setFormData({ ...formData, temasClave: e.target.value })} style={{ minHeight: '80px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
            </div>

            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: 0 }}>3. Contexto de los Estudiantes:</label>
                    <button type="button" onClick={() => handleSuggestAI('contexto')} disabled={suggestingField === 'contexto'} className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', gap: '0.3rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'none' }}>
                        {suggestingField === 'contexto' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Sugerir Contexto
                    </button>
                </div>
                <textarea className="form-textarea" placeholder="Contexto de los estudiantes (Opcional pero recomendado). Ejm: Los estudiantes viven en una zona rural..." value={formData.contexto} onChange={e => setFormData({ ...formData, contexto: e.target.value })} style={{ minHeight: '100px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: 0 }}>3.1. Integración con otras áreas (Opcional):</label>
                    <button type="button" onClick={() => handleSuggestAI('integracionAreas')} disabled={suggestingField === 'integracionAreas'} className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', gap: '0.3rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'none' }}>
                        {suggestingField === 'integracionAreas' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Sugerir Integración
                    </button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Si esta unidad se vincula con otras áreas curriculares, especifica cuáles y cómo. Déjalo vacío si es de área única.</p>
                <textarea className="form-textarea" placeholder="Ejemplo: Esta unidad se vincula con Comunicación para la producción de textos descriptivos..." value={formData.integracionAreas} onChange={e => setFormData({ ...formData, integracionAreas: e.target.value })} style={{ minHeight: '80px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
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
                        <textarea className="form-textarea" placeholder="Redacta la situación problemática completa aquí..." value={formData.situacionManual} onChange={e => setFormData({ ...formData, situacionManual: e.target.value })} style={{ minHeight: '150px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
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
                        <div key={comp} onClick={() => toggleArrayItem('competencias', comp)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <div style={{
                                width: '22px', height: '22px', borderRadius: '4px',
                                border: `2px solid ${formData.competencias.includes(comp) ? 'var(--color-primary)' : 'var(--text-muted)'} `,
                                background: formData.competencias.includes(comp) ? 'var(--color-primary)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {formData.competencias.includes(comp) && <Check size={14} color="#000" strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: '0.95rem', color: formData.competencias.includes(comp) ? 'white' : 'var(--text-secondary)' }}>{comp}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 600 }}>15. Enfoques Transversales a priorizar:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {enfoquesLista.map(enf => (
                        <div key={enf} onClick={() => toggleArrayItem('enfoques', enf)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <div style={{
                                width: '22px', height: '22px', borderRadius: '4px',
                                border: `2px solid ${formData.enfoques.includes(enf) ? 'var(--color-primary)' : 'var(--text-muted)'} `,
                                background: formData.enfoques.includes(enf) ? 'var(--color-primary)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {formData.enfoques.includes(enf) && <Check size={14} color="#000" strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: '0.9rem', color: formData.enfoques.includes(enf) ? 'white' : 'var(--text-secondary)' }}>{enf}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: 0 }}>16. Producto Final de la Unidad:</label>
                    <button type="button" onClick={() => handleSuggestAI('productoFinal')} disabled={suggestingField === 'productoFinal'} className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', gap: '0.3rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'none' }}>
                        {suggestingField === 'productoFinal' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Sugerir Producto
                    </button>
                </div>
                <input type="text" className="form-input" placeholder="Ej: Organización de un mini-torneo deportivo, Exposición sobre vida saludable..." value={formData.productoFinal} onChange={e => setFormData({ ...formData, productoFinal: e.target.value })} style={{ background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: 0 }}>17. Evaluación Formativa (Ruta general):</label>
                    <button type="button" onClick={() => handleSuggestAI('evaluacionFormativa')} disabled={suggestingField === 'evaluacionFormativa'} className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', gap: '0.3rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'none' }}>
                        {suggestingField === 'evaluacionFormativa' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Sugerir Evaluación
                    </button>
                </div>
                <textarea className="form-textarea" placeholder="Narra los lineamientos de evaluación..." value={formData.evaluacionFormativa} onChange={e => setFormData({ ...formData, evaluacionFormativa: e.target.value })} style={{ minHeight: '100px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
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
                                Generador de <span className="text-gradient">Unidades</span>
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
                    <h3 style={{ marginBottom: '1.5rem' }}>¿Qué te resuelve el Generador?</h3>
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
                        Generador de Unidades
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Asistente inteligente para docentes</p>
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

                        {currentStep === 4 && unitData && (
                            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                    <button className="btn btn-secondary" onClick={() => { navigator.clipboard.writeText(JSON.stringify(unitData, null, 2)); alert("¡JSON Copiado!") }}>Copiar Texto</button>
                                    <button className="btn btn-secondary" onClick={downloadAsWord}>
                                        <FileText size={16} style={{ marginRight: '0.5rem' }} /> Descargar en Word
                                    </button>
                                    <button className="btn btn-primary" onClick={() => window.print()}>
                                        <Download size={16} style={{ marginRight: '0.5rem' }} /> Imprimir PDF
                                    </button>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <UnitPreview data={unitData} />
                                </div>
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
