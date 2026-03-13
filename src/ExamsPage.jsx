import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, ClipboardCheck, Download, Eye, Star } from 'lucide-react';
import { generateExam, model } from './gemini';

const ExamsPage = ({ onNavigate, user }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [examResult, setExamResult] = useState(null);

    const [formData, setFormData] = useState({
        docente: user?.displayName || 'Lic. Educación Física',
        curso: 'Educación Física',
        nivel: 'Secundaria',
        grado: '3er Grado',
        tipoEval: 'Práctica Calificada',
        tema: '',
        tipoPreguntas: 'Mixto (Recomendado)',
        numPreguntas: 10,
        incluirSolucionario: true
    });
    const [isSuggestingTopic, setIsSuggestingTopic] = useState(false);

    const nivelesStr = {
        'Inicial': ['3 años', '4 años', '5 años'],
        'Primaria': ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'],
        'Secundaria': ['1er Año', '2do Año', '3er Año', '4to Año', '5to Año']
    };

    const handleNivelChange = (e) => {
        const nivel = e.target.value;
        const defaultGrado = nivelesStr[nivel]?.[0] || '';
        setFormData({ ...formData, nivel, grado: defaultGrado });
    };

    const handleGenerate = async () => {
        if (!formData.tema.trim()) {
            alert('Por favor, ingresa los temas a evaluar.');
            return;
        }
        setLoading(true);
        const res = await generateExam(formData);
        if (res.success) {
            setExamResult(res.data);
            alert("¡Evaluación generada con éxito! Puedes revisar la vista previa abajo o descargarla en Word.");
        } else {
            alert("Error al generar la evaluación: " + res.error);
        }
        setLoading(false);
    };

    const downloadAsWord = () => {
        if (!examResult) {
            alert("Primero debes generar una evaluación para poder descargarla.");
            return;
        }
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Evaluación</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; } .pregunta { margin-bottom: 20px; } .opciones { margin-left: 20px; } .lineas { border-bottom: 1px dashed #666; margin-top: 25px; height: 1px; }</style></head><body>";
        const footer = "</body></html>";

        let htmlSource = `<h1 style="text-align: center;">${examResult.titulo}</h1>`;
        htmlSource += `<p><strong>Nombre y Apellido:</strong> __________________________________________________</p>`;
        htmlSource += `<p><strong>Grado:</strong> ${formData.grado} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Fecha:</strong> _________________</p><hr/>`;

        (examResult.preguntas || []).forEach((q, i) => {
            htmlSource += `<div class="pregunta">`;
            htmlSource += `<p><strong>${i + 1}. ${q.pregunta}</strong></p>`;

            if (q.tipo === 'opcion_multiple' && q.opciones) {
                htmlSource += `<div class="opciones">`;
                q.opciones.forEach(opt => {
                    htmlSource += `<p>(  ) ${opt}</p>`;
                });
                htmlSource += `</div>`;
            } else if (q.tipo === 'verdadero_falso') {
                htmlSource += `<p>(  ) Verdadero &nbsp;&nbsp;&nbsp; (  ) Falso</p>`;
            } else {
                const lineas = q.espacio_lineas || 3;
                for (let j = 0; j < lineas; j++) {
                    htmlSource += `<div class="lineas"></div>`;
                }
            }
            htmlSource += `</div>`;
        });

        if (formData.incluirSolucionario) {
            htmlSource += `<br/><hr/><h2 style="color:red; page-break-before: always;">CLAVE DE RESPUESTAS (PARA EL DOCENTE)</h2>`;
            (examResult.preguntas || []).forEach((q, i) => {
                htmlSource += `<p><strong>${i + 1}.</strong> ${q.respuesta_esperada || 'Respuesta abierta'}</p>`;
            });
        }

        const sourceHTML = header + htmlSource + footer;
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = `Evaluacion_${formData.grado}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
    };

    const renderResultPreview = () => {
        if (!examResult) return null;
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ color: 'var(--color-primary)', margin: 0 }}>Vista Previa de la Evaluación</h2>
                    <button className="btn btn-secondary" onClick={() => setExamResult(null)}>Cerrar Vista Previa</button>
                </div>

                <div className="glass" style={{ padding: '2rem', background: '#fff', color: '#000', borderRadius: '8px' }}>
                    <div style={{ borderBottom: '2px solid #ccc', paddingBottom: '1rem', marginBottom: '2rem' }}>
                        <h1 style={{ textAlign: 'center', margin: '0 0 1rem 0', fontSize: '1.5rem' }}>{examResult.titulo}</h1>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span><strong>Nombre:</strong> ______________________________________</span>
                            <span><strong>Fecha:</strong> ___________</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span><strong>Grado:</strong> {formData.grado}</span>
                            <span><strong>Calificación:</strong> ___________</span>
                        </div>
                    </div>

                    {(examResult.preguntas || []).map((q, i) => (
                        <div key={i} style={{ marginBottom: '2rem' }}>
                            <p style={{ fontWeight: 'bold', fontSize: '1.05rem', marginBottom: '0.5rem' }}>{i + 1}. {q.pregunta}</p>

                            {q.tipo === 'opcion_multiple' && q.opciones && (
                                <div style={{ paddingLeft: '1.5rem' }}>
                                    {q.opciones.map((opt, j) => (
                                        <div key={j} style={{ marginBottom: '0.25rem' }}>(  ) {opt}</div>
                                    ))}
                                </div>
                            )}

                            {q.tipo === 'verdadero_falso' && (
                                <div style={{ paddingLeft: '1.5rem', display: 'flex', gap: '2rem' }}>
                                    <span>(  ) Verdadero</span>
                                    <span>(  ) Falso</span>
                                </div>
                            )}

                            {q.tipo === 'abierta' && (
                                <div style={{ marginTop: '1rem' }}>
                                    {Array.from({ length: q.espacio_lineas || 3 }).map((_, j) => (
                                        <div key={j} style={{ borderBottom: '1px dashed #999', height: '1.5rem', marginTop: '0.5rem' }}></div>
                                    ))}
                                </div>
                            )}

                            {formData.incluirSolucionario && (
                                <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px', fontSize: '0.9rem' }}>
                                    <strong>Clave Docente:</strong> {q.respuesta_esperada || 'Pregunta de desarrollo.'}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
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
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Generador de <span className="text-gradient">Evaluaciones</span> con IA</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Crea exámenes y prácticas personalizadas en segundos.</p>
                    </div>
                </div>
            </header>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: '2.5rem', maxWidth: '850px', margin: '0 auto' }}>
                {/* Datos Generales */}
                <div style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem', position: 'relative', background: 'var(--glass-bg)' }}>
                    <h4 style={{ position: 'absolute', top: '-15px', left: '15px', background: 'var(--color-surface)', padding: '4px 12px', color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 'bold', margin: 0, borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>Datos Generales</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nombre del Docente:</label>
                            <input type="text" className="form-input" style={{ width: '100%' }} value={formData.docente} onChange={e => setFormData({ ...formData, docente: e.target.value })} />
                        </div>
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Curso/Área:</label>
                            <select className="form-select" style={{ width: '100%' }} value={formData.curso} onChange={e => setFormData({ ...formData, curso: e.target.value })}>
                                <option>Educación Física</option>
                                <option>Ciencias Sociales</option>
                                <option>Matemática</option>
                                <option>Comunicación</option>
                                <option>Ciencia y Tecnología</option>
                                <option>Arte y Cultura</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nivel:</label>
                            <select className="form-select" style={{ width: '100%' }} value={formData.nivel} onChange={handleNivelChange}>
                                <option value="Inicial">Inicial</option>
                                <option value="Primaria">Primaria</option>
                                <option value="Secundaria">Secundaria</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Grado:</label>
                            <select className="form-select" style={{ width: '100%' }} value={formData.grado} onChange={e => setFormData({ ...formData, grado: e.target.value })}>
                                {(nivelesStr[formData.nivel] || []).map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Detalles de la Evaluación */}
                <div style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', position: 'relative', background: 'var(--glass-bg)' }}>
                    <h4 style={{ position: 'absolute', top: '-15px', left: '15px', background: 'var(--color-surface)', padding: '4px 12px', color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 'bold', margin: 0, borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>Detalles de la Evaluación</h4>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tipo de Evaluación:</label>
                        <select className="form-select" style={{ width: '100%' }} value={formData.tipoEval} onChange={e => setFormData({ ...formData, tipoEval: e.target.value })}>
                            <option>Ficha Aplicada</option>
                            <option>Práctica Guiada</option>
                            <option>Práctica Calificada</option>
                            <option>Examen Mensual</option>
                            <option>Examen Bimestral</option>
                            <option>Examen Final</option>
                            <option>Evaluación Diagnóstica</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Temas a Evaluar:</label>
                        <textarea className="form-textarea" rows="3" placeholder="Escribe los temas separados por comas. Ej: Capacidades físicas, Voleibol básico, Reglas generales..." style={{ width: '100%', resize: 'vertical' }} value={formData.tema} onChange={e => setFormData({ ...formData, tema: e.target.value })}></textarea>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tipo de Preguntas:</label>
                            <select className="form-select" style={{ width: '100%' }} value={formData.tipoPreguntas} onChange={e => setFormData({ ...formData, tipoPreguntas: e.target.value })}>
                                <option>Alternativas</option>
                                <option>Preguntas para desarrollar</option>
                                <option>Verdadero/Falso</option>
                                <option>Mixto (Recomendado)</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Número de Preguntas:</label>
                            <input type="number" min="1" max="50" className="form-input" style={{ width: '100%' }} value={formData.numPreguntas} onChange={e => setFormData({ ...formData, numPreguntas: Number(e.target.value) })} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input type="checkbox" id="solucionario" style={{ width: '18px', height: '18px' }} checked={formData.incluirSolucionario} onChange={e => setFormData({ ...formData, incluirSolucionario: e.target.checked })} />
                        <label htmlFor="solucionario" style={{ fontSize: '0.95rem', color: '#334155', cursor: 'pointer', userSelect: 'none' }}>Incluir solucionario (hoja de respuestas)</label>
                    </div>
                </div>

                {/* Botones de Acción */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button className="btn btn-primary" style={{ flex: 1, padding: '1.25rem', background: '#2563eb', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 'bold' }} onClick={handleGenerate} disabled={loading}>
                        {loading ? 'Generando...' : 'Generar Evaluación'}
                    </button>
                    <button className="btn" style={{ flex: 1, padding: '1.25rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 'bold', cursor: examResult ? 'pointer' : 'not-allowed', opacity: examResult ? 1 : 0.6 }} onClick={downloadAsWord} disabled={!examResult}>
                        Descargar a Word
                    </button>
                </div>
            </motion.div>

            {renderResultPreview()}
        </div>
    );
};

export default ExamsPage;
