import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, ArrowLeft, Plus, Download, FileText, Check,
    ChevronRight, Edit3, Trash2, CheckCircle2,
    Sparkles, Loader2, Save, Building2, User, Users, BookOpen, Layers, Target, Activity
} from 'lucide-react';
import { generateStructuredAnnualPlan, generateAIContent } from './gemini';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, HeadingLevel, ShadingType, VerticalAlign } from 'docx';
import { saveAs } from 'file-saver';

const STEPS = [
    'Bloque Administrativo',
    'Bloque de Diagnóstico',
    'Bloque de Contexto',
    'Bloque de Calendarización',
    'Enfoques Transversales',
    'Tutoría y Orientación',
    'Generar Plan',
    'Vista Previa'
];

const PlanAnualPage = ({ onNavigate, user }) => {
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [currentStep, setCurrentStep] = useState(0);
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [isSuggestingJustification, setIsSuggestingJustification] = useState(false);
    const [isSuggestingPerfil, setIsSuggestingPerfil] = useState(false);
    const [isSuggestingTutoria, setIsSuggestingTutoria] = useState(false);
    const [isSuggestingEvaluacion, setIsSuggestingEvaluacion] = useState(false);
    const [isSuggestingRecursos, setIsSuggestingRecursos] = useState(false);

    // New Modal State
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
    const [currentUnitModalData, setCurrentUnitModalData] = useState(null);
    const [isSuggestingModalTitulo, setIsSuggestingModalTitulo] = useState(false);
    const [isSuggestingModalSituacion, setIsSuggestingModalSituacion] = useState(false);
    const [isSuggestingModalProducto, setIsSuggestingModalProducto] = useState(false);

    const [formData, setFormData] = useState({
        modalidad: 'EBR - Educación Básica Regular',
        nivel: 'Secundaria',
        grado: 'Tercero',
        seccion: 'A',
        ie: '',
        dre: '',
        ugel: '',
        docente: '',
        anio: new Date().getFullYear().toString(),
        diagnostico: '', // Bloque de Diagnóstico
        contextoDemandas: '', // Bloque de Contexto (Cartel de Demandas)
        divisionAno: 'Bimestres',
        semanasLectivas: 36,
        unidades: [
            { id: 1, periodo: 1, titulo: 'Unidad 0: Evaluación Diagnóstica y Antropometría', fechaInicio: '', fechaFin: '', competencias: [], situacionSignificativa: '', productoIntegrador: '' },
        ],
        enfoques: [],
        dimensionesTutoria: [],
        actividadesTutoria: '',
        evaluacion: '',
        recursos: '',
        director: ''
    });

    const [plans, setPlans] = useState([
        { id: '1', title: 'Planización Anual 2026 - Primaria', level: '1ero a 6to Primaria', lastModified: '2026-02-28', status: 'En Progreso' },
        { id: '2', title: 'Programación Curricular - Secundaria', level: '1ero a 5to Secundaria', lastModified: '2026-01-15', status: 'Completado' },
    ]);

    // Suggestion handlers for Unit Modal remain as they are used


    const handleSuggestModalSituacion = async () => {
        setIsSuggestingModalSituacion(true);
        try {
            const prompt = `Actúa como un experto pedagogo. Genera una SITUACIÓN SIGNIFICATIVA NARRATIVA (no un resumen) para la unidad "${currentUnitModalData?.titulo || 'Sin título'}". 
REGLAS:
1. Contexto Real: Usa el Cartel de Demandas (${formData.contextoDemandas || 'interés por el deporte'}) para describir una problemática o interés real de los estudiantes de ${formData.grado} de ${formData.nivel}.
2. Conflicto Cognitivo / Reto: Incluye preguntas desafiantes (¿Cómo podemos...? ¿De qué manera...?) que movilicen: Se desenvuelve, Asume e Interactúa.
3. Producto Claro: Menciona un producto tangible (ej. un plan, un torneo, una rutina).
4. Tono: Motivador.
Máximo 150 palabras. No devuelvas comillas.`;
            const result = await generateAIContent(prompt);
            setCurrentUnitModalData(prev => ({ ...prev, situacionSignificativa: result }));
        } catch (e) {
            console.error("Error AI Situacion:", e);
            alert(`Error en sugerencia: ${e.message}`);
        }
        setIsSuggestingModalSituacion(false);
    };

    const handleSuggestModalProducto = async () => {
        setIsSuggestingModalProducto(true);
        try {
            const prompt = `Sugiere un producto integrador breve (10 palabras max) para una unidad de Educación Física titulada "${currentUnitModalData?.titulo || 'Sin título'}". Nivel: ${formData.nivel}, Grado: ${formData.grado}. No devuelvas comillas.`;
            const result = await generateAIContent(prompt);
            setCurrentUnitModalData(prev => ({ ...prev, productoIntegrador: result }));
        } catch (e) {
            console.error("Error AI Producto:", e);
            alert(`Error en sugerencia: ${e.message}`);
        }
        setIsSuggestingModalProducto(false);
    };

    const handleSuggestModalTitulo = async () => {
        setIsSuggestingModalTitulo(true);
        try {
            const prompt = `Sugiere UN SOLO título atractivo, formativo y relacionado al entorno real para una unidad de Educación Física. 
Nivel: ${formData.nivel}, Grado: ${formData.grado}.
Solo devuelve el texto del título (máximo 12 palabras), sin comillas y sin punto final.`;
            const result = await generateAIContent(prompt);
            setCurrentUnitModalData(prev => ({ ...prev, titulo: result }));
        } catch (e) {
            console.error("Error AI TituloModal:", e);
        }
        setIsSuggestingModalTitulo(false);
    };

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

    const openAddUnidadModal = (periodoIndex) => {
        setCurrentUnitModalData({
            id: null,
            periodo: periodoIndex,
            titulo: '',
            fechaInicio: '',
            fechaFin: '',
            competencias: [],
            situacionSignificativa: '',
            productoIntegrador: ''
        });
        setIsUnitModalOpen(true);
    };

    const openEditUnidadModal = (unidad) => {
        setCurrentUnitModalData({
            ...unidad,
            competencias: unidad.competencias || [],
            situacionSignificativa: unidad.situacionSignificativa || '',
            productoIntegrador: unidad.productoIntegrador || ''
        });
        setIsUnitModalOpen(true);
    };

    const saveUnitModal = () => {
        if (currentUnitModalData.id) {
            // Edit existing
            setFormData(prev => ({
                ...prev,
                unidades: prev.unidades.map(u => u.id === currentUnitModalData.id ? currentUnitModalData : u)
            }));
        } else {
            // Add new
            setFormData(prev => ({
                ...prev,
                unidades: [
                    ...prev.unidades,
                    { ...currentUnitModalData, id: Date.now() }
                ]
            }));
        }
        setIsUnitModalOpen(false);
    };

    const getUnitGlobalNumber = (unitId) => {
        const sortedUnits = [...formData.unidades].sort((a, b) => {
            if (a.periodo !== b.periodo) return a.periodo - b.periodo;
            return (a.id || 0) - (b.id || 0);
        });
        
        const unit = sortedUnits.find(u => u.id === unitId);
        if (!unit) return 0;
        
        if (unit.titulo.toLowerCase().includes('diagnóstica') || unit.titulo.toLowerCase().includes('antropométricas')) {
            return 0;
        }
        
        const index = sortedUnits.findIndex(u => u.id === unitId);
        const nonDiagBefore = sortedUnits.slice(0, index).filter(u => 
            !u.titulo.toLowerCase().includes('diagnóstica') && !u.titulo.toLowerCase().includes('antropométricas')
        ).length;
        
        return nonDiagBefore + 1;
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

    const downloadAsWord = async () => {
        if (!result) return;
        try {
            const primaryBlue = '2563eb';
            const lightBlue = 'f1f5f9';
            const white = 'ffffff';

            const makeTextRuns = (str, bold = false, size = 20, color = '000000', italics = false) => {
                const text = (str == null ? '' : str).toString();
                const runs = [];
                text.split('\n').forEach((line, index) => {
                    if (index > 0) runs.push(new TextRun({ break: 1 }));
                    runs.push(new TextRun({ text: line, size, font: 'Segoe UI', bold, color, italics }));
                });
                return runs;
            };

            const NO_BORDERS = {
                top: { style: BorderStyle.NIL },
                bottom: { style: BorderStyle.NIL },
                left: { style: BorderStyle.NIL },
                right: { style: BorderStyle.NIL },
            };

            const makeStyledHeader = (num, title) => {
                return new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: NO_BORDERS,
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    width: { size: 400, type: WidthType.DXA },
                                    shading: { type: ShadingType.SOLID, color: primaryBlue, fill: primaryBlue },
                                    margins: { left: 100, right: 100, top: 50, bottom: 50 },
                                    children: [new Paragraph({ 
                                        children: [new TextRun({ text: num, color: white, bold: true, size: 22 })],
                                        alignment: AlignmentType.CENTER
                                    })]
                                }),
                                new TableCell({
                                    margins: { left: 200, bottom: 100 },
                                    borders: { bottom: { style: BorderStyle.SINGLE, size: 12, color: primaryBlue } },
                                    children: [new Paragraph({ 
                                        children: [new TextRun({ text: `  ${title.toUpperCase()}`, color: primaryBlue, bold: true, size: 24 })],
                                        alignment: AlignmentType.LEFT
                                    })]
                                })
                            ]
                        })
                    ]
                });
            };

            const seccionesRows = [];
            const d = result.datos_informativos || {};

            // INSTITUTIONAL HEADER
            seccionesRows.push(new Paragraph({
                children: [
                    new TextRun({ text: "PERÚ - MINISTERIO DE EDUCACIÓN", bold: true, size: 16 }),
                    new TextRun({ break: 1, text: `DRE: ${d.dre || formData.dre}`, bold: true, size: 14 }),
                    new TextRun({ break: 1, text: `UGEL: ${d.ugel || formData.ugel}`, bold: true, size: 14 }),
                ],
                spacing: { after: 400 }
            }));

            seccionesRows.push(new Paragraph({
                children: [new TextRun({ text: (result.titulo_principal || 'PLANIFICACIÓN CURRICULAR ANUAL').toUpperCase(), bold: true, size: 44, color: '0f172a' })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 800 }
            }));

            seccionesRows.push(new Paragraph({
                children: [new TextRun({ text: `Educación Física - Año Lectivo ${d.anio || formData.anio}`, size: 28, color: primaryBlue, bold: true })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 1200 }
            }));

            // I. DATOS
            seccionesRows.push(makeStyledHeader('I', 'Datos Informativos'));
            const datosRows = [
                ['DRE / UGEL', `${d.dre || formData.dre} / ${d.ugel || formData.ugel}`],
                ['INSTITUCIÓN EDUCATIVA', d.ie || formData.ie],
                ['NIVEL / MODALIDAD', d.nivel || formData.nivel],
                ['GRADO Y SECCIÓN', `${d.grado || formData.grado} - ${d.seccion || formData.seccion}`],
                ['DOCENTE RESPONSABLE', d.docente || formData.docente],
                ['DIRECTOR(A)', d.director || formData.director],
                ['AÑO LECTIVO', d.anio || formData.anio]
            ].map(([label, val]) => new TableRow({
                children: [
                    new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: makeTextRuns(label, true), margins: { left: 100 } })] }),
                    new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: makeTextRuns(val), margins: { left: 100 } })] })
                ]
            }));
            seccionesRows.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: datosRows, spacing: { before: 400 } }));

            // II. DIAGNÓSTICO
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 400 } }));
            seccionesRows.push(makeStyledHeader('II', 'Descripción General y Resultados Diagnósticos'));
            const diag = result.seccion_2_diagnostico || {};
            seccionesRows.push(new Paragraph({ children: makeTextRuns('2.1 Características de los Estudiantes:', true, 22, primaryBlue), spacing: { before: 300 } }));
            seccionesRows.push(new Paragraph({ children: makeTextRuns(diag.caracteristicas_estudiantes), alignment: AlignmentType.JUSTIFIED }));
            seccionesRows.push(new Paragraph({ children: makeTextRuns('2.2 Características del Contexto:', true, 22, primaryBlue), spacing: { before: 300 } }));
            seccionesRows.push(new Paragraph({ children: makeTextRuns(diag.caracteristicas_contexto), alignment: AlignmentType.JUSTIFIED }));
            seccionesRows.push(new Paragraph({ children: [new TextRun({ text: '2.3 Resultados diagnósticos:', bold: true, size: 22, color: primaryBlue })], spacing: { before: 300 } }));
            seccionesRows.push(new Paragraph({ children: [new TextRun({ text: diag.resultados_espacio || '[Espacio para pegar cuadros de evaluación]', italics: true, color: '64748b' })], shading: { fill: 'f8fafc' } }));

            // III & IV placeholders
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 400 } }));
            seccionesRows.push(makeStyledHeader('III', 'Calendarización Escolar'));
            seccionesRows.push(new Paragraph({ children: [new TextRun({ text: result.seccion_3_calendarizacion || '[Pegar cronograma aquí]', italics: true, color: '64748b' })], spacing: { before: 200 } }));
            
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 400 } }));
            seccionesRows.push(makeStyledHeader('IV', 'Demandas y Prioridades de Gestión'));
            seccionesRows.push(new Paragraph({ children: [new TextRun({ text: result.seccion_4_demandas || '[Pegar cartel de demandas aquí]', italics: true, color: '64748b' })], spacing: { before: 200 } }));

            // V. PROPÓSITOS DE APRENDIZAJE
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 400 } }));
            seccionesRows.push(makeStyledHeader('V', 'Propósitos de Aprendizaje'));
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 200, after: 200 } }));
            const propositosTableRows = [
                new TableRow({
                    children: [
                        new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'Competencia', bold: true })], alignment: AlignmentType.CENTER })] }),
                        new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'Capacidades', bold: true })], alignment: AlignmentType.CENTER })] }),
                    ]
                })
            ];
            (result.seccion_5_propositos || []).forEach(p => {
                propositosTableRows.push(new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: p.competencia, bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: makeTextRuns(Array.isArray(p.capacidades) ? p.capacidades.join('\n') : p.capacidades) })] }),
                    ]
                }));
            });
            seccionesRows.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: propositosTableRows, spacing: { before: 200 } }));

            // VI. ORGANIZACIÓN DE UNIDADES (MATRIZ)
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 400 } }));
            seccionesRows.push(makeStyledHeader('VI', 'Organización de las Unidades Didácticas'));
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 200, after: 200 } }));
            
            const matrixTitleRow = new TableRow({
                children: [
                    new TableCell({
                        columnSpan: 5,
                        shading: { fill: primaryBlue },
                        children: [new Paragraph({ children: [new TextRun({ text: 'ORGANIZACIÓN DE LAS UNIDADES DIDÁCTICAS', bold: true, color: 'ffffff' })], alignment: AlignmentType.CENTER })]
                    })
                ]
            });

            const matrixHeader = new TableRow({
                children: [
                    new TableCell({ width: { size: 5, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'U', bold: true })], alignment: AlignmentType.CENTER })] }),
                    new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'Título de Unidad', bold: true })], alignment: AlignmentType.CENTER })] }),
                    new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'Competencia', bold: true })], alignment: AlignmentType.CENTER })] }),
                    new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'Capacidades', bold: true })], alignment: AlignmentType.CENTER })] }),
                    new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'Enfoques', bold: true })], alignment: AlignmentType.CENTER })] }),
                ]
            });

            const unitRows = [matrixTitleRow, matrixHeader];
            (result.organizacion_unidades || []).forEach(u => {
                unitRows.push(new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: makeTextRuns(u.nro), alignment: AlignmentType.CENTER })] }),
                        new TableCell({ children: [new Paragraph({ children: makeTextRuns(u.titulo, true) })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: u.competencia_nombre || '', size: 16 })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: Array.isArray(u.capacidades) ? u.capacidades.join(', ') : u.capacidades || '', size: 14 })] })] }),
                        new TableCell({ children: [new Paragraph({ children: makeTextRuns(Array.isArray(u.enfoques) ? u.enfoques.join(', ') : (u.enfoques || ''), false, 14) })] }),
                    ]
                }));
            });
            seccionesRows.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: unitRows, spacing: { before: 200 } }));

            // VII. ESTANDARES
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 400 } }));
            seccionesRows.push(makeStyledHeader('VII', 'Estándares y Desempeños Precisados'));
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 200, after: 200 } }));
            
            const estandaresRows = [
                new TableRow({
                    children: [
                        new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'Estándar de Aprendizaje', bold: true })], alignment: AlignmentType.CENTER })] }),
                        new TableCell({ width: { size: 60, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'Desempeños Precisados', bold: true })], alignment: AlignmentType.CENTER })] }),
                    ]
                })
            ];

            (result.estandares_desempenos || []).forEach(ed => {
                estandaresRows.push(new TableRow({
                    children: [
                        new TableCell({ children: [
                            new Paragraph({ children: [new TextRun({ text: ed.competencia, bold: true, color: primaryBlue })], spacing: { after: 100 } }),
                            new Paragraph({ children: [new TextRun({ text: ed.estandar, size: 18, italics: true })], alignment: AlignmentType.JUSTIFIED })
                        ], verticalAlign: VerticalAlign.TOP }),
                        new TableCell({ children: [
                            new Paragraph({ children: makeTextRuns(ed.desempenos_precisados, false, 18), alignment: AlignmentType.JUSTIFIED })
                        ], verticalAlign: VerticalAlign.TOP })
                    ]
                }));
            });
            seccionesRows.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: estandaresRows, spacing: { before: 200 } }));

            // VIII. ENFOQUES TRANSVERSALES
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 400 } }));
            seccionesRows.push(makeStyledHeader('VIII', 'Enfoques Transversales Priorizados'));
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 200, after: 200 } }));
            const enfoquesRows = [
                new TableRow({
                    children: [
                        new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'Enfoque', bold: true })], alignment: AlignmentType.CENTER })] }),
                        new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'Actitudes Docente', bold: true })], alignment: AlignmentType.CENTER })] }),
                        new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'Actitudes Estudiantes', bold: true })], alignment: AlignmentType.CENTER })] }),
                    ]
                })
            ];
            (result.enfoques_transversales_detalle || []).forEach(enf => {
                enfoquesRows.push(new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: enf.enfoque, bold: true, size: 18 })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: enf.actitudes_docente, size: 16 })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: enf.actitudes_estudiantes, size: 16 })] })] }),
                    ]
                }));
            });
            seccionesRows.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: enfoquesRows, spacing: { before: 200 } }));

            // IX. TUTORÍA
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 400 } }));
            seccionesRows.push(makeStyledHeader('IX', 'Tutoría y Orientación Educativa'));
            seccionesRows.push(new Paragraph({ children: makeTextRuns((result.tutoria_orientacion?.plan || 'Plan de acompañamiento socioemocional.'), false, 20), alignment: AlignmentType.JUSTIFIED }));

            // X. MATERIALES
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 400 } }));
            seccionesRows.push(makeStyledHeader('X', 'Materiales y Recursos'));
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 200, after: 200 } }));
            const mat = result.materiales_recursos || {};
            seccionesRows.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({ children: [
                        new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'Estructurados', bold: true })], alignment: AlignmentType.CENTER })] }),
                        new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'No Estructurados', bold: true })], alignment: AlignmentType.CENTER })] })
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ children: [new Paragraph({ children: makeTextRuns(mat.estructuradas?.join('\n') || '...') })] }),
                        new TableCell({ children: [new Paragraph({ children: makeTextRuns(mat.no_estructuradas?.join('\n') || '...') })] })
                    ]})
                ]
            }));

            // XI. EVALUACIÓN
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 400 } }));
            seccionesRows.push(makeStyledHeader('XI', 'Orientaciones para la Evaluación'));
            seccionesRows.push(new Paragraph({ children: makeTextRuns('Se aplicará la escala de calificación CNEB:', true, 18), spacing: { after: 200 } }));
            
            seccionesRows.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'Escala', bold: true })], alignment: AlignmentType.CENTER })] }),
                            new TableCell({ width: { size: 80, type: WidthType.PERCENTAGE }, shading: { fill: lightBlue }, children: [new Paragraph({ children: [new TextRun({ text: 'Descripción del Nivel de Logro', bold: true })], alignment: AlignmentType.CENTER })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'AD', bold: true })], alignment: AlignmentType.CENTER })] }),
                            new TableCell({ children: [new Paragraph({ text: 'Logro Destacado: Cuando el estudiante evidencia un nivel superior a lo esperado.' })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'A', bold: true })], alignment: AlignmentType.CENTER })] }),
                            new TableCell({ children: [new Paragraph({ text: 'Logro Previsto: Cuando el estudiante evidencia el nivel esperado.' })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'B', bold: true })], alignment: AlignmentType.CENTER })] }),
                            new TableCell({ children: [new Paragraph({ text: 'En Proceso: Cuando el estudiante está próximo o cerca al nivel esperado.' })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'C', bold: true })], alignment: AlignmentType.CENTER })] }),
                            new TableCell({ children: [new Paragraph({ text: 'En Inicio: Cuando el estudiante muestra un progreso mínimo en el nivel esperado.' })] }),
                        ]
                    })
                ]
            }));
            
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 200 } }));
            (result.evaluacion?.escala || []).forEach(e => {
                seccionesRows.push(new Paragraph({ children: makeTextRuns(`• ${e}`, false, 16), margins: { left: 400 } }));
            });

            // XII. FODA
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 400 } }));
            seccionesRows.push(makeStyledHeader('XII', 'Análisis FODA Pedagógico'));
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 200, after: 200 } }));
            const foda = result.cierre?.analisis_foda_pedagogico || {};
            seccionesRows.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({ children: [
                        new TableCell({ shading: { fill: 'f0fdf4' }, children: [new Paragraph({ children: [new TextRun({ text: 'FORTALEZAS', bold: true, color: '166534' })], alignment: AlignmentType.CENTER }), new Paragraph({ children: makeTextRuns(foda.fortalezas?.join('\n')) })] }),
                        new TableCell({ shading: { fill: 'eff6ff' }, children: [new Paragraph({ children: [new TextRun({ text: 'OPORTUNIDADES', bold: true, color: '1e40af' })], alignment: AlignmentType.CENTER }), new Paragraph({ children: makeTextRuns(foda.oportunidades?.join('\n')) })] })
                    ]}),
                    new TableRow({ children: [
                        new TableCell({ shading: { fill: 'fffbeb' }, children: [new Paragraph({ children: [new TextRun({ text: 'DEBILIDADES', bold: true, color: '854d0e' })], alignment: AlignmentType.CENTER }), new Paragraph({ children: makeTextRuns(foda.debilidades?.join('\n')) })] }),
                        new TableCell({ shading: { fill: 'fef2f2' }, children: [new Paragraph({ children: [new TextRun({ text: 'AMENAZAS', bold: true, color: '991b1b' })], alignment: AlignmentType.CENTER }), new Paragraph({ children: makeTextRuns(foda.amenazas?.join('\n')) })] })
                    ]})
                ]
            }));

            // FINALLY FIRMAS
            seccionesRows.push(new Paragraph({ text: '', spacing: { before: 1200 } }));
            seccionesRows.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: NO_BORDERS,
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ children: [
                                new Paragraph({ children: [new TextRun({ text: '________________________', size: 20 })], alignment: AlignmentType.CENTER }),
                                new Paragraph({ children: [new TextRun({ text: 'Director(a) de la I.E.', size: 18 })], alignment: AlignmentType.CENTER }),
                                new Paragraph({ children: [new TextRun({ text: d.director || formData.director || '', size: 16 })], alignment: AlignmentType.CENTER })
                            ]}),
                            new TableCell({ children: [
                                new Paragraph({ children: [new TextRun({ text: '________________________', size: 20 })], alignment: AlignmentType.CENTER }),
                                new Paragraph({ children: [new TextRun({ text: 'Docente de Educación Física', size: 18 })], alignment: AlignmentType.CENTER }),
                                new Paragraph({ children: [new TextRun({ text: d.docente || formData.docente || '', size: 16 })], alignment: AlignmentType.CENTER })
                            ]})
                        ]
                    })
                ]
            }));

            const doc = new Document({
                sections: [{
                    properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
                    children: seccionesRows,
                }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `Plan_Anual_EF_${formData.grado}_${formData.anio}.docx`);

        } catch (error) {
            console.error("Error al generar Word:", error);
            alert("Error al generar Word: " + error.message);
        }
    };


    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await generateStructuredAnnualPlan(formData);
            if (res.success) {
                setResult(res.data);
                setCurrentStep(7); // Vista Previa (Step index 7)
            } else {
                alert("Ocurrió un error generando el plan: " + res.error);
            }
        } catch (error) {
            console.error("Error generating plan", error);
            alert("Error crítico: " + error.message);
        } finally {
            setGenerating(false);
        }
    };

    // -- Sub-components for Steps --

    const enfoquesList = [
        { name: 'De Derecho', desc: 'Conciencia de derechos, Libertad y responsabilidad, Diálogo y concertación' },
        { name: 'Inclusivo', desc: 'Respeto por las diferencias, Equidad en la enseñanza, Confianza en la persona' },
        { name: 'Intercultural', desc: 'Respeto a la identidad cultural, Justicia, Diálogo intercultural' },
        { name: 'Igualdad de Género', desc: 'Igualdad y Dignidad, Justicia, Empatía' },
        { name: 'Ambiental', desc: 'Solidaridad planetaria, Justicia y solidaridad, Respeto a toda forma de vida' },
        { name: 'Orientación al Bien Común', desc: 'Equidad y justicia, Solidaridad, Empatía, Responsabilidad' },
        { name: 'Búsqueda de la Excelencia', desc: 'Flexibilidad y apertura, Superación personal' }
    ];

    const renderPlanAnualPreview = (data) => {
        if (!data) return null;
        const d = data.datos_informativos || {};

        const SectionHeader = ({ num, title }) => (
            <div style={{ marginTop: '2.5rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem', pageBreakBefore: 'always' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <span style={{ background: 'var(--color-primary)', color: 'white', width: '32px', height: '32px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{num}</span>
                    {title}
                </h3>
            </div>
        );

        return (
            <div style={{
                background: '#ffffff',
                color: '#1e293b',
                padding: '4rem',
                borderRadius: '8px',
                maxWidth: '900px',
                margin: '0 auto',
                fontFamily: "'Segoe UI', Roboto, sans-serif",
                lineHeight: 1.6
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{data.titulo_principal || 'PLANIFICACIÓN CURRICULAR ANUAL'}</h1>
                    <div style={{ height: '4px', width: '80px', background: 'var(--color-primary)', margin: '1rem auto' }}></div>
                </div>

                {/* I. DATOS INFORMATIVOS */}
                <SectionHeader num="I" title="Datos Informativos" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px' }}>
                    <div><strong>DRE:</strong> {d.dre}</div>
                    <div><strong>UGEL:</strong> {d.ugel}</div>
                    <div><strong>Institución Educativa:</strong> {d.ie}</div>
                    <div><strong>Nivel:</strong> {d.nivel}</div>
                    <div><strong>Grado y Sección:</strong> {d.grado} - {d.seccion}</div>
                    <div><strong>Docente:</strong> {d.docente}</div>
                    <div><strong>Director(a):</strong> {d.director}</div>
                    <div><strong>Año Lectivo:</strong> {d.anio}</div>
                </div>

                {/* II. DIAGNÓSTICO */}
                <SectionHeader num="II" title="Descripción General y Análisis de los Resultados Diagnósticos" />
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <h4 style={{ fontWeight: 800, color: 'var(--color-primary)' }}>2.1 Características de los estudiantes</h4>
                        <p style={{ textAlign: 'justify' }}>{data.seccion_2_diagnostico?.caracteristicas_estudiantes}</p>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 800, color: 'var(--color-primary)' }}>2.2 Características del contexto</h4>
                        <p style={{ textAlign: 'justify' }}>{data.seccion_2_diagnostico?.caracteristicas_contexto}</p>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        <h4 style={{ fontWeight: 800 }}>2.3 Resultados de la evaluación diagnóstica</h4>
                        <p style={{ fontStyle: 'italic', color: '#64748b' }}>{data.seccion_2_diagnostico?.resultados_espacio}</p>
                    </div>
                </div>

                {/* III. CALENDARIZACIÓN */}
                <SectionHeader num="III" title="Calendarización Escolar" />
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ fontStyle: 'italic', color: '#64748b' }}>{data.seccion_3_calendarizacion}</p>
                </div>

                {/* IV. DEMANDAS */}
                <SectionHeader num="IV" title="Identificación de Demandas y Necesidades de los Estudiantes y de Prioridades de la Gestión Escolar" />
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '1.5rem' }}>
                    <p style={{ fontStyle: 'italic', color: '#64748b' }}>{data.seccion_4_demandas}</p>
                </div>

                {/* V. PROPÓSITOS DE APRENDIZAJE */}
                <SectionHeader num="V" title="Propósitos de Aprendizaje" />
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ border: '1px solid #e2e8f0', padding: '0.75rem', fontSize: '0.85rem', width: '30%' }}>Competencia</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '0.75rem', fontSize: '0.85rem' }}>Capacidades</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Array.isArray(data.seccion_5_propositos) ? data.seccion_5_propositos : []).map((p, i) => (
                                <tr key={i}>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '0.75rem', fontWeight: 600 }}>{p.competencia}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '0.75rem', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                                        {Array.isArray(p.capacidades) ? p.capacidades.join('\n') : p.capacidades}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* VI. ORGANIZACIÓN DE UNIDADES */}
                <SectionHeader num="VI" title="Organización de las Unidades Didácticas (Matriz)" />
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ background: 'var(--color-primary)', color: 'white' }}>
                                <th colSpan="5" style={{ padding: '0.75rem', fontSize: '1rem', textAlign: 'center', textTransform: 'uppercase' }}>Organización de las Unidades Didácticas</th>
                            </tr>
                            <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                                <th style={{ border: '1px solid #e2e8f0', padding: '0.75rem', fontSize: '0.85rem' }}>U</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '0.75rem', fontSize: '0.85rem' }}>Título de Unidad</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '0.75rem', fontSize: '0.85rem' }}>Competencia Priorizada</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '0.75rem', fontSize: '0.85rem' }}>Capacidades</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '0.75rem', fontSize: '0.85rem' }}>Enfoques</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Array.isArray(data.organizacion_unidades) ? data.organizacion_unidades : []).map((u, i) => (
                                <tr key={i} style={{ transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem', textAlign: 'center' }}>{u.nro}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>{u.titulo}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>{u.competencia_nombre}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem', fontSize: '0.75rem' }}> {Array.isArray(u.capacidades) ? u.capacidades.join(', ') : u.capacidades} </td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem', fontSize: '0.75rem' }}> {Array.isArray(u.enfoques) ? u.enfoques.join(', ') : (u.enfoques || '')} </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* VII. ESTÁNDARES Y DESEMPEÑOS */}
                <SectionHeader num="VII" title="Estándares y Desempeños Precisados" />
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ border: '1px solid #e2e8f0', padding: '0.75rem', width: '40%' }}>Estándar de Aprendizaje</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '0.75rem' }}>Desempeños Precisados</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Array.isArray(data.estandares_desempenos) ? data.estandares_desempenos : []).map((ed, i) => (
                                <tr key={i}>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '1rem', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{ed.competencia}</div>
                                        <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#475569', textAlign: 'justify' }}>{ed.estandar}</div>
                                    </td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '1rem', verticalAlign: 'top', fontSize: '0.9rem', textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
                                        {ed.desempenos_precisados}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* VIII. ENFOQUES TRANSVERSALES */}
                <SectionHeader num="VIII" title="Enfoques Transversales Priorizados" />
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ border: '1px solid #e2e8f0', padding: '0.75rem', width: '30%' }}>Enfoque</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '0.75rem' }}>Actitudes Docente</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '0.75rem' }}>Actitudes Estudiante</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Array.isArray(data.enfoques_transversales_detalle) ? data.enfoques_transversales_detalle : []).map((enf, i) => (
                                <tr key={i}>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '0.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>{enf.enfoque}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '0.75rem', fontSize: '0.85rem' }}>{enf.actitudes_docente}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '0.75rem', fontSize: '0.85rem' }}>{enf.actitudes_estudiantes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* IX. TUTORIA */}
                <SectionHeader num="IX" title="Tutoría y Orientación Educativa" />
                <div style={{ border: '1px solid #e2e8f0', padding: '2rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <p>{data.tutoria_orientacion?.plan || 'Plan de acompañamiento personalizado y grupal.'}</p>
                </div>

                {/* X. MATERIALES */}
                <SectionHeader num="X" title="Materiales y Recursos" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px' }}>
                        <strong style={{ display: 'block', marginBottom: '0.5rem', borderBottom: '1px solid #eee' }}>Estructurados:</strong>
                        <ul style={{ fontSize: '0.9rem' }}>
                            {(Array.isArray(data.materiales_recursos?.estructuradas) ? data.materiales_recursos.estructuradas : []).map((m, i) => <li key={i}>{m}</li>)}
                            {typeof data.materiales_recursos?.estructuradas === 'string' && <li>{data.materiales_recursos.estructuradas}</li>}
                        </ul>
                    </div>
                    <div style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px' }}>
                        <strong style={{ display: 'block', marginBottom: '0.5rem', borderBottom: '1px solid #eee' }}>No Estructurados:</strong>
                        <ul style={{ fontSize: '0.9rem' }}>
                            {(Array.isArray(data.materiales_recursos?.no_estructuradas) ? data.materiales_recursos.no_estructuradas : []).map((m, i) => <li key={i}>{m}</li>)}
                            {typeof data.materiales_recursos?.no_estructuradas === 'string' && <li>{data.materiales_recursos.no_estructuradas}</li>}
                        </ul>
                    </div>
                </div>

                {/* XI. EVALUACIÓN */}
                <SectionHeader num="XI" title="Evaluación" />
                <div style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ fontWeight: 800, marginBottom: '1rem', color: 'var(--color-primary)' }}>Escala de Calificación del CNEB</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ border: '1px solid #e2e8f0', padding: '0.75rem', textAlign: 'center', width: '20%' }}>Escala</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '0.75rem', textAlign: 'left' }}>Descripción del Nivel de Logro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { e: 'AD', d: 'Logro Destacado: Cuando el estudiante evidencia un nivel superior a lo esperado.' },
                                { e: 'A', d: 'Logro Previsto: Cuando el estudiante evidencia el nivel esperado.' },
                                { e: 'B', d: 'En Proceso: Cuando el estudiante está próximo o cerca al nivel esperado.' },
                                { e: 'C', d: 'En Inicio: Cuando el estudiante muestra un progreso mínimo en el nivel esperado.' }
                            ].map((level, idx) => (
                                <tr key={idx}>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '0.75rem', textAlign: 'center', fontWeight: 800, background: '#f1f5f9' }}>{level.e}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '0.75rem', fontSize: '0.9rem' }}>{level.d}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {data.evaluacion?.escala?.length > 0 && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--color-primary)' }}>
                            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Informática Adicional:</strong>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {(Array.isArray(data.evaluacion?.escala) ? data.evaluacion.escala : []).map((e, i) => <li key={i} style={{ padding: '0.25rem 0' }}>• {e}</li>)}
                            </ul>
                        </div>
                    )}
                </div>

                {/* XII. CIERRE Y FODA */}
                <SectionHeader num="XII" title="Cierre y Análisis FODA Pedagógico" />
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '50%', border: '1px solid #e2e8f0', padding: '1.5rem', verticalAlign: 'top', background: '#f0fdf4' }}>
                                    <strong style={{ color: '#166534', display: 'block', marginBottom: '1rem', textAlign: 'center' }}>FORTALEZAS</strong>
                                    <ul style={{ fontSize: '0.85rem', paddingLeft: '1.25rem' }}>
                                        {(data.cierre?.analisis_foda_pedagogico?.fortalezas || []).map((v, idx) => <li key={idx}>{v}</li>)}
                                    </ul>
                                </td>
                                <td style={{ width: '50%', border: '1px solid #e2e8f0', padding: '1.5rem', verticalAlign: 'top', background: '#eff6ff' }}>
                                    <strong style={{ color: '#1e40af', display: 'block', marginBottom: '1rem', textAlign: 'center' }}>OPORTUNIDADES</strong>
                                    <ul style={{ fontSize: '0.85rem', paddingLeft: '1.25rem' }}>
                                        {(data.cierre?.analisis_foda_pedagogico?.oportunidades || []).map((v, idx) => <li key={idx}>{v}</li>)}
                                    </ul>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ width: '50%', border: '1px solid #e2e8f0', padding: '1.5rem', verticalAlign: 'top', background: '#fffbeb' }}>
                                    <strong style={{ color: '#854d0e', display: 'block', marginBottom: '1rem', textAlign: 'center' }}>DEBILIDADES</strong>
                                    <ul style={{ fontSize: '0.85rem', paddingLeft: '1.25rem' }}>
                                        {(data.cierre?.analisis_foda_pedagogico?.debilidades || []).map((v, idx) => <li key={idx}>{v}</li>)}
                                    </ul>
                                </td>
                                <td style={{ width: '50%', border: '1px solid #e2e8f0', padding: '1.5rem', verticalAlign: 'top', background: '#fef2f2' }}>
                                    <strong style={{ color: '#991b1b', display: 'block', marginBottom: '1rem', textAlign: 'center' }}>AMENAZAS</strong>
                                    <ul style={{ fontSize: '0.85rem', paddingLeft: '1.25rem' }}>
                                        {(data.cierre?.analisis_foda_pedagogico?.amenazas || []).map((v, idx) => <li key={idx}>{v}</li>)}
                                    </ul>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderStep1Administrativo = () => (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                    <label className="form-label">DRE (Dirección Regional de Educación)</label>
                    <input type="text" className="form-input" placeholder="Ej: DRE Lima Metropolitana" value={formData.dre} onChange={e => setFormData({ ...formData, dre: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">UGEL (Unidad de Gestión Educativa)</label>
                    <input type="text" className="form-input" placeholder="Ej: UGEL 03" value={formData.ugel} onChange={e => setFormData({ ...formData, ugel: e.target.value })} />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Institución Educativa</label>
                <input type="text" className="form-input" placeholder="Nombre de la Institución Educativa..." value={formData.ie} onChange={e => setFormData({ ...formData, ie: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                    <label className="form-label">Nombre del Director(a)</label>
                    <input type="text" className="form-input" placeholder="Nombre completo del Director..." value={formData.director} onChange={e => setFormData({ ...formData, director: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Nombre del Docente</label>
                    <input type="text" className="form-input" placeholder="Nombre completo..." value={formData.docente} onChange={e => setFormData({ ...formData, docente: e.target.value })} />
                </div>
            </div>

            <div className="form-grid-2">
                <div className="form-group">
                    <label className="form-label">Grado</label>
                    <select className="form-select" value={formData.grado} onChange={e => setFormData({ ...formData, grado: e.target.value })}>
                        {['Inicial', 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto'].map(g => <option key={g}>{g}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Sección</label>
                    <input type="text" className="form-input" placeholder="Ej: A, B, C o Única" value={formData.seccion} onChange={e => setFormData({ ...formData, seccion: e.target.value })} />
                </div>
            </div>

            <div className="form-grid-2">
                <div className="form-group">
                    <label className="form-label">Año Lectivo</label>
                    <input type="number" className="form-input" value={formData.anio} onChange={e => setFormData({ ...formData, anio: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Nivel Educativo</label>
                    <select className="form-select" value={formData.nivel} onChange={e => setFormData({ ...formData, nivel: e.target.value })}>
                        <option>Inicial</option>
                        <option>Primaria</option>
                        <option>Secundaria</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderStep2Diagnostico = () => (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="form-group">
                <label className="form-label">Bloque de Diagnóstico (Caja de texto libre)</label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Pega aquí tu análisis de "Características de los estudiantes" y "Análisis de resultados de la evaluación diagnóstica".</p>
                <textarea 
                    className="form-textarea" 
                    placeholder="Ej: Los estudiantes del tercer grado muestran interés por los deportes colectivos..." 
                    value={formData.diagnostico} 
                    onChange={e => setFormData({ ...formData, diagnostico: e.target.value })} 
                    style={{ minHeight: '300px' }} 
                />
            </div>
        </div>
    );

    const renderStep3Contexto = () => (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="form-group">
                <label className="form-label">Bloque de Contexto (Cartel de Demandas y Necesidades)</label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>La IA identificará problemas, causas y necesidades para alimentar el resto del plan.</p>
                <textarea 
                    className="form-textarea" 
                    placeholder="Ej: PROBLEMA: Malos hábitos alimenticios..." 
                    value={formData.contextoDemandas} 
                    onChange={e => setFormData({ ...formData, contextoDemandas: e.target.value })} 
                    style={{ minHeight: '300px' }} 
                />
            </div>
        </div>
    );

    const renderStep3Calendario = () => {
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
                                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => openAddUnidadModal(periodoNum)}>
                                        <Plus size={14} /> Añadir Unidad
                                    </button>
                                </div>

                                {unidadesDelPeriodo.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px dashed #e2e8f0' }}>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin unidades. Añade una para comenzar.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {unidadesDelPeriodo.map((u, index) => (
                                            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                                        Unidad {getUnitGlobalNumber(u.id)}: {u.titulo || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin Título</span>}
                                                    </h5>
                                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', alignItems: 'center' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {u.fechaInicio || 'Inicio: ?'} a {u.fechaFin || 'Fin: ?'}</span>
                                                        <span style={{ height: '4px', width: '4px', background: '#cbd5e1', borderRadius: '50%' }}></span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Target size={12} /> {u.competencias?.length || 0} Competencias</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => openEditUnidadModal(u)} className="btn-icon" style={{ padding: '0.6rem', color: 'var(--color-primary)', border: '1px solid var(--color-primary-glow)', background: 'var(--color-primary-glow)' }} title="Editar Unidad">
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button onClick={() => removeUnidad(u.id)} className="btn-icon" style={{ padding: '0.6rem', color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.1)', background: 'rgba(239, 68, 68, 0.05)' }} title="Eliminar Unidad">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
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

    const renderStep4Enfoques = () => (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Enfoques Transversales</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Selecciona los enfoques a priorizar según las necesidades detectadas en el diagnóstico y contexto.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {enfoquesList.map(enf => (
                    <label key={enf.name} style={{
                        display: 'flex', flexDirection: 'column', gap: '0.5rem',
                        background: formData.enfoques.includes(enf.name) ? 'var(--color-primary-glow)' : 'white',
                        border: `1px solid ${formData.enfoques.includes(enf.name) ? 'var(--color-primary)' : '#e2e8f0'}`,
                        padding: '1.5rem', borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: formData.enfoques.includes(enf.name) ? '0 10px 15px -3px rgba(2, 132, 199, 0.1)' : 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                                type="checkbox"
                                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-primary)' }}
                                checked={formData.enfoques.includes(enf.name)}
                                onChange={() => toggleArrayItem('enfoques', enf.name)}
                            />
                            <span style={{ fontWeight: 700, color: formData.enfoques.includes(enf.name) ? 'var(--color-primary)' : 'var(--text-primary)', fontSize: '1.05rem' }}>{enf.name}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: formData.enfoques.includes(enf.name) ? 'var(--text-primary)' : 'var(--text-muted)', marginLeft: '2rem', lineHeight: 1.5 }}>
                            {enf.desc}
                        </p>
                    </label>
                ))}
            </div>
        </div>
    );

    const renderStep5Tutoria = () => {
        const dimensiones = [
            { id: 'Personal', label: 'Dimensión Personal', icon: <User size={18} /> },
            { id: 'Social', label: 'Dimensión Social', icon: <Users size={18} /> },
            { id: 'Aprendizaje', label: 'Dimensión de Aprendizaje', icon: <BookOpen size={18} /> }
        ];

        return (
            <div style={{ display: 'grid', gap: '2rem' }}>
                <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '1rem' }}>Tutoría y Orientación Educativa</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Define las dimensiones y actividades para el acompañamiento socioafectivo y cognitivo.</p>
                </div>

                <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Dimensiones a Priorizar</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                        {dimensiones.map(dim => (
                            <div
                                key={dim.id}
                                onClick={() => toggleArrayItem('dimensionesTutoria', dim.id)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${formData.dimensionesTutoria.includes(dim.id) ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                                    background: formData.dimensionesTutoria.includes(dim.id) ? 'var(--color-primary-glow)' : 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ color: formData.dimensionesTutoria.includes(dim.id) ? 'var(--color-primary)' : 'var(--text-muted)' }}>{dim.icon}</div>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{dim.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label className="form-label" style={{ fontWeight: 700 }}>Actividades de Tutoría (Opcional)</label>
                        <button type="button" onClick={async () => {
                            setIsSuggestingTutoria(true);
                            try {
                                const prompt = `Sugiere 3 actividades de tutoría breves y potentes para un aula de ${formData.grado} de ${formData.nivel}, considerando las dimensiones: ${formData.dimensionesTutoria.join(', ')}. Solo el texto de las actividades separadas por puntos.`;
                                const result = await generateAIContent(prompt);
                                setFormData(prev => ({ ...prev, actividadesTutoria: result }));
                            } catch (e) { console.error(e); }
                            setIsSuggestingTutoria(false);
                        }} disabled={isSuggestingTutoria} className="btn-secondary btn" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>
                            {isSuggestingTutoria ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Sugerir con IA
                        </button>
                    </div>
                    <textarea 
                        className="form-textarea" 
                        placeholder="Ej: Talleres de resolución de conflictos, campañas de vida saludable, orientación vocacional..." 
                        value={formData.actividadesTutoria} 
                        onChange={e => setFormData({ ...formData, actividadesTutoria: e.target.value })}
                        style={{ minHeight: '150px' }}
                    />
                </div>
            </div>
        );
    };

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

                <div style={{ display: 'grid', gap: '1.25rem' }}>
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            className="glass-static"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            style={{ 
                                padding: '1.5rem 2rem', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                flexWrap: 'wrap', 
                                gap: '1rem',
                                background: 'white',
                                cursor: 'pointer',
                                border: '1px solid var(--glass-border)',
                                boxShadow: 'var(--shadow-card)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            whileHover={{ transform: 'translateY(-3px)', boxShadow: 'var(--shadow-premium)' }}
                        >
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '56px', height: '56px', background: 'var(--color-primary-glow)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                    <FileText size={28} />
                                </div>
                                <div>
                                    <h3 style={{ marginBottom: '0.35rem', color: 'var(--text-primary)', fontWeight: 700 }}>{plan.title}</h3>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Layers size={14} /> {plan.level}</span>
                                        <span style={{ color: '#cbd5e1' }}>|</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14} /> Modificado: {plan.lastModified}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ 
                                    padding: '0.4rem 0.75rem', 
                                    borderRadius: 'var(--radius-full)', 
                                    background: plan.status === 'Completado' ? 'var(--color-secondary-glow)' : '#fffbeb', 
                                    color: plan.status === 'Completado' ? 'var(--color-secondary)' : '#b45309',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: `1px solid ${plan.status === 'Completado' ? 'rgba(5, 150, 105, 0.2)' : 'rgba(180, 83, 9, 0.2)'}`
                                }}>
                                    {plan.status}
                                </div>
                                <ChevronRight size={20} className="text-muted" />
                            </div>
                        </motion.div>
                    ))}

                    <button
                        className="glass-static"
                        style={{ 
                            padding: '3rem', 
                            border: '2px dashed #cbd5e1', 
                            background: 'white', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: '1rem', 
                            cursor: 'pointer', 
                            color: 'var(--text-muted)',
                            borderRadius: 'var(--radius-lg)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                            e.currentTarget.style.color = 'var(--color-primary)';
                            e.currentTarget.style.background = 'var(--color-primary-glow)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.background = 'white';
                        }}
                        onClick={() => setView('create')}
                    >
                        <Plus size={40} />
                        <span style={{ fontWeight: 600 }}>Crear un nuevo Plan Anual Maestro</span>
                    </button>
                </div>
            </div>
        );
    }

    // Creating View (Wizard)
    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
            {/* Header Wizard */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setView('list')}>
                    <ArrowLeft size={16} /> Salir
                </button>
                <div style={{ textAlign: 'center', flex: '1 1 auto' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Generador de Planificación Anual</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Paso {currentStep + 1} de {STEPS.length}</p>
                </div>
                <div style={{ width: '80px', display: 'none' }}></div> {/* Spacer for centering removed on mobile but keeping flex layout balanced */}
            </div>

            {/* Custom Vertical Navigation or Progress Bar */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                {/* Left Sidebar Steps */}
                <div className="glass-static" style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    position: 'sticky',
                    top: '2rem',
                    flex: '1 1 200px',
                    boxShadow: 'var(--shadow-premium)',
                    background: 'white',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', fontWeight: 800 }}>Estructura del Plan</h5>
                        <div style={{ height: '3px', width: '30px', background: 'var(--color-primary)', marginTop: '0.5rem', borderRadius: '2px' }}></div>
                    </div>

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
                                    color: isActive ? 'var(--color-primary)' : isPast ? 'var(--text-primary)' : 'var(--text-muted)',
                                    cursor: index <= currentStep ? 'pointer' : 'default',
                                    transition: 'all 0.2s',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: isActive ? 'var(--color-primary-glow)' : 'transparent',
                                }}
                            >
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: isActive ? 'var(--color-primary)' : isPast ? '#f0f9ff' : 'transparent',
                                    border: `2px solid ${isActive || isPast ? (isActive ? 'var(--color-primary)' : '#bae6fd') : '#e2e8f0'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.8rem', fontWeight: 700, color: isActive ? 'white' : isPast ? 'var(--color-primary)' : 'inherit'
                                }}>
                                    {isPast ? <Check size={16} /> : (index + 1)}
                                </div>
                                <span style={{ fontSize: '0.95rem', fontWeight: isActive ? 700 : 500 }}>{step}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Right Form Container */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="glass-static"
                            style={{ 
                                padding: '2.5rem', 
                                minHeight: '600px', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                width: '100%', 
                                boxSizing: 'border-box',
                                background: 'white',
                                border: '1px solid var(--glass-border)',
                                boxShadow: 'var(--shadow-card)'
                            }}
                        >
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>{STEPS[currentStep] || 'Resultado Generado'}</h3>
                                <div style={{ height: '1px', background: 'var(--glass-border)', marginTop: '0.75rem' }}></div>
                            </div>


                            <div style={{ flex: 1 }}>
                                {currentStep === 0 && renderStep1Administrativo()}
                                {currentStep === 1 && renderStep2Diagnostico()}
                                {currentStep === 2 && renderStep3Contexto()}
                                {currentStep === 3 && renderStep3Calendario()}
                                {currentStep === 4 && renderStep4Enfoques()}
                                {currentStep === 5 && renderStep5Tutoria()}
                                {currentStep === 6 && (
                                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                        {generating ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                                <Loader2 size={48} className="animate-spin text-primary" />
                                                <h3 style={{ color: 'var(--color-primary)' }}>Generando Plan Anual CNEB...</h3>
                                                <p style={{ color: 'var(--text-muted)' }}>Mapeando CARTEL DE DEMANDAS, redactando situaciones significativas y detallando Enfoques y Tutoría.</p>
                                            </div>
                                        ) : !result ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                                <div style={{ width: '80px', height: '80px', background: 'var(--color-primary-glow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                                    <Sparkles size={40} />
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Revisión Final y Generación</h3>
                                                    <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>La IA generará un Plan Anual completo de 11 secciones basado en el Diagnóstico, Demandas de Contexto, Calendarización, Enfoques y Tutoría.</p>
                                                </div>
                                                <button className="btn btn-primary" onClick={handleGenerate} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: 'var(--radius-full)' }}>
                                                    <Sparkles size={20} /> Generar Plan Maestro
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                                                <CheckCircle2 size={48} color="var(--color-secondary)" style={{ marginBottom: '1rem' }} />
                                                <h3>Plan Generado con Éxito</h3>
                                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Tu planificación anual CNEB está lista para revisar y descargar.</p>
                                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                                    <button className="btn btn-secondary" onClick={() => { setResult(null); setCurrentStep(6); }}>Generar Nuevo</button>
                                                    <button className="btn btn-primary" onClick={() => setCurrentStep(7)}>
                                                        Ver Vista Previa
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentStep === 7 && result && (
                                    <div style={{ background: '#f1f5f9', padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', overflowY: 'auto', maxHeight: '800px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                                            <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FileText size={20} className="text-primary" /> VISTA PREVIA DEL DOCUMENTO
                                            </h4>
                                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                <button className="btn btn-secondary" style={{ background: 'white' }} onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); alert("Estructura JSON copiada!") }}>Copiar JSON</button>
                                                <button className="btn btn-primary" onClick={downloadAsWord}>
                                                    <Download size={16} /> Descargar en Word (.docx)
                                                </button>
                                            </div>
                                        </div>
                                        <div className="print-content" style={{ boxShadow: 'var(--shadow-premium)', borderRadius: '4px', background: 'white' }}>
                                            {renderPlanAnualPreview(result)}
                                        </div>
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
                            {currentStep === 7 && (
                                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '2rem' }}>
                                    <button className="btn btn-secondary" onClick={() => setCurrentStep(6)}>
                                        <ArrowLeft size={16} /> Volver a Generación
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Unidades Modal */}
            <AnimatePresence>
                {isUnitModalOpen && currentUnitModalData && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{
                                background: '#ffffff', color: '#1e293b', borderRadius: '12px',
                                width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0'
                            }}
                        >
                            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                    {currentUnitModalData.id ? 'Editar Unidad' : 'Añadir Nueva Unidad'}
                                </h3>
                            </div>

                            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                                <div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paso A: Seleccione la competencia (Solo 1 por unidad)</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {['Se desenvuelve de manera autónoma a través de su motricidad', 'Asume una vida saludable', 'Interactúa a través de sus habilidades sociomotrices'].map(comp => (
                                            <label key={comp} style={{
                                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem',
                                                border: `1px solid ${currentUnitModalData.competencias.includes(comp) ? '#3b82f6' : '#e2e8f0'}`,
                                                borderRadius: '8px', cursor: 'pointer',
                                                background: currentUnitModalData.competencias.includes(comp) ? '#eff6ff' : '#ffffff',
                                                transition: 'all 0.2s'
                                            }}>
                                                <input
                                                    type="radio"
                                                    name="unit_competencia"
                                                    style={{ width: '1.1rem', height: '1.1rem', accentColor: '#3b82f6' }}
                                                    checked={currentUnitModalData.competencias.includes(comp)}
                                                    onChange={() => {
                                                        setCurrentUnitModalData(prev => ({ ...prev, competencias: [comp] }));
                                                    }}
                                                />
                                                <span style={{ fontWeight: 600, color: currentUnitModalData.competencias.includes(comp) ? '#1e3a8a' : '#334155', fontSize: '0.95rem' }}>{comp}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px dashed #cbd5e1', margin: '0.5rem 0' }}></div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569', margin: 0 }}>Paso B: Título de la Unidad</h4>
                                        <button
                                            onClick={handleSuggestModalTitulo} disabled={isSuggestingModalTitulo}
                                            style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
                                        >
                                            {isSuggestingModalTitulo ? <Loader2 size={12} className="spin" /> : <Sparkles size={12} />} Sugerir
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#ffffff', color: '#0f172a', fontSize: '0.95rem' }}
                                        value={currentUnitModalData.titulo} onChange={e => setCurrentUnitModalData(prev => ({ ...prev, titulo: e.target.value }))}
                                    />

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: 500 }}>Fecha de Inicio</label>
                                            <input type="date" style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#ffffff', color: '#0f172a' }} value={currentUnitModalData.fechaInicio} onChange={e => setCurrentUnitModalData(prev => ({ ...prev, fechaInicio: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: 500 }}>Fecha de Fin</label>
                                            <input type="date" style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#ffffff', color: '#0f172a' }} value={currentUnitModalData.fechaFin} onChange={e => setCurrentUnitModalData(prev => ({ ...prev, fechaFin: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px dashed #cbd5e1', margin: '0.5rem 0' }}></div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569', margin: 0 }}>Paso C: Situación Significativa</h4>
                                        <button
                                            onClick={handleSuggestModalSituacion} disabled={isSuggestingModalSituacion}
                                            style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
                                        >
                                            {isSuggestingModalSituacion ? <Loader2 size={12} className="spin" /> : <Sparkles size={12} />} Sugerir
                                        </button>
                                    </div>
                                    <textarea
                                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#ffffff', color: '#0f172a', fontSize: '0.95rem', minHeight: '100px', resize: 'vertical' }}
                                        value={currentUnitModalData.situacionSignificativa} onChange={e => setCurrentUnitModalData(prev => ({ ...prev, situacionSignificativa: e.target.value }))}
                                    />
                                </div>

                                <div style={{ borderTop: '1px dashed #cbd5e1', margin: '0.5rem 0' }}></div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569', margin: 0 }}>Paso D: Producto Integrador</h4>
                                        <button
                                            onClick={handleSuggestModalProducto} disabled={isSuggestingModalProducto}
                                            style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
                                        >
                                            {isSuggestingModalProducto ? <Loader2 size={12} className="spin" /> : <Sparkles size={12} />} Sugerir
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Ej. Cartel informativo, Campaña de salud..."
                                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#ffffff', color: '#0f172a', fontSize: '0.95rem' }}
                                        value={currentUnitModalData.productoIntegrador} onChange={e => setCurrentUnitModalData(prev => ({ ...prev, productoIntegrador: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#f8fafc', borderRadius: '0 0 12px 12px' }}>
                                <button className="btn" onClick={() => setIsUnitModalOpen(false)} style={{ background: '#e2e8f0', color: '#0f172a', fontWeight: 600, border: 'none', padding: '0.7rem 1.5rem' }}>
                                    Cancelar
                                </button>
                                <button className="btn btn-primary" onClick={saveUnitModal} style={{ fontWeight: 600, padding: '0.7rem 1.5rem', background: '#2563eb', color: 'white' }}>
                                    {currentUnitModalData.id ? 'Guardar Cambios' : 'Añadir Unidad'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlanAnualPage;
