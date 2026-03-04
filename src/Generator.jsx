import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Send, Loader2, ClipboardCheck, Dumbbell,
    Copy, Download, Share2, Zap, ArrowLeft,
    GraduationCap, BookOpen, Clock, Package, Building2, User, FileText, RefreshCw, Wand2
} from 'lucide-react';
import { generateStructuredSession, model } from './gemini';

// ==================== WORD EXPORT ====================
const exportToWord = async (data) => {
    const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, HeadingLevel, ShadingType } = await import('docx');
    const { saveAs } = await import('file-saver');

    const borderStyle = { style: BorderStyle.SINGLE, size: 1, color: '000000' };
    const cellBorders = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle };

    const headerShading = { type: ShadingType.SOLID, color: '1a56db', fill: '1a56db' };
    const subHeaderShading = { type: ShadingType.SOLID, color: 'e8f0fe', fill: 'e8f0fe' };

    const makeHeaderCell = (text, colSpan = 1) => new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'ffffff', size: 20, font: 'Calibri' })], alignment: AlignmentType.CENTER })],
        shading: headerShading,
        borders: cellBorders,
        columnSpan: colSpan,
        verticalAlign: 'center',
    });

    const makeSubHeaderCell = (text, colSpan = 1) => new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18, font: 'Calibri' })], alignment: AlignmentType.LEFT })],
        shading: subHeaderShading,
        borders: cellBorders,
        columnSpan: colSpan,
        verticalAlign: 'center',
    });

    const makeCell = (text, colSpan = 1, bold = false) => new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: text || '', bold, size: 18, font: 'Calibri' })], spacing: { before: 40, after: 40 } })],
        borders: cellBorders,
        columnSpan: colSpan,
        verticalAlign: 'center',
    });

    const d = data.datos_informativos;
    const p = data.propositos_aprendizaje;

    // --- DATOS INFORMATIVOS ---
    const datosTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [makeHeaderCell('I. DATOS INFORMATIVOS', 4)] }),
            new TableRow({ children: [makeSubHeaderCell('Docente'), makeCell(d.docente, 1), makeSubHeaderCell('I.E.'), makeCell(d.ie, 1)] }),
            new TableRow({ children: [makeSubHeaderCell('Director(a)'), makeCell(d.director, 1), makeSubHeaderCell('DRE'), makeCell(d.dre, 1)] }),
            new TableRow({ children: [makeSubHeaderCell('UGEL'), makeCell(d.ugel, 1), makeSubHeaderCell('Nivel'), makeCell(d.nivel, 1)] }),
            new TableRow({ children: [makeSubHeaderCell('Grado y Sección'), makeCell(d.grado, 1), makeSubHeaderCell('Área'), makeCell(d.area, 1)] }),
            new TableRow({ children: [makeSubHeaderCell('Tema/Actividad'), makeCell(d.tema, 3)] }),
            new TableRow({ children: [makeSubHeaderCell('Duración'), makeCell(d.duracion, 1), makeSubHeaderCell('Fecha'), makeCell(d.fecha, 1)] }),
        ]
    });

    // --- PROPÓSITOS ---
    const propositosRows = [
        new TableRow({ children: [makeHeaderCell('II. PROPÓSITOS DE APRENDIZAJE', 4)] }),
        new TableRow({ children: [makeSubHeaderCell('COMPETENCIA'), makeSubHeaderCell('CAPACIDADES'), makeSubHeaderCell('ESTÁNDAR DE APRENDIZAJE (CNEB)'), makeSubHeaderCell('EVIDENCIA')] }),
    ];

    (p.competencias || []).forEach(comp => {
        propositosRows.push(new TableRow({
            children: [
                makeCell(comp.nombre),
                makeCell((comp.capacidades || []).map((c, i) => `${i + 1}. ${c}`).join('\n')),
                makeCell(comp.estandar || ''),
                makeCell(data.evidencia_aprendizaje || ''),
            ]
        }));
    });

    propositosRows.push(new TableRow({ children: [makeSubHeaderCell('Competencia Transversal'), makeCell(p.competencia_transversal, 3)] }));
    propositosRows.push(new TableRow({ children: [makeSubHeaderCell('Enfoque Transversal'), makeCell(p.enfoque_transversal, 1), makeSubHeaderCell('Valor / Actitud'), makeCell(`${p.valor || ''} / ${p.actitud || ''}`, 1)] }));

    const propositosTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: propositosRows });

    // --- SITUACIÓN SIGNIFICATIVA ---
    const situacionTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [makeHeaderCell('III. SITUACIÓN SIGNIFICATIVA / RETO', 1)] }),
            new TableRow({ children: [makeCell(data.situacion_significativa)] }),
        ]
    });

    // --- CRITERIOS DE EVALUACIÓN ---
    const criteriosRows = [
        new TableRow({ children: [makeHeaderCell('IV. CRITERIOS DE EVALUACIÓN', 2)] }),
        new TableRow({ children: [makeSubHeaderCell('CRITERIO'), makeSubHeaderCell('EVIDENCIA')] }),
    ];
    (data.criterios_evaluacion || []).forEach(c => {
        criteriosRows.push(new TableRow({ children: [makeCell(c.criterio), makeCell(c.evidencia)] }));
    });
    const criteriosTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: criteriosRows });

    // --- SECUENCIA DIDÁCTICA ---
    const secRows = [
        new TableRow({ children: [makeHeaderCell('V. SECUENCIA DIDÁCTICA', 4)] }),
        new TableRow({ children: [makeSubHeaderCell('MOMENTO'), makeSubHeaderCell('ACTIVIDAD / ESTRATEGIA'), makeSubHeaderCell('RECURSOS'), makeSubHeaderCell('TIEMPO')] }),
    ];

    const addPhase = (phaseName, phase, color) => {
        const phaseShading = { type: ShadingType.SOLID, color, fill: color };
        secRows.push(new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: `${phaseName} (${phase.duracion})`, bold: true, color: 'ffffff', size: 18, font: 'Calibri' })], alignment: AlignmentType.CENTER })],
                    shading: phaseShading, borders: cellBorders, columnSpan: 4, verticalAlign: 'center'
                })
            ]
        }));
        (phase.actividades || []).forEach(act => {
            secRows.push(new TableRow({
                children: [
                    makeCell(act.momento, 1, true),
                    makeCell(act.descripcion),
                    makeCell(act.recursos || ''),
                    makeCell(act.tiempo || ''),
                ]
            }));
        });
    };

    addPhase('INICIO', data.secuencia_didactica.inicio, '27ae60');
    addPhase('DESARROLLO', data.secuencia_didactica.desarrollo, '2980b9');
    addPhase('CIERRE', data.secuencia_didactica.cierre, 'e74c3c');

    const secuenciaTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: secRows });

    // --- INSTRUMENTO DE EVALUACIÓN ---
    const inst = data.instrumento_evaluacion;
    const instHeaderRow = [makeSubHeaderCell('N°'), makeSubHeaderCell('APELLIDOS Y NOMBRES')];
    (inst.criterios_instrumento || []).forEach((c, i) => {
        instHeaderRow.push(makeSubHeaderCell(`C${i + 1}`));
    });

    const instRows = [
        new TableRow({ children: [makeHeaderCell(`VI. INSTRUMENTO DE EVALUACIÓN: ${inst.tipo}`, 2 + (inst.criterios_instrumento || []).length)] }),
    ];

    // Fila de leyenda de criterios
    const criteriosLeyenda = (inst.criterios_instrumento || []).map((c, i) => `C${i + 1}: ${c.criterio}`).join(' | ');
    instRows.push(new TableRow({ children: [makeCell(criteriosLeyenda, 2 + (inst.criterios_instrumento || []).length)] }));

    instRows.push(new TableRow({ children: instHeaderRow }));

    (inst.alumnos || []).forEach((alumno, idx) => {
        const row = [makeCell(`${idx + 1}`), makeCell(alumno)];
        (inst.criterios_instrumento || []).forEach(() => row.push(makeCell('')));
        instRows.push(new TableRow({ children: row }));
    });

    const instrumentoTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: instRows });

    // --- DOCUMENT ---
    const sections = [
        new Paragraph({ text: data.titulo || 'SESIÓN DE APRENDIZAJE', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
        datosTable,
        new Paragraph({ text: '', spacing: { before: 200, after: 200 } }),
        propositosTable,
        new Paragraph({ text: '', spacing: { before: 200, after: 200 } }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({ children: [makeHeaderCell('PROPÓSITO DE LA SESIÓN', 1)] }),
                new TableRow({ children: [makeCell(data.proposito_sesion)] }),
            ]
        }),
        new Paragraph({ text: '', spacing: { before: 200, after: 200 } }),
        situacionTable,
        new Paragraph({ text: '', spacing: { before: 200, after: 200 } }),
        criteriosTable,
        new Paragraph({ text: '', spacing: { before: 200, after: 200 } }),
        secuenciaTable,
        new Paragraph({ text: '', spacing: { before: 200, after: 200 } }),
        instrumentoTable,
    ];

    // Teoría
    if (data.teoria) {
        sections.push(new Paragraph({ text: '', spacing: { before: 200, after: 200 } }));
        sections.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({ children: [makeHeaderCell('VII. TEORÍA DEL TEMA', 1)] }),
                new TableRow({ children: [makeCell(data.teoria.contenido)] }),
            ]
        }));
    }

    // Ficha
    if (data.ficha_aplicacion) {
        sections.push(new Paragraph({ text: '', spacing: { before: 200, after: 200 } }));
        const fichaRows = [new TableRow({ children: [makeHeaderCell('VIII. FICHA DE APLICACIÓN', 1)] })];
        (data.ficha_aplicacion.preguntas || []).forEach(p => {
            let texto = `${p.numero}. ${p.pregunta}`;
            if (p.opciones) texto += '\n' + p.opciones.join('\n');
            fichaRows.push(new TableRow({ children: [makeCell(texto)] }));
        });
        sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: fichaRows }));
    }

    // Referencias
    sections.push(new Paragraph({ text: '', spacing: { before: 200, after: 200 } }));
    sections.push(new Paragraph({ text: 'REFERENCIAS BIBLIOGRÁFICAS:', heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }));
    (data.referencias_bibliograficas || []).forEach(ref => {
        sections.push(new Paragraph({ children: [new TextRun({ text: `• ${ref}`, size: 20, font: 'Calibri' })], spacing: { after: 40 } }));
    });

    // Firmas
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
                    margin: { top: 851, right: 851, bottom: 851, left: 851 },
                },
            },
            children: sections,
        }],
    });

    const blob = await Packer.toBlob(doc);
    const filename = `Sesion_${(d.tema || 'aprendizaje').replace(/\s+/g, '_').substring(0, 30)}_${d.grado || ''}.docx`;
    saveAs(blob, filename);
};


// ==================== SESSION PREVIEW COMPONENT ====================
function SessionPreview({ data }) {
    if (!data) return null;
    const d = data.datos_informativos;
    const p = data.propositos_aprendizaje;

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '1.5rem',
        fontSize: '0.85rem',
    };
    const thStyle = {
        background: 'linear-gradient(135deg, #1a56db, #1e40af)',
        color: '#fff',
        padding: '0.6rem 0.8rem',
        textAlign: 'left',
        fontWeight: 700,
        fontSize: '0.85rem',
        border: '1px solid #334155',
    };
    const subThStyle = {
        background: 'rgba(30, 64, 175, 0.15)',
        color: 'var(--color-primary)',
        padding: '0.5rem 0.8rem',
        fontWeight: 600,
        fontSize: '0.8rem',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        whiteSpace: 'nowrap',
    };
    const tdStyle = {
        padding: '0.5rem 0.8rem',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        fontSize: '0.82rem',
    };
    const phaseColors = {
        inicio: { bg: 'rgba(39, 174, 96, 0.2)', header: 'linear-gradient(135deg, #27ae60, #2ecc71)', label: '🟢 INICIO' },
        desarrollo: { bg: 'rgba(41, 128, 185, 0.2)', header: 'linear-gradient(135deg, #2980b9, #3498db)', label: '🔵 DESARROLLO' },
        cierre: { bg: 'rgba(231, 76, 60, 0.2)', header: 'linear-gradient(135deg, #e74c3c, #c0392b)', label: '🔴 CIERRE' },
    };

    const renderPhase = (key, phase) => {
        const colors = phaseColors[key];
        return (
            <React.Fragment key={key}>
                <tr><td colSpan="4" style={{ ...thStyle, background: colors.header, textAlign: 'center', fontSize: '0.9rem' }}>{colors.label} ({phase.duracion})</td></tr>
                {(phase.actividades || []).map((act, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? colors.bg : 'transparent' }}>
                        <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-primary)', width: '18%' }}>{act.momento}</td>
                        <td style={{ ...tdStyle, whiteSpace: 'pre-wrap' }}>{act.descripcion}</td>
                        <td style={{ ...tdStyle, width: '12%' }}>{act.recursos || '-'}</td>
                        <td style={{ ...tdStyle, width: '8%', textAlign: 'center' }}>{act.tiempo || '-'}</td>
                    </tr>
                ))}
            </React.Fragment>
        );
    };

    return (
        <div className="admin-table-wrapper" style={{ padding: '0.5rem' }}>
            {/* TÍTULO */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    📋 {data.titulo || 'SESIÓN DE APRENDIZAJE'}
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Generado por EduFísica AI • Alineado al CNEB</span>
            </div>

            {/* I. DATOS INFORMATIVOS */}
            <table style={tableStyle}>
                <thead><tr><th colSpan="4" style={thStyle}>I. DATOS INFORMATIVOS</th></tr></thead>
                <tbody>
                    <tr><td style={subThStyle}>Docente</td><td style={tdStyle}>{d.docente}</td><td style={subThStyle}>I.E.</td><td style={tdStyle}>{d.ie}</td></tr>
                    <tr><td style={subThStyle}>Director(a)</td><td style={tdStyle}>{d.director}</td><td style={subThStyle}>DRE</td><td style={tdStyle}>{d.dre}</td></tr>
                    <tr><td style={subThStyle}>UGEL</td><td style={tdStyle}>{d.ugel}</td><td style={subThStyle}>Nivel</td><td style={tdStyle}>{d.nivel}</td></tr>
                    <tr><td style={subThStyle}>Grado</td><td style={tdStyle}>{d.grado}</td><td style={subThStyle}>Área</td><td style={tdStyle}>{d.area}</td></tr>
                    <tr><td style={subThStyle}>Tema</td><td colSpan="3" style={tdStyle}>{d.tema}</td></tr>
                    <tr><td style={subThStyle}>Duración</td><td style={tdStyle}>{d.duracion}</td><td style={subThStyle}>Fecha</td><td style={tdStyle}>{d.fecha}</td></tr>
                </tbody>
            </table>

            {/* II. PROPÓSITOS */}
            <table style={tableStyle}>
                <thead><tr><th colSpan="4" style={thStyle}>II. PROPÓSITOS DE APRENDIZAJE</th></tr></thead>
                <tbody>
                    <tr><td style={subThStyle}>Competencia</td><td style={subThStyle}>Capacidades</td><td style={subThStyle}>Estándar de Aprendizaje (CNEB)</td><td style={subThStyle}>Evidencia</td></tr>
                    {(p.competencias || []).map((comp, i) => (
                        <tr key={i}>
                            <td style={{ ...tdStyle, fontWeight: 600, width: '25%' }}>{comp.nombre}</td>
                            <td style={tdStyle}>{(comp.capacidades || []).map((c, j) => <div key={j}>• {c}</div>)}</td>
                            <td style={tdStyle}><em>{comp.estandar || ''}</em></td>
                            <td style={{ ...tdStyle, width: '20%' }}>{data.evidencia_aprendizaje}</td>
                        </tr>
                    ))}
                    <tr><td style={subThStyle}>Comp. Transversal</td><td colSpan="3" style={tdStyle}>{p.competencia_transversal}</td></tr>
                    <tr><td style={subThStyle}>Enfoque Transversal</td><td style={tdStyle}>{p.enfoque_transversal}</td><td style={subThStyle}>Valor / Actitud</td><td style={tdStyle}>{p.valor} / {p.actitud}</td></tr>
                </tbody>
            </table>

            {/* PROPÓSITO DE LA SESIÓN */}
            <table style={tableStyle}>
                <thead><tr><th style={thStyle}>PROPÓSITO DE LA SESIÓN</th></tr></thead>
                <tbody><tr><td style={{ ...tdStyle, fontStyle: 'italic', lineHeight: 1.8 }}>{data.proposito_sesion}</td></tr></tbody>
            </table>

            {/* SITUACIÓN SIGNIFICATIVA */}
            <table style={tableStyle}>
                <thead><tr><th style={thStyle}>III. SITUACIÓN SIGNIFICATIVA / RETO</th></tr></thead>
                <tbody><tr><td style={{ ...tdStyle, lineHeight: 1.8 }}>{data.situacion_significativa}</td></tr></tbody>
            </table>

            {/* CRITERIOS DE EVALUACIÓN */}
            <table style={tableStyle}>
                <thead><tr><th colSpan="2" style={thStyle}>IV. CRITERIOS DE EVALUACIÓN</th></tr></thead>
                <tbody>
                    <tr><td style={subThStyle}>Criterio</td><td style={subThStyle}>Evidencia Esperada</td></tr>
                    {(data.criterios_evaluacion || []).map((c, i) => (
                        <tr key={i}><td style={tdStyle}>{c.criterio}</td><td style={tdStyle}>{c.evidencia}</td></tr>
                    ))}
                </tbody>
            </table>

            {/* SECUENCIA DIDÁCTICA */}
            <table style={tableStyle}>
                <thead>
                    <tr><th colSpan="4" style={thStyle}>V. SECUENCIA DIDÁCTICA</th></tr>
                    <tr><td style={subThStyle}>Momento</td><td style={subThStyle}>Actividad / Estrategia</td><td style={subThStyle}>Recursos</td><td style={subThStyle}>Tiempo</td></tr>
                </thead>
                <tbody>
                    {renderPhase('inicio', data.secuencia_didactica.inicio)}
                    {renderPhase('desarrollo', data.secuencia_didactica.desarrollo)}
                    {renderPhase('cierre', data.secuencia_didactica.cierre)}
                </tbody>
            </table>

            {/* INSTRUMENTO DE EVALUACIÓN */}
            {data.instrumento_evaluacion && (() => {
                const inst = data.instrumento_evaluacion;
                const criterios = inst.criterios_instrumento || [];
                return (
                    <table style={tableStyle}>
                        <thead>
                            <tr><th colSpan={2 + criterios.length} style={thStyle}>VI. INSTRUMENTO DE EVALUACIÓN: {inst.tipo}</th></tr>
                            <tr><td colSpan={2 + criterios.length} style={{ ...tdStyle, fontSize: '0.75rem', fontStyle: 'italic', background: 'rgba(30, 64, 175, 0.08)' }}>
                                {criterios.map((c, i) => <span key={i} style={{ marginRight: '1rem' }}><strong>C{i + 1}:</strong> {c.criterio}</span>)}
                            </td></tr>
                            <tr>
                                <td style={subThStyle}>N°</td>
                                <td style={subThStyle}>Apellidos y Nombres</td>
                                {criterios.map((_, i) => <td key={i} style={{ ...subThStyle, textAlign: 'center' }}>C{i + 1}</td>)}
                            </tr>
                        </thead>
                        <tbody>
                            {(inst.alumnos || []).map((alumno, idx) => (
                                <tr key={idx} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                    <td style={{ ...tdStyle, textAlign: 'center', width: '5%' }}>{idx + 1}</td>
                                    <td style={tdStyle}>{alumno}</td>
                                    {criterios.map((_, i) => <td key={i} style={{ ...tdStyle, textAlign: 'center', width: '8%' }}></td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            })()}

            {/* TEORÍA */}
            {data.teoria && (
                <table style={tableStyle}>
                    <thead><tr><th style={thStyle}>VII. TEORÍA DEL TEMA: {data.teoria.titulo}</th></tr></thead>
                    <tbody><tr><td style={{ ...tdStyle, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{data.teoria.contenido}</td></tr></tbody>
                </table>
            )}

            {/* FICHA */}
            {data.ficha_aplicacion && (
                <table style={tableStyle}>
                    <thead><tr><th style={thStyle}>VIII. FICHA DE APLICACIÓN</th></tr></thead>
                    <tbody>
                        {(data.ficha_aplicacion.preguntas || []).map((p, i) => (
                            <tr key={i}><td style={{ ...tdStyle, lineHeight: 1.8 }}>
                                <strong>{p.numero}. {p.pregunta}</strong>
                                {p.opciones && <div style={{ paddingLeft: '1rem', marginTop: '0.3rem' }}>{p.opciones.map((o, j) => <div key={j}>{o}</div>)}</div>}
                                {p.tipo === 'abierta' && <div style={{ borderBottom: '1px dotted #666', marginTop: '0.5rem', height: '1.5rem' }}></div>}
                            </td></tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* REFERENCIAS */}
            {data.referencias_bibliograficas && (
                <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(30, 64, 175, 0.08)', borderRadius: '8px', borderLeft: '3px solid var(--color-primary)' }}>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>📚 Referencias Bibliográficas:</strong>
                    {data.referencias_bibliograficas.map((ref, i) => (
                        <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>• {ref}</div>
                    ))}
                </div>
            )}
        </div>
    );
}


// ==================== MAIN GENERATOR COMPONENT ====================
function Generator() {
    const [loading, setLoading] = useState(false);
    const [sessionData, setSessionData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState({
        docente: '',
        ie: '',
        director: '',
        dre: '',
        ugel: '',
        contexto: '',
        nivel: 'Secundaria',
        grado: '3er Grado',
        area: 'Educación Física',
        competencias: [],
        sugerirCompetencia: false,
        competenciaTransversal: '',
        enfoqueTransversal: '',
        tema: '',
        duracion: '90 minutos',
        instrumento: 'Lista de Cotejo',
        alumnos: '',
        generarTeoria: false,
        generarFicha: false,
        numPreguntasFicha: 5
    });
    const [sugiriendoTema, setSugiriendoTema] = useState(false);
    const [temasSugeridos, setTemasSugeridos] = useState([]);

    const [savedLists, setSavedLists] = useState(() => {
        try {
            const saved = localStorage.getItem('edufisica_saved_lists');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [selectedListId, setSelectedListId] = useState('');

    useEffect(() => {
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

    const handleCompetenciaChange = (comp) => {
        setFormData(prev => ({
            ...prev,
            competencias: prev.competencias.includes(comp)
                ? prev.competencias.filter(c => c !== comp)
                : prev.competencias.length >= 2
                    ? prev.competencias // máximo 2
                    : [...prev.competencias, comp]
        }));
    };

    const handleSugerirTema = async () => {
        if (!model) { alert('Modelo de IA no disponible'); return; }
        const competenciasRef = formData.sugerirCompetencia
            ? 'Se desenvuelve de manera autónoma, Asume una vida saludable, Interactúa sociomotrizmente'
            : formData.competencias.join(', ') || 'Educación Física general';
        setSugiriendoTema(true);
        setTemasSugeridos([]);
        try {
            const promptSugerencia = `Eres experto en Educación Física para Perú. Sugiere 5 temas específicos creativos y contextualizados para una sesión de aprendizaje de Educación Física con las siguientes características:
- Nivel: ${formData.nivel}
- Grado: ${formData.grado}
- Competencia(s): ${competenciasRef}
- Contexto: ${formData.contexto || 'Perú'}

Devuelve SOLO un array JSON válido con 5 strings, sin texto adicional. Ejemplo: ["Tema 1","Tema 2","Tema 3","Tema 4","Tema 5"]`;
            const result = await model.generateContent(promptSugerencia);
            const text = result.response.text().replace(/```json?\s*/g, '').replace(/```/g, '').trim();
            const sugerencias = JSON.parse(text);
            setTemasSugeridos(Array.isArray(sugerencias) ? sugerencias : []);
        } catch (err) {
            console.error('Error sugiriendo tema:', err);
        } finally {
            setSugiriendoTema(false);
        }
    };

    const handleGenerate = async () => {
        if (!formData.tema) return;
        setLoading(true);
        setErrorMsg('');
        setSessionData(null);

        try {
            const result = await generateStructuredSession(formData);
            if (result.success) {
                setSessionData(result.data);
            } else {
                setErrorMsg(result.error);
            }
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadWord = async () => {
        if (!sessionData) return;
        try {
            await exportToWord(sessionData);
        } catch (err) {
            console.error("Error exportando Word:", err);
            alert("Error al generar el archivo Word. Intenta de nuevo.");
        }
    };

    const handleCopyText = () => {
        if (!sessionData) return;
        const text = JSON.stringify(sessionData, null, 2);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ minHeight: '80vh' }}>
            <div className="generator-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {/* ======================== LEFT: FORM ======================== */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass"
                    style={{ padding: '2rem', height: 'fit-content', borderTop: '2px solid var(--color-primary)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--color-primary-glow)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}><Sparkles size={24} /></div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Nueva Sesión</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Formato Oficial CNEB • Exportable a Word</p>
                        </div>
                    </div>

                    {/* Datos Docente */}
                    <div className="form-group">
                        <label className="form-label">Nombre del Docente:</label>
                        <input type="text" className="form-input" placeholder="Escribe tu nombre completo" value={formData.docente} onChange={(e) => setFormData({ ...formData, docente: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Institución Educativa:</label>
                        <input type="text" className="form-input" placeholder="Ej: I.E. San Martín de Porres" value={formData.ie} onChange={(e) => setFormData({ ...formData, ie: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Nombre del Director(a):</label>
                        <input type="text" className="form-input" placeholder="Nombre del director(a)" value={formData.director} onChange={(e) => setFormData({ ...formData, director: e.target.value })} />
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">DRE:</label>
                            <input type="text" className="form-input" placeholder="Ej: DRE San Martín" value={formData.dre} onChange={(e) => setFormData({ ...formData, dre: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">UGEL:</label>
                            <input type="text" className="form-input" placeholder="Ej: UGEL Lamas" value={formData.ugel} onChange={(e) => setFormData({ ...formData, ugel: e.target.value })} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contexto Local (Opcional):</label>
                        <input type="text" className="form-input" placeholder="Ej: Zona rural de Tarapoto" value={formData.contexto} onChange={(e) => setFormData({ ...formData, contexto: e.target.value })} />
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Nivel Educativo:</label>
                            <select className="form-select" value={formData.nivel} onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}>
                                <option>Inicial</option><option>Primaria</option><option>Secundaria</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Grado:</label>
                            <select className="form-select" value={formData.grado} onChange={(e) => setFormData({ ...formData, grado: e.target.value })}>
                                <option>1er Grado</option><option>2do Grado</option><option>3er Grado</option><option>4to Grado</option><option>5to Grado</option><option>6to Grado</option>
                                <option>3 años</option><option>4 años</option><option>5 años</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Área Curricular:</label>
                        <select className="form-select" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })}>
                            <option>Educación Física</option>
                        </select>
                    </div>

                    {/* Competencias */}
                    <div className="form-group" style={{ background: 'var(--glass-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                        <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block', color: 'var(--color-primary)' }}>Competencia(s): <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>(máximo 2)</span></label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: formData.sugerirCompetencia ? 'var(--color-secondary)' : 'var(--text-primary)', fontWeight: formData.sugerirCompetencia ? 600 : 400 }}>
                                <input type="checkbox" style={{ accentColor: 'var(--color-secondary)' }} checked={formData.sugerirCompetencia} onChange={(e) => setFormData({ ...formData, sugerirCompetencia: e.target.checked, competencias: [] })} />
                                Dejar que la IA sugiera la competencia (máx. 2)
                            </label>
                            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.25rem 0' }}></div>
                            {['Se desenvuelve de manera autónoma a través de su motricidad', 'Asume una vida saludable', 'Interactúa a través de sus habilidades sociomotrices'].map(comp => (
                                <label key={comp} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: (formData.sugerirCompetencia || (formData.competencias.length >= 2 && !formData.competencias.includes(comp))) ? 'not-allowed' : 'pointer', fontSize: '0.85rem', opacity: (formData.sugerirCompetencia || (formData.competencias.length >= 2 && !formData.competencias.includes(comp))) ? 0.4 : 1 }}>
                                    <input type="checkbox"
                                        disabled={formData.sugerirCompetencia || (formData.competencias.length >= 2 && !formData.competencias.includes(comp))}
                                        checked={formData.competencias.includes(comp)}
                                        onChange={() => handleCompetenciaChange(comp)} />
                                    {comp}
                                </label>
                            ))}
                            {!formData.sugerirCompetencia && formData.competencias.length >= 2 && (
                                <p style={{ fontSize: '0.72rem', color: '#f59e0b', margin: 0 }}>⚠️ Máximo 2 competencias seleccionadas.</p>
                            )}
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Competencia Transversal:</label>
                            <select className="form-select" value={formData.competenciaTransversal} onChange={(e) => setFormData({ ...formData, competenciaTransversal: e.target.value })}>
                                <option value="">-- Ninguna --</option>
                                <option>Se desenvuelve en entornos virtuales generados por las TIC</option>
                                <option>Gestiona su aprendizaje de manera autónoma</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Enfoque Transversal:</label>
                            <select className="form-select" value={formData.enfoqueTransversal} onChange={(e) => setFormData({ ...formData, enfoqueTransversal: e.target.value })}>
                                <option value="">-- Ninguno --</option>
                                <option>Enfoque de Derechos</option><option>Enfoque Inclusivo o de Atención a la Diversidad</option>
                                <option>Enfoque Intercultural</option><option>Enfoque Igualdad de Género</option>
                                <option>Enfoque Ambiental</option><option>Enfoque Orientación al Bien Común</option>
                                <option>Enfoque Búsqueda de la Excelencia</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tema Específico de la Sesión:</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="text" className="form-input" style={{ flex: 1 }}
                                placeholder="Ej: Recepcón en voleibol y posiciones" value={formData.tema}
                                onChange={(e) => setFormData({ ...formData, tema: e.target.value })} />
                            <button type="button" className="btn btn-secondary"
                                title="Sugerir temas con IA"
                                style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                                onClick={handleSugerirTema}
                                disabled={sugiriendoTema}>
                                {sugiriendoTema ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                                {sugiriendoTema ? 'Buscando...' : 'Sugerir'}
                            </button>
                        </div>
                        {temasSugeridos.length > 0 && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 0.25rem' }}>💡 Selecciona un tema sugerido:</p>
                                {temasSugeridos.map((t, i) => (
                                    <button key={i} type="button"
                                        onClick={() => { setFormData({ ...formData, tema: t }); setTemasSugeridos([]); }}
                                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.target.style.background = 'var(--color-primary-glow)'}
                                        onMouseLeave={e => e.target.style.background = 'var(--glass-bg)'}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Duración:</label>
                            <select className="form-select" value={formData.duracion} onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}>
                                <option>45 minutos</option><option>90 minutos</option><option>135 minutos</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Instrumento de Evaluación:</label>
                            <select className="form-select" value={formData.instrumento} onChange={(e) => setFormData({ ...formData, instrumento: e.target.value })}>
                                <option>Lista de Cotejo</option><option>Rúbrica de evaluación</option><option>Guía de observación</option>
                            </select>
                        </div>
                    </div>

                    {/* Lista de alumnos */}
                    <div className="form-group" style={{ background: 'var(--glass-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                        <label className="form-label" style={{ color: 'var(--color-primary)' }}>Lista de Alumnos (opcional):</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                            <select className="form-select" style={{ flex: 1, minWidth: '200px', padding: '0.5rem', fontSize: '0.85rem' }} value={selectedListId} onChange={handleSelectList}>
                                <option value="">-- Seleccionar lista guardada --</option>
                                {savedLists.map(list => (<option key={list.id} value={list.id}>{list.name}</option>))}
                            </select>
                            <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={handleSaveList}>Guardar</button>
                            <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: '#e11d48', color: 'white', border: 'none' }} onClick={handleDeleteList} disabled={!selectedListId}>Eliminar</button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Escribe o pega los nombres para incluirlos en el instrumento.</p>
                        <textarea placeholder={"Juan Pérez García\nMaría López Rodríguez\n..."} className="form-textarea"
                            value={formData.alumnos} onChange={(e) => { setFormData({ ...formData, alumnos: e.target.value }); setSelectedListId(''); }}
                            style={{ minHeight: '120px', background: 'rgba(0,0,0,0.3)', fontFamily: 'monospace', fontSize: '0.85rem' }} />
                    </div>

                    {/* Extras */}
                    <div className="form-grid-2">
                        <label style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                            background: formData.generarTeoria ? 'var(--color-primary-glow)' : 'var(--glass-bg)',
                            border: `1px solid ${formData.generarTeoria ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                            padding: '1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s'
                        }}>
                            <input type="checkbox" style={{ marginTop: '0.25rem', accentColor: 'var(--color-primary)' }}
                                checked={formData.generarTeoria}
                                onChange={(e) => setFormData({ ...formData, generarTeoria: e.target.checked })} />
                            <div>
                                <span style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: formData.generarTeoria ? 'var(--color-primary)' : 'var(--text-primary)' }}>Generar Teoría del Tema</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contenido teórico de la sesión</span>
                            </div>
                        </label>

                        <div style={{
                            background: formData.generarFicha ? 'var(--color-primary-glow)' : 'var(--glass-bg)',
                            border: `1px solid ${formData.generarFicha ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                            padding: '1rem', borderRadius: 'var(--radius-md)', transition: 'all 0.2s'
                        }}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                                <input type="checkbox" style={{ marginTop: '0.25rem', accentColor: 'var(--color-primary)' }}
                                    checked={formData.generarFicha}
                                    onChange={(e) => setFormData({ ...formData, generarFicha: e.target.checked })} />
                                <div>
                                    <span style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: formData.generarFicha ? 'var(--color-primary)' : 'var(--text-primary)' }}>Generar Ficha de Aplicación</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Preguntas basadas en la teoría</span>
                                </div>
                            </label>
                            {formData.generarFicha && (
                                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>N° preguntas:</label>
                                    <input type="number" min="3" max="20"
                                        className="form-input"
                                        style={{ width: '70px', padding: '0.3rem 0.5rem', fontSize: '0.85rem', textAlign: 'center' }}
                                        value={formData.numPreguntasFicha}
                                        onChange={(e) => setFormData({ ...formData, numPreguntasFicha: Math.max(3, Math.min(20, parseInt(e.target.value) || 5)) })} />
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={handleGenerate}
                        disabled={loading || !formData.tema || (!formData.sugerirCompetencia && formData.competencias.length === 0)}
                        className="btn btn-primary"
                        style={{ padding: '1.25rem', marginTop: '1rem', width: '100%', fontSize: '1rem', background: '#34d399', color: '#064e3b', boxShadow: '0 4px 15px rgba(52, 211, 153, 0.3)', border: 'none' }}>
                        {loading ? <><Loader2 className="animate-spin" style={{ display: 'inline', marginRight: '0.5rem' }} />Generando sesión profesional...</> : <span style={{ fontWeight: 800 }}>⚡ Generar Sesión Completa</span>}
                    </button>

                </motion.div>

                {/* ======================== RIGHT: RESULT ======================== */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ position: 'relative' }}>
                    <AnimatePresence mode="wait">
                        {!sessionData && !loading && !errorMsg ? (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="glass" style={{ padding: '3rem', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderStyle: 'dashed' }}>
                                <div style={{ width: '80px', height: '80px', background: 'var(--glass-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    <FileText size={40} style={{ opacity: 0.2 }} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tu sesión aparecerá aquí</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px' }}>Con formato profesional de tablas, lista para descargar en Word (.docx)</p>
                            </motion.div>
                        ) : loading ? (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="glass" style={{ padding: '3rem', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <div className="animate-spin" style={{ marginBottom: '1.5rem' }}>
                                    <Loader2 size={50} color="var(--color-primary)" />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Generando sesión profesional...</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>La IA está creando tu sesión con formato CNEB completo.<br />Esto puede tomar 15-30 segundos.</p>
                            </motion.div>
                        ) : errorMsg ? (
                            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="glass" style={{ padding: '2rem', borderLeft: '3px solid #e11d48' }}>
                                <h3 style={{ color: '#e11d48', marginBottom: '0.5rem' }}>❌ Error al generar</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{errorMsg}</p>
                                <button onClick={handleGenerate} className="btn btn-secondary"><RefreshCw size={16} /> Reintentar</button>
                            </motion.div>
                        ) : (
                            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="glass result-container" style={{ padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>

                                {/* Action bar */}
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem',
                                    position: 'sticky', top: 0, background: 'rgba(6,11,24,0.9)', backdropFilter: 'blur(10px)', padding: '0.5rem 0', zIndex: 10
                                }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-secondary)', border: '1px solid var(--color-secondary-glow)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                                        📋 SESIÓN GENERADA POR IA
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={handleDownloadWord} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Download size={16} /> Descargar Word
                                        </button>
                                        <button onClick={handleCopyText} className="btn-icon" title="Copiar">
                                            {copied ? <ClipboardCheck size={18} color="var(--color-secondary)" /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Session Preview */}
                                <SessionPreview data={sessionData} />

                                {/* Bottom actions */}
                                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                    <button onClick={handleGenerate} className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                        <RefreshCw size={16} /> REGENERAR
                                    </button>
                                    <button onClick={handleDownloadWord} className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                        <Download size={16} /> DESCARGAR WORD
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
