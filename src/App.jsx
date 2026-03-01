import React, { useState } from 'react'
import { Dumbbell, Sparkles, BookOpen, LayoutDashboard, ShieldCheck, ChevronRight, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Generator from './Generator'

function App() {
    const [showGenerator, setShowGenerator] = useState(false)

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto sticky top-0 bg-[#0a0f1e]/50 backdrop-blur-lg z-50">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowGenerator(false)}>
                    <Dumbbell className="text-[#00f2ff] w-8 h-8" />
                    <span className="brand font-bold text-xl tracking-tighter">EDUFISICA <span className="text-[#39ff14]">AI</span></span>
                </div>
                <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
                    <button onClick={() => setShowGenerator(true)} className="hover:text-white transition-colors">Generadores</button>
                    <a href="#" className="hover:text-white transition-colors">Recursos</a>
                    <a href="#" className="hover:text-white transition-colors">Comunidad</a>
                </div>
                <button className="glass px-6 py-2 text-sm font-semibold border-[#00f2ff] text-[#00f2ff] hover:bg-[#00f2ff] hover:text-[#0a0f1e] transition-all duration-300">
                    INICIAR SESIÓN
                </button>
            </nav>

            <AnimatePresence mode="wait">
                {!showGenerator ? (
                    <motion.main
                        key="home"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="container pt-20 pb-32 text-center relative overflow-hidden"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-6 text-xs font-bold text-[#39ff14] border-[#39ff14]/30">
                                <Sparkles size={14} /> POTENCIADO CON GEMINI AI
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                                LA NUEVA ERA DE LA <br />
                                <span className="title-gradient">EDUCACIÓN FÍSICA</span>
                            </h1>
                            <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-10">
                                Diseñada especialmente para docentes que recién comienzan. Genera planes anuales, sesiones y rúbricas en segundos, adaptadas a tu material disponible.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button
                                    onClick={() => setShowGenerator(true)}
                                    className="bg-[#00f2ff] text-[#0a0f1e] px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,242,255,0.4)]"
                                >
                                    EMPEZAR AHORA <ChevronRight size={20} />
                                </button>
                                <button className="glass px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">
                                    VER DEMO
                                </button>
                            </div>
                        </motion.div>

                        {/* Feature Cards Preview */}
                        <div className="grid md:grid-cols-3 gap-6 mt-32">
                            <FeatureCard
                                icon={<LayoutDashboard className="text-[#00f2ff]" />}
                                title="Semanario Inteligente"
                                desc="Tus sesiones listas en un clic, alineadas al currículo nacional."
                            />
                            <FeatureCard
                                icon={<ShieldCheck className="text-[#39ff14]" />}
                                title="Gestión de Materiales"
                                desc="Optimiza tus clases según los conos, balones y aros reales que tienes."
                            />
                            <FeatureCard
                                icon={<BookOpen className="text-[#7000ff]" />}
                                title="Banco de Recursos"
                                desc="Cientos de juegos motores y dinámicas organizadas por edades."
                            />
                        </div>
                    </motion.main>
                ) : (
                    <motion.div
                        key="generator"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="container py-6">
                            <button
                                onClick={() => setShowGenerator(false)}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
                            >
                                <ArrowLeft size={16} /> Volver al Inicio
                            </button>
                            <Generator />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background decoration elements */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00f2ff] opacity-5 blur-[150px] rounded-full -z-10" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#39ff14] opacity-5 blur-[150px] rounded-full -z-10" />
        </div>
    )
}

function FeatureCard({ icon, title, desc }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="glass p-8 text-left group hover:border-[#00f2ff]/50 transition-all"
        >
            <div className="mb-4 bg-white/5 w-12 h-12 flex items-center justify-center rounded-lg group-hover:bg-white/10 transition-all">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2 tracking-tight group-hover:text-[#00f2ff] transition-all">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </motion.div>
    )
}

export default App
