import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, ArrowLeft, Download, FileText, CheckCircle2, 
    Sparkles, Loader2, Save, Users, Target, BookOpen, 
    Megaphone, MapPin, Clock, FileWarning, Search, Building2, Info, Hash, User
} from 'lucide-react';
import { generateDiagnosticEvaluation } from './gemini';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, HeadingLevel, ShadingType, VerticalAlign } from 'docx';
import { saveAs } from 'file-saver';

const DiagnosticoPage = ({ onNavigate, user }) => {
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [view, setView] = useState('input'); // 'input' or 'preview'
    
    const [formData, setFormData] = useState({
        ie: '',
        docente: user?.displayName || '',
        nivel: 'Primaria',
        grado: '1er Grado',
        seccion: 'A',
        ciclo: 'Ciclo III',
        contexto: '',
        problematica: '',
        duracion: '3 sesiones',
        alumnos: ''
    });

    const [savedLists, setSavedLists] = useState(() => {
        try {
            const saved = localStorage.getItem('edufisica_saved_lists');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [selectedListId, setSelectedListId] = useState('');

    React.useEffect(() => {
        localStorage.setItem('edufisica_saved_lists', JSON.stringify(savedLists));
    }, [savedLists]);

    const handleSaveList = () => {
        if (!formData.alumnos.trim()) { alert("La lista de alumnos está vacía."); return; }
        const listName = window.prompt("Ingresa un nombre para esta lista (ej. 3ro A):");
        if (listName) {
            const newList = { id: Date.now().toString(), name: listName, students: formData.alumnos };
            setSavedLists([...savedLists, newList]);
            setSelectedListId(newList.id);
        }
    };

    const handleDeleteList = () => {
        if (selectedListId && window.confirm("¿Seguro que quieres eliminar esta lista?")) {
            setSavedLists(savedLists.filter(l => l.id !== selectedListId));
            setSelectedListId('');
            setFormData({ ...formData, alumnos: '' });
        }
    };

    const handleSelectList = (e) => {
        const id = e.target.value;
        setSelectedListId(id);
        const list = id ? savedLists.find(l => l.id === id) : null;
        setFormData({ ...formData, alumnos: list ? list.students : '' });
    };

    const niveles = ['Inicial', 'Primaria', 'Secundaria'];
    const gradosPorNivel = {
        'Inicial': ['3 años', '4 años', '5 años'],
        'Primaria': ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'],
        'Secundaria': ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado']
    };
    const secciones = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'Única'];
    const ciclos = ['Ciclo II', 'Ciclo III', 'Ciclo IV', 'Ciclo V', 'Ciclo VI', 'Ciclo VII'];
    const duraciones = ['1 sesión', '2 sesiones', '3 sesiones', '1 semana', '2 semanas'];

    const getAutomaticCiclo = (grad, niv) => {
        const g = grad.toLowerCase();
        const n = niv.toLowerCase();
        if (n.includes('inicial')) return 'Ciclo II';
        if (n.includes('primaria')) {
            if (g.includes('1') || g.includes('2')) return 'Ciclo III';
            if (g.includes('3') || g.includes('4')) return 'Ciclo IV';
            return 'Ciclo V';
        }
        if (g.includes('1') || g.includes('2')) return 'Ciclo VI';
        return 'Ciclo VII';
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerate = async () => {
        if (!formData.contexto || !formData.problematica) {
            alert("Por favor completa el contexto y la problemática.");
            return;
        }
        setGenerating(true);
        try {
            const res = await generateDiagnosticEvaluation(formData);
            if (res.success) {
                setResult(res.data);
                setView('preview');
            } else {
                alert("Error: " + res.error);
            }
        } catch (e) {
            alert("Ocurrió un error inesperado.");
        } finally {
            setGenerating(false);
        }
    };

    const downloadAsWord = async () => {
        if (!result) return;
        try {
            const primaryBlue = '2563eb';
            const lightBlue = 'f1f5f9';
            const white = 'ffffff';

            const makeHeaderCell = (text, colSpan = 1) => new TableCell({
                shading: { fill: primaryBlue },
                columnSpan: colSpan,
                children: [new Paragraph({
                    children: [new TextRun({ text: text.toUpperCase(), color: white, bold: true, size: 22, font: 'Calibri' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 120, after: 120 }
                })],
                verticalAlign: VerticalAlign.CENTER
            });

            const makeSubHeaderCell = (text, colSpan = 1) => new TableCell({
                shading: { fill: lightBlue },
                columnSpan: colSpan,
                children: [new Paragraph({
                    children: [new TextRun({ text: text, color: '1e3a8a', bold: true, size: 20, font: 'Calibri' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 100 }
                })],
                verticalAlign: VerticalAlign.CENTER
            });

            const makeCell = (text, colSpan = 1, bold = false, alignment = AlignmentType.LEFT) => new TableCell({
                columnSpan: colSpan,
                children: [new Paragraph({
                    children: makeTextRuns(text, bold, 20),
                    alignment: alignment,
                    spacing: { before: 100, after: 100 }
                })],
                verticalAlign: VerticalAlign.CENTER,
                margins: { left: 150, right: 150 }
            });

            const makeTitle = (num, title) => {
                return new Paragraph({
                    children: [
                        new TextRun({ 
                            text: `${num}. ${title.toUpperCase()}`, 
                            color: primaryBlue, 
                            bold: true, 
                            size: 26,
                            font: 'Calibri'
                        })
                    ],
                    border: {
                        bottom: { style: BorderStyle.SINGLE, size: 12, color: primaryBlue, space: 4 }
                    },
                    spacing: { before: 400, after: 300 }
                });
            };

            const sections = [];
            
            // Header
            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: "EDUCACIÓN FÍSICA - EVALUACIÓN DIAGNÓSTICA", bold: true, size: 32, color: primaryBlue }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 600 }
            }));

            // I. Datos Generales
            const d = result.datos_generales || {};
            const datosRows = [
                new TableRow({ children: [makeHeaderCell('DATOS INFORMATIVOS', 2)] }),
                new TableRow({ children: [makeSubHeaderCell('I.E.'), makeCell(d.institucion)] }),
                new TableRow({ children: [makeSubHeaderCell('Docente'), makeCell(d.docente)] }),
                new TableRow({ children: [makeSubHeaderCell('Ciclo / Grado'), makeCell(`${d.ciclo} - ${d.grado} ${d.seccion}`)] }),
                new TableRow({ children: [makeSubHeaderCell('Duración'), makeCell(formData.duracion)] })
            ];
            sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: datosRows }));

            // II. Propósito
            sections.push(new Paragraph({ text: '', spacing: { before: 200 } }));
            sections.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({ children: [makeHeaderCell('II. PROPÓSITO DE LA EVALUACIÓN DIAGNÓSTICA')] }),
                    new TableRow({ children: [makeCell(result.proposito_evaluacion, 1, false, AlignmentType.JUSTIFIED)] })
                ]
            }));

            // III. Competencias
            sections.push(new Paragraph({ text: '', spacing: { before: 200 } }));
            const compRows = [
                new TableRow({ children: [makeHeaderCell('III. COMPETENCIAS Y CAPACIDADES A EVALUAR', 2)] }),
                new TableRow({ children: [makeSubHeaderCell('COMPETENCIA'), makeSubHeaderCell('CAPACIDADES')] })
            ];
            (result.competencias_capacidades || []).forEach(c => {
                compRows.push(new TableRow({
                    children: [
                        makeCell(c.competencia, 1, true),
                        makeCell(c.capacidades.join('\n'))
                    ]
                }));
            });
            sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: compRows }));

            // IV. Situación Significativa
            sections.push(new Paragraph({ text: '', spacing: { before: 200 } }));
            sections.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({ children: [makeHeaderCell('IV. SITUACIÓN SIGNIFICATIVA (EL RETO)')] }),
                    new TableRow({ children: [makeCell(result.situacion_significativa?.titulo, 1, true, AlignmentType.CENTER)] }),
                    new TableRow({ children: [makeCell(result.situacion_significativa?.descripcion || result.situacion_significativa?.description, 1, false, AlignmentType.JUSTIFIED)] })
                ]
            }));

            // V. Secuencia de Actividades
            if (result.secuencia_sesiones && result.secuencia_sesiones.length > 0) {
                sections.push(new Paragraph({ text: '', spacing: { before: 200 } }));
                const sesRows = [
                    new TableRow({ children: [makeHeaderCell('V. SECUENCIA DE ACTIVIDADES DE EVALUACIÓN', 2)] }),
                    new TableRow({ children: [makeSubHeaderCell('SESIÓN'), makeSubHeaderCell('ACTIVIDAD')] })
                ];
                result.secuencia_sesiones.forEach(s => {
                    sesRows.push(new TableRow({
                        children: [
                            makeCell(`${s.sesion}`, 1, true, AlignmentType.CENTER),
                            makeCell(`TÍTULO: ${s.titulo}\n${s.actividad}`)
                        ]
                    }));
                });
                sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: sesRows }));
            }

            // VI. Criterios y Evidencias
            sections.push(new Paragraph({ text: '', spacing: { before: 200 } }));
            const critRows = [
                new TableRow({ children: [makeHeaderCell('VI. CRITERIOS DE EVALUACIÓN Y EVIDENCIAS', 2)] }),
                new TableRow({ children: [makeSubHeaderCell('DESEMPEÑOS PRECISADOS (CRITERIOS)'), makeSubHeaderCell('EVIDENCIA')] })
            ];
            (result.criterios_evaluacion || []).forEach((ce, idx) => {
                critRows.push(new TableRow({
                    children: [
                        makeCell(`${ce.competencia}\n${ce.criterios.map(c => `• ${c}`).join('\n')}`),
                        makeCell(idx === 0 ? result.evidencias_aprendizaje : '')
                    ]
                }));
            });
            sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: critRows }));

            // VII. Conclusiones
            sections.push(new Paragraph({ text: '', spacing: { before: 200 } }));
            sections.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({ children: [makeHeaderCell('VII. CONCLUSIONES Y RESULTADOS ESPERADOS')] }),
                    new TableRow({ children: [makeCell(result.conclusiones_resultados || 'Análisis pedagógico pendiente de revisión.', 1, false, AlignmentType.JUSTIFIED)] })
                ]
            }));
             sections.push(new Paragraph({ text: '', spacing: { before: 200 } }));
            const inst = result.instrumento_recojo || {};
            const instHeader = new TableRow({
                children: [
                    makeSubHeaderCell('N°'),
                    makeSubHeaderCell('APELLIDOS Y NOMBRES'),
                    ...(inst.columnas ? inst.columnas.slice(2) : ["C1", "C2", "C3"]).map(col => makeSubHeaderCell(col))
                ]
            });
            const instRows = [
                new TableRow({ children: [makeHeaderCell(`VIII. INSTRUMENTO DE EVALUACIÓN: ${inst.tipo || 'Lista de Cotejo'}`, 2 + (inst.columnas ? inst.columnas.length - 2 : 3))] }),
                instHeader
            ];
            
            const listaAlumnosExport = formData.alumnos 
                ? formData.alumnos.split('\n').filter(n => n.trim()).map(n => n.trim())
                : [];

            if (listaAlumnosExport.length > 0) {
                listaAlumnosExport.forEach((nombre, idx) => {
                    instRows.push(new TableRow({
                        children: [
                            makeCell((idx + 1).toString(), 1, false, AlignmentType.CENTER),
                            makeCell(nombre),
                            ...(inst.columnas ? inst.columnas.slice(2) : ["", "", ""]).map(() => makeCell(""))
                        ]
                    }));
                });
            } else {
                for(let i=1; i<=15; i++) {
                    instRows.push(new TableRow({
                        children: [
                            makeCell(i.toString(), 1, false, AlignmentType.CENTER),
                            makeCell(""),
                            ...(inst.columnas ? inst.columnas.slice(2) : ["", "", ""]).map(() => makeCell(""))
                        ]
                    }));
                }
            }
            sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: instRows }));
            
            // --- FIRMAS ---
            sections.push(new Paragraph({ text: '', spacing: { before: 600 } }));
            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: '________________________                    ________________________', size: 20, font: 'Calibri' }),
                ],
                alignment: AlignmentType.CENTER
            }));
            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: `    ${d.director || 'Director(a)'}                               ${d.docente || 'Docente'}    `, size: 18, font: 'Calibri' }),
                ],
                alignment: AlignmentType.CENTER
            }));
            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: '         Director(a)                                          Docente de Área         ', size: 16, font: 'Calibri', italics: true, color: '666666' }),
                ],
                alignment: AlignmentType.CENTER
            }));

            const doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: { top: 700, right: 700, bottom: 700, left: 700 },
                        },
                    },
                    children: sections,
                }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `Evaluacion_Diagnostica_EF_${formData.grado}.docx`);
        } catch (e) {
            console.error(e);
            alert("Error al exportar Word.");
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem 1rem' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button className="btn-icon" onClick={() => onNavigate('tools')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Evaluación <span className="text-gradient">Diagnóstica</span></h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Genera el punto de partida inicial para tu planificación anual.</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {view === 'input' ? (
                        <motion.div 
                            key="input"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="diagnostico-form-container"
                            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                        >
                            {/* SECCIÓN 1: DATOS GENERALES Y CONFIGURACIÓN */}
                            <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', color: 'var(--color-primary)' }}>
                                    <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '1rem' }}>
                                        <Building2 size={24} />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.01em' }}>Identificación y Grado</h3>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">
                                            <MapPin size={14} className="text-primary" /> Institución Educativa
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Ej. I.E. Emblemática 'San Juan'" 
                                            value={formData.ie}
                                            onChange={(e) => handleInputChange('ie', e.target.value)}
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">
                                            <User size={14} className="text-primary" /> Docente Responsable
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Nombre del docente" 
                                            value={formData.docente}
                                            onChange={(e) => handleInputChange('docente', e.target.value)}
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">
                                            <Building2 size={14} className="text-primary" /> Nivel Educativo
                                        </label>
                                        <select 
                                            value={formData.nivel} 
                                            onChange={(e) => {
                                                const newNivel = e.target.value;
                                                const newGrado = gradosPorNivel[newNivel][0];
                                                setFormData(prev => ({
                                                    ...prev,
                                                    nivel: newNivel,
                                                    grado: newGrado,
                                                    ciclo: getAutomaticCiclo(newGrado, newNivel)
                                                }));
                                            }}
                                            className="form-select"
                                        >
                                            {niveles.map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    </div>

                                    {/* Cuadro de Datos Informativos Refinado */}
                                    <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.4)', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label className="input-label">
                                                    <Target size={14} className="text-primary" /> Grado
                                                </label>
                                                <select 
                                                    value={formData.grado} 
                                                    onChange={(e) => {
                                                        const g = e.target.value;
                                                        setFormData(prev => ({ 
                                                            ...prev, 
                                                            grado: g,
                                                            ciclo: getAutomaticCiclo(g, prev.nivel)
                                                        }));
                                                    }} 
                                                    className="form-select"
                                                >
                                                    {gradosPorNivel[formData.nivel].map(g => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                            </div>

                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label className="input-label">
                                                    <Hash size={14} className="text-primary" /> Sección
                                                </label>
                                                <select 
                                                    value={formData.seccion} 
                                                    onChange={(e) => handleInputChange('seccion', e.target.value)} 
                                                    className="form-select"
                                                >
                                                    {secciones.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>

                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label className="input-label">
                                                    <BookOpen size={14} className="text-primary" /> Ciclo
                                                </label>
                                                <select 
                                                    value={formData.ciclo} 
                                                    onChange={(e) => handleInputChange('ciclo', e.target.value)} 
                                                    className="form-select"
                                                >
                                                    {ciclos.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">
                                            <Clock size={14} className="text-primary" /> Duración de Evaluación
                                        </label>
                                        <select 
                                            value={formData.duracion} 
                                            onChange={(e) => handleInputChange('duracion', e.target.value)}
                                            className="form-select"
                                        >
                                            {duraciones.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 2: ANÁLISIS DEL CONTEXTO Y PROBLEMÁTICA */}
                            <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', color: 'var(--color-secondary)' }}>
                                    <div style={{ padding: '0.6rem', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '1rem' }}>
                                        <Search size={24} />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.01em' }}>Contexto y Problemática</h3>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">
                                            <Info size={14} className="text-secondary" /> Entorno de Trabajo y Estudiantes
                                        </label>
                                        <textarea 
                                            placeholder='Ej: "Zona rural con traslados largos. Patio de tierra sin sombra. Materiales limitados (solo algunas pelotas)".'
                                            value={formData.contexto}
                                            onChange={(e) => handleInputChange('contexto', e.target.value)}
                                            className="form-textarea"
                                        ></textarea>
                                        <p className="helper-text">
                                            Describe el entorno físico y las características de tus alumnos.
                                        </p>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">
                                            <FileWarning size={14} className="text-secondary" /> Necesidades Detectadas
                                        </label>
                                        <textarea 
                                            placeholder='Ej: "Baja condición física tras el verano. Conflictos frecuentes en juegos de equipo. Interés por actividades rítmicas".'
                                            value={formData.problematica}
                                            onChange={(e) => handleInputChange('problematica', e.target.value)}
                                            className="form-textarea"
                                        ></textarea>
                                        <p className="helper-text">
                                            Ej: "Los niños tienen dificultades para coordinar movimientos básicos" o "Interés en aprender juegos tradicionales".
                                        </p>
                                    </div>

                                    {/* LISTA DE ALUMNOS */}
                                    <div className="input-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                            <label className="input-label" style={{ marginBottom: 0 }}>
                                                <Users size={14} className="text-secondary" /> Lista de Estudiantes (Opcional)
                                            </label>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <select 
                                                    value={selectedListId} 
                                                    onChange={handleSelectList}
                                                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
                                                >
                                                    <option value="">Mis listas...</option>
                                                    {savedLists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                                </select>
                                                <button onClick={handleSaveList} className="btn-icon" title="Guardar lista" style={{ padding: '0.3rem' }}><Save size={14} /></button>
                                                {selectedListId && <button onClick={handleDeleteList} className="btn-icon text-error" title="Eliminar lista" style={{ padding: '0.3rem' }}><FileWarning size={14} /></button>}
                                            </div>
                                        </div>
                                        <textarea 
                                            placeholder="Pega la lista de alumnos aquí (uno por línea)..."
                                            value={formData.alumnos}
                                            onChange={(e) => handleInputChange('alumnos', e.target.value)}
                                            className="form-textarea"
                                            style={{ minHeight: '120px', fontSize: '0.85rem' }}
                                        ></textarea>
                                        <p className="helper-text">
                                            Si incluyes nombres, se generará el instrumento listo para evaluar.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                className="btn btn-primary w-full btn-lg" 
                                onClick={handleGenerate}
                                disabled={generating}
                            >
                                {generating ? (
                                    <>GENERANDO EVALUACIÓN... <Loader2 className="spin" size={20} /></>
                                ) : (
                                    <>GENERAR EVALUACIÓN DIAGNÓSTICA <Sparkles size={20} /></>
                                )}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="preview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass"
                            style={{ padding: '0', overflow: 'hidden' }}
                        >
                            {/* Toolbar */}
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30, 64, 175, 0.1)' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>Vista Previa</h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Revisa el contenido generado por la IA.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="btn btn-secondary" onClick={() => setView('input')}>
                                        Corregir Datos
                                    </button>
                                    <button className="btn btn-primary" onClick={downloadAsWord}>
                                        <Download size={18} /> Descargar Word
                                    </button>
                                </div>
                            </div>

                            {/* Preview Content */}
                            <div id="diagnostic-preview" style={{ padding: '2rem', background: '#fff', color: '#334155', minHeight: '800px', fontStyle: 'normal' }}>
                                <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #2563eb', paddingBottom: '1rem' }}>
                                    <h1 style={{ color: '#1e40af', fontSize: '1.5rem', marginBottom: '0.5rem' }}>EVALUACIÓN DIAGNÓSTICA DE EDUCACIÓN FÍSICA</h1>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
                                        <span><strong>GRADO:</strong> {result?.datos_generales?.grado} {result?.datos_generales?.seccion}</span>
                                        <span><strong>CICLO:</strong> {result?.datos_generales?.ciclo}</span>
                                        <span><strong>DURACIÓN:</strong> {formData.duracion}</span>
                                    </div>
                                </div>

                                <section style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ borderLeft: '4px solid #2563eb', paddingLeft: '0.5rem', color: '#1e40af' }}>I. PROPÓSITO DE LA EVALUACIÓN</h3>
                                    <p style={{ textAlign: 'justify', lineHeight: '1.6' }}>{result?.proposito_evaluacion}</p>
                                </section>

                                <section style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ borderLeft: '4px solid #2563eb', paddingLeft: '0.5rem', color: '#1e40af' }}>II. COMPETENCIAS Y CAPACIDADES</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                                        <thead>
                                            <tr style={{ background: '#f1f5f9' }}>
                                                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'left' }}>Competencia</th>
                                                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'left' }}>Capacidades</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result?.competencias_capacidades?.map((c, i) => (
                                                <tr key={i}>
                                                    <td style={{ border: '1px solid #cbd5e1', padding: '0.75rem', fontWeight: 'bold' }}>{c.competencia}</td>
                                                    <td style={{ border: '1px solid #cbd5e1', padding: '0.75rem' }}>
                                                        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                                                            {c.capacidades.map((cap, j) => <li key={j}>{cap}</li>)}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </section>

                                <section style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ borderLeft: '4px solid #2563eb', paddingLeft: '0.5rem', color: '#1e40af' }}>III. SITUACIÓN SIGNIFICATIVA (EL RETO)</h3>
                                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ marginTop: 0, color: '#2563eb' }}>{result?.situacion_significativa?.titulo}</h4>
                                        <p style={{ textAlign: 'justify', lineHeight: '1.6' }}>{result?.situacion_significativa?.description || result?.situacion_significativa?.descripcion}</p>
                                    </div>
                                </section>

                                {result?.secuencia_sesiones && (
                                    <section style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ borderLeft: '4px solid #2563eb', paddingLeft: '0.5rem', color: '#1e40af' }}>IV. SECUENCIA DE ACTIVIDADES (EVALUACIÓN)</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                            {result.secuencia_sesiones.map((s, i) => (
                                                <div key={i} style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '8px', borderLeft: '4px solid #0ea5e9' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#0369a1', marginBottom: '0.25rem' }}>SESIÓN {s.sesion}: {s.titulo}</div>
                                                    <div style={{ fontSize: '0.9rem', color: '#334155' }}>{s.actividad}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                <section style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ borderLeft: '4px solid #2563eb', paddingLeft: '0.5rem', color: '#1e40af' }}>V. CRITERIOS Y EVIDENCIAS</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                                        <thead>
                                            <tr style={{ background: '#f1f5f9' }}>
                                                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'left' }}>Criterios de Evaluación</th>
                                                <th style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'left' }}>Evidencia</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result?.criterios_evaluacion?.map((ce, i) => (
                                                <tr key={i}>
                                                    <td style={{ border: '1px solid #cbd5e1', padding: '0.75rem' }}>
                                                        <div style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{ce.competencia}</div>
                                                        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                                                            {ce.criterios.map((crit, j) => <li key={j}>{crit}</li>)}
                                                        </ul>
                                                    </td>
                                                    {i === 0 && (
                                                        <td rowSpan={result?.criterios_evaluacion?.length || 1} style={{ border: '1px solid #cbd5e1', padding: '0.75rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                            {result.evidencias_aprendizaje}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </section>

                                <section style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ borderLeft: '4px solid #2563eb', paddingLeft: '0.5rem', color: '#1e40af' }}>VI. CONCLUSIONES Y RESULTADOS ESPERADOS</h3>
                                    <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#166534', lineHeight: '1.6' }}>
                                        {result?.conclusiones_resultados}
                                    </div>
                                </section>

                                <section>
                                    <h3 style={{ borderLeft: '4px solid #2563eb', paddingLeft: '0.5rem', color: '#1e40af' }}>VII. INSTRUMENTO: {result?.instrumento_recojo?.tipo}</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '0.8rem' }}>
                                        <thead>
                                            <tr style={{ background: '#f1f5f9' }}>
                                                <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>N°</th>
                                                <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'left' }}>Apellidos y Nombres</th>
                                                {(result?.instrumento_recojo?.columnas || ["Crit. 1", "Crit. 2", "Crit. 3"]).slice(2).map((col, i) => (
                                                    <th key={i} style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>{col}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const alumnosPreview = formData.alumnos 
                                                    ? formData.alumnos.split('\n').filter(n => n.trim()).map(n => n.trim())
                                                    : [1,2,3,4,5];
                                                
                                                return alumnosPreview.map((item, n) => (
                                                    <tr key={n}>
                                                        <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>{n + 1}</td>
                                                        <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem', height: '1.8rem' }}>
                                                            {typeof item === 'string' ? item : ''}
                                                        </td>
                                                        {(result?.instrumento_recojo?.columnas || ["C1", "C2", "C3"]).slice(2).map((_, i) => (
                                                            <td key={i} style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}></td>
                                                        ))}
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                </section>
                            </div>

                            {/* Footer suggestions */}
                            <div style={{ padding: '1.5rem', background: 'rgba(52, 211, 153, 0.05)', borderRadius: '12px', margin: '2rem', border: '1px dashed var(--color-secondary)' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--color-secondary)', marginBottom: '0.5rem' }}>
                                    <Sparkles size={18} />
                                    <strong>Consejo del Especialista IA:</strong>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                                    Recuerda que la evaluación diagnóstica no es para poner nota final, sino para recoger información. El reto planteado busca observar las 3 competencias en simultáneo. ¡Mucho éxito!
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Custom CSS overrides for preview table printing-like aesthetics in Dark Mode */}
            <style>
                {`
                    #diagnostic-preview table th, #diagnostic-preview table td {
                        border-color: #e2e8f0 !important;
                    }
                    @media (max-width: 768px) {
                        #diagnostic-preview {
                            padding: 1rem !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default DiagnosticoPage;
