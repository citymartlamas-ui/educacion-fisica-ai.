import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, ClipboardCheck, Dumbbell, Users, Utensils } from 'lucide-react';
import { generateLessonPlan } from './gemini';

function Generator() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [formData, setFormData] = useState({
        grade: 'Primaria',
        topic: '',
        materials: '',
        duration: '45 min'
    });

    const handleGenerate = async () => {
        if (!formData.topic) return;
        setLoading(true);

        const prompt = `Eres un experto docente de Educación Física. Genera una sesión de aprendizaje detallada para el nivel de ${formData.grade}. 
    Tema principal: ${formData.topic}. 
    Materiales disponibles: ${formData.materials || 'Ninguno especificado'}. 
    Duración: ${formData.duration}.
    La sesión debe incluir: Inicio (calentamiento), Desarrollo (actividades principales con variantes) y Cierre (vuelta a la calma y reflexión). 
    Usa un lenguaje motivador y profesional.`;

        const response = await generateLessonPlan(prompt);
        setResult(response);
        setLoading(false);
    };

    return (
        <div className="min-h-screen container pt-10">
            <div className="grid lg:grid-cols-2 gap-10">

                {/* Form Side */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-8 h-fit"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-[#00f2ff]/10 rounded-xl text-[#00f2ff]">
                            <Sparkles size={24} />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Generador de Sesiones</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Grado / Nivel</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#00f2ff]/50 transition-all"
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                            >
                                <option>Primaria (Baja)</option>
                                <option>Primaria (Alta)</option>
                                <option>Secundaria</option>
                                <option>Inicial</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Tema de la Clase</label>
                            <input
                                type="text"
                                placeholder="Ej: Futbol, Coordinación Motriz, Salto Largo..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#00f2ff]/50 transition-all"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Materiales Disponibles (Opcional)</label>
                            <textarea
                                placeholder="Ej: 5 balones, 10 conos, una cuerda..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#00f2ff]/50 transition-all h-24 resize-none"
                                value={formData.materials}
                                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !formData.topic}
                            className="w-full bg-[#00f2ff] text-[#0a0f1e] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)] disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> GENERAR CLASE MAGISTRAL</>}
                        </button>
                    </div>
                </motion.div>

                {/* Result Side */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                >
                    <AnimatePresence mode="wait">
                        {!result && !loading ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="glass p-12 h-full flex flex-col items-center justify-center text-center border-dashed border-white/20"
                            >
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <Dumbbell size={40} className="text-white/20" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Tu sesión aparecerá aquí</h3>
                                <p className="text-slate-500 text-sm">Completa el formulario de la izquierda y deja que la IA haga el trabajo pesado por ti.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass p-8 h-full max-h-[80vh] overflow-y-auto custom-scrollbar"
                            >
                                <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#0a0f1e]/80 backdrop-blur-md p-2 rounded-lg">
                                    <span className="text-xs font-bold text-[#39ff14] border border-[#39ff14]/30 px-2 py-1 rounded">SESIÓN GENERADA</span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(result);
                                            alert('¡Copiado al portapapeles!');
                                        }}
                                        className="text-slate-400 hover:text-white flex items-center gap-2 text-sm"
                                    >
                                        <ClipboardCheck size={18} /> Copiar
                                    </button>
                                </div>

                                <div className="prose prose-invert max-w-none">
                                    {result.split('\n').map((line, i) => (
                                        <p key={i} className="mb-4 text-slate-300 leading-relaxed">
                                            {line}
                                        </p>
                                    ))}
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
