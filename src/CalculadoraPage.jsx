import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator,
    ArrowLeft,
    Activity,
    User,
    Dumbbell,
    Info,
    ChevronRight,
    Trophy,
    Scale,
    HeartPulse,
    Flame,
    Zap,
    TrendingUp,
    CheckCircle2,
    ShieldCheck,
    Stethoscope
} from 'lucide-react';

const CalculadoraPage = ({ onNavigate }) => {
    const [activeCalc, setActiveCalc] = useState('imc');

    const calculators = [
        { id: 'imc', title: 'IMC y Salud', icon: <Scale size={20} />, desc: 'Análisis de composición y rangos de salud.' },
        { id: 'ruffier', title: 'Test de Ruffier', icon: <ShieldCheck size={20} />, desc: 'Resistencia cardíaca y recuperación.' },
        { id: 'ice', title: 'Índice Cintura-Altura', icon: <Stethoscope size={20} />, desc: 'Mejor predictor de riesgo que el IMC.' },
        { id: 'tmb', title: 'Tasa Metabólica (TMB)', icon: <Flame size={20} />, desc: 'Calorías diarias y gasto energético.' },
        { id: 'cooper', title: 'Test de Cooper', icon: <Activity size={20} />, desc: 'Capacidad aeróbica (VO2 Máx) por edad.' },
        { id: 'karvonen', title: 'Zonas Cardíacas', icon: <HeartPulse size={20} />, desc: 'Frecuencia cardíaca de reserva.' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="container"
            style={{ padding: '2rem 1rem 6rem' }}
        >
            <button className="btn btn-secondary" onClick={() => onNavigate('tools')} style={{ marginBottom: '2rem' }}>
                <ArrowLeft size={16} /> Volver
            </button>

            <div className="section-header" style={{ textAlign: 'left', marginBottom: '3rem' }}>
                <div className="overline">Herramienta Biopedagógica</div>
                <h1>Laboratorio <span className="text-gradient">Antropométrico</span></h1>
                <p>Métricas de alto rendimiento y análisis de salud para Educación Física.</p>
            </div>

            <div style={{ gap: '2rem' }} className="calc-layout">
                {/* Selector */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {calculators.map((calc) => (
                        <button
                            key={calc.id}
                            className={`glass tool-card ${activeCalc === calc.id ? 'active' : ''}`}
                            onClick={() => setActiveCalc(calc.id)}
                            style={{
                                textAlign: 'left',
                                padding: '1.25rem',
                                border: activeCalc === calc.id ? '2px solid var(--color-primary)' : '1px solid var(--glass-border)',
                                background: activeCalc === calc.id ? 'var(--color-primary-glow)' : 'var(--glass-bg)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
                                <div style={{
                                    color: activeCalc === calc.id ? 'var(--color-primary)' : 'var(--text-secondary)',
                                    background: activeCalc === calc.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                    padding: '0.4rem',
                                    borderRadius: '8px'
                                }}>
                                    {calc.icon}
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: activeCalc === calc.id ? 'var(--color-primary)' : 'var(--text-primary)' }}>{calc.title}</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{calc.desc}</p>
                        </button>
                    ))}
                </aside>

                {/* Calculator Area */}
                <main className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--glass-border)' }}>
                    <AnimatePresence mode="wait">
                        {activeCalc === 'imc' && <IMCCalculator key="imc" />}
                        {activeCalc === 'ruffier' && <RuffierCalculator key="ruffier" />}
                        {activeCalc === 'ice' && <ICECalculator key="ice" />}
                        {activeCalc === 'tmb' && <TMBCalculator key="tmb" />}
                        {activeCalc === 'cooper' && <CooperCalculator key="cooper" />}
                        {activeCalc === 'karvonen' && <KarvonenCalculator key="karvonen" />}
                    </AnimatePresence>
                </main>
            </div>

            <style jsx>{`
                .calc-layout {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                }
                .tool-card:hover {
                    transform: translateX(5px);
                    border-color: var(--color-primary);
                }
                @media (max-width: 850px) {
                    .calc-layout {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </motion.div>
    );
};

// ================= IMCCalculator =================
const IMCCalculator = () => {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('m');
    const [result, setResult] = useState(null);

    const calculate = () => {
        if (!weight || !height || !age) return;
        const w = parseFloat(weight);
        const h_cm = parseFloat(height);
        const h_m = h_cm / 100;
        const imc = (w / (h_m * h_m)).toFixed(1);

        // Healthy ranges (More professional than a single "Ideal" point)
        const minHealthy = (18.5 * (h_m ** 2)).toFixed(1);
        const maxHealthy = (24.9 * (h_m ** 2)).toFixed(1);
        const athleteRangeMax = (27.5 * (h_m ** 2)).toFixed(1); // Higher for athletes with muscle

        let category = '';
        let color = '';
        let advice = '';

        if (imc < 18.5) {
            category = 'Bajo peso'; color = '#38bdf8';
            advice = 'Se recomienda aumentar la ingesta calórica y fortalecer la masa muscular.';
        } else if (imc < 25) {
            category = 'Normal'; color = '#39ff14';
            advice = 'Excelente. Te encuentras en un rango saludable basándote en estándares médicos.';
        } else if (imc < 30) {
            category = 'Sobrepeso'; color = '#fbbf24';
            advice = 'Nota: Si eres deportista, este resultado puede deberse a la masa muscular y no a tejido graso.';
        } else {
            category = 'Obesidad'; color = '#ef4444';
            advice = 'Se recomienda supervisión médica y ajustes en la actividad física y dieta.';
        }

        setResult({ score: imc, category, color, minHealthy, maxHealthy, athleteRangeMax, advice });
    };

    return (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Scale className="text-primary" /> Análisis de Masa Corporal
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="form-group">
                    <label className="form-label">Género</label>
                    <select className="form-select" value={gender} onChange={e => setGender(e.target.value)}>
                        <option value="m">Masculino</option>
                        <option value="f">Femenino</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Edad</label>
                    <input type="number" className="form-input" value={age} onChange={e => setAge(e.target.value)} placeholder="Años" />
                </div>
                <div className="form-group">
                    <label className="form-label">Peso (kg)</label>
                    <input type="number" className="form-input" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Ej: 70" />
                </div>
                <div className="form-group">
                    <label className="form-label">Altura (cm)</label>
                    <input type="number" className="form-input" value={height} onChange={e => setHeight(e.target.value)} placeholder="Ej: 175" />
                </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={calculate}>CALCULAR RANGOS DE SALUD</button>

            {result && (
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ marginTop: '2.5rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: ' var(--radius-xl)', border: `1px solid ${result.color}40`, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Tu Índice IMC</div>
                        <div style={{ fontSize: '4rem', fontWeight: 950, color: result.color, lineHeight: 1 }}>{result.score}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.5rem', color: result.color }}>{result.category}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                        <div className="glass" style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rango Saludable</div>
                            <div style={{ fontWeight: 700 }}>{result.minHealthy} - {result.maxHealthy} kg</div>
                        </div>
                        <div className="glass" style={{ padding: '1rem', textAlign: 'center', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rango Deportista</div>
                            <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Hasta {result.athleteRangeMax} kg</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', background: 'rgba(56, 189, 248, 0.05)', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid var(--color-primary)', display: 'flex', gap: '1rem' }}>
                        <Info size={18} className="text-primary" style={{ flexShrink: 0 }} />
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <strong>Análisis Profesional:</strong> {result.advice} <br />
                            <span style={{ fontSize: '0.8rem', fontStyle: 'italic', display: 'block', marginTop: '0.5rem' }}>
                                El IMC es solo referencial. Para una evaluación deportiva exacta se debe medir el % de grasa y masa muscular mediante plicometría.
                            </span>
                        </p>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

// ================= RuffierCalculator (NEW) =================
const RuffierCalculator = () => {
    const [p0, setP0] = useState(''); // REPOSO
    const [p1, setP1] = useState(''); // POST-ESFUERZO
    const [p2, setP2] = useState(''); // RECUPERACIÓN
    const [result, setResult] = useState(null);

    const calculate = () => {
        if (!p0 || !p1 || !p2) return;
        const indice = (parseInt(p0) + parseInt(p1) + parseInt(p2) - 200) / 10;
        let rating = '';
        let color = '';

        if (indice === 0) { rating = "Corazón de Atleta / Excelente"; color = "#39ff14"; }
        else if (indice <= 5) { rating = "Bueno / Muy apto"; color = "#38bdf8"; }
        else if (indice <= 10) { rating = "Medio / Aceptable"; color = "#fbbf24"; }
        else if (indice <= 15) { rating = "Insuficiente / Flojo"; color = "#f97316"; }
        else { rating = "Pobre / Consultar Médico"; color = "#ef4444"; }

        setResult({ score: indice.toFixed(1), rating, color });
    };

    return (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck className="text-secondary" /> Índice de Ruffier-Dickson
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                Mide la resistencia aeróbica de corta duración y la capacidad de recuperación cardíaca.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>P0: Reposo (PPM)</label>
                    <input type="number" className="form-input" value={p0} onChange={e => setP0(e.target.value)} placeholder="Ej: 65" />
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>P1: Esfuerzo (PPM)</label>
                    <input type="number" className="form-input" value={p1} onChange={e => setP1(e.target.value)} placeholder="Ej: 110" />
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>P2: Recuperación (PPM)</label>
                    <input type="number" className="form-input" value={p2} onChange={e => setP2(e.target.value)} placeholder="Ej: 75" />
                </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Protocolo:</strong> Realizar 30 sentadillas en 45 segundos. <br />
                P0: Pulso antes. P1: Pulso al terminar. P2: Pulso 1 min después.
            </div>

            <button className="btn btn-primary" style={{ width: '100%', background: 'var(--color-secondary)', color: 'black' }} onClick={calculate}>CALCULAR ÍNDICE</button>

            {result && (
                <div style={{ marginTop: '2.5rem', padding: '2rem', background: 'var(--color-secondary-glow)', borderRadius: '20px', border: `2px solid var(--color-secondary)`, textAlign: 'center' }}>
                    <div style={{ color: 'black', opacity: 0.6, fontSize: '0.8rem', fontWeight: 600 }}>RESULTADO DEL TEST</div>
                    <div style={{ fontSize: '4rem', fontWeight: 950, color: 'black', lineHeight: 1 }}>{result.score}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'black', marginTop: '0.5rem' }}>{result.rating}</div>
                </div>
            )}
        </motion.div>
    );
};

// ================= ICECalculator (Waist-to-Height) =================
const ICECalculator = () => {
    const [waist, setWaist] = useState('');
    const [height, setHeight] = useState('');
    const [result, setResult] = useState(null);

    const calculate = () => {
        if (!waist || !height) return;
        const ratio = parseFloat(waist) / parseFloat(height);
        let category = '';
        let color = '';

        if (ratio < 0.43) { category = 'Delgado / Atlético'; color = '#38bdf8'; }
        else if (ratio <= 0.52) { category = 'Sano'; color = '#39ff14'; }
        else if (ratio <= 0.58) { category = 'Sobrepeso / Riesgo'; color = '#fbbf24'; }
        else { category = 'Obesidad / Riesgo Alto'; color = '#ef4444'; }

        setResult({ ratio: ratio.toFixed(3), category, color });
    };

    return (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Stethoscope className="text-primary" /> Índice Cintura-Estatura (ICE)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                Considerado por la ciencia moderna como un predictor de salud cardiovascular más exacto que el IMC.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="form-group">
                    <label className="form-label">Circunferencia de Cintura (cm)</label>
                    <input type="number" className="form-input" value={waist} onChange={e => setWaist(e.target.value)} placeholder="Ej: 80" />
                </div>
                <div className="form-group">
                    <label className="form-label">Estatura Total (cm)</label>
                    <input type="number" className="form-input" value={height} onChange={e => setHeight(e.target.value)} placeholder="Ej: 175" />
                </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={calculate}>ANALIZAR RIESGO METABÓLICO</button>

            {result && (
                <div style={{ marginTop: '2.5rem', padding: '2.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: `1px solid ${result.color}40`, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ratio ICE</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 950, color: result.color, lineHeight: 1 }}>{result.ratio}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: result.color, marginTop: '0.5rem' }}>{result.category}</div>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <p><strong>Clave:</strong> Mantener el ratio por debajo de <strong>0.500</strong> se asocia con una mayor longevidad y menor riesgo de diabetes.</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// ================= TMBCalculator =================
const TMBCalculator = () => {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('m');
    const [activity, setActivity] = useState('1.2');
    const [result, setResult] = useState(null);

    const calculate = () => {
        if (!weight || !height || !age) return;
        const w = parseFloat(weight);
        const h = parseFloat(height);
        const a = parseInt(age);
        const factor = parseFloat(activity);

        let tmb = gender === 'm'
            ? 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a)
            : 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);

        setResult({
            tmb: Math.round(tmb),
            maintenance: Math.round(tmb * factor),
            deficit: Math.round(tmb * factor * 0.8),
            surplus: Math.round(tmb * factor * 1.1)
        });
    };

    return (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Flame className="text-accent" /> Gasto Energético (TMB)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="form-group"><label className="form-label">Género</label><select className="form-select" value={gender} onChange={e => setGender(e.target.value)}><option value="m">Masculino</option><option value="f">Femenino</option></select></div>
                <div className="form-group"><label className="form-label">Edad</label><input type="number" className="form-input" value={age} onChange={e => setAge(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Peso (kg)</label><input type="number" className="form-input" value={weight} onChange={e => setWeight(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Altura (cm)</label><input type="number" className="form-input" value={height} onChange={e => setHeight(e.target.value)} /></div>
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}><label className="form-label">Nivel de Actividad</label><select className="form-select" value={activity} onChange={e => setActivity(e.target.value)}><option value="1.2">Sedentario</option><option value="1.375">Ligero</option><option value="1.55">Moderado</option><option value="1.725">Activo</option><option value="1.9">Muy Activo</option></select></div>
            <button className="btn btn-primary" style={{ width: '100%', background: 'var(--color-accent)' }} onClick={calculate}>CALCULAR CALORÍAS</button>
            {result && (
                <div style={{ marginTop: '2.5rem', display: 'grid', gap: '1rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mantenimiento diario</div>
                        <div style={{ fontSize: '3rem', fontWeight: 950, color: 'var(--color-primary)' }}>{result.maintenance} <span style={{ fontSize: '0.9rem' }}>kcal</span></div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// ================= CooperCalculator =================
const CooperCalculator = () => {
    const [distance, setDistance] = useState('');
    const [result, setResult] = useState(null);

    const calculate = () => {
        if (!distance) return;
        const vo2 = (parseFloat(distance) - 504.9) / 44.73;
        setResult({ vo2: vo2.toFixed(2) });
    };

    return (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity className="text-secondary" /> Test de Cooper (VO2 Máx)
            </h2>
            <div className="form-group" style={{ marginBottom: '2rem' }}><label className="form-label">Distancia en 12 minutos (metros)</label><input type="number" className="form-input" value={distance} onChange={e => setDistance(e.target.value)} placeholder="Ej: 2400" /></div>
            <button className="btn btn-primary" style={{ width: '100%', background: 'var(--color-secondary)', color: 'black' }} onClick={calculate}>ESTIMAR RENDIMIENTO</button>
            {result && (
                <div style={{ marginTop: '2.5rem', padding: '2rem', background: 'var(--color-secondary-glow)', borderRadius: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: 950, color: 'black' }}>{result.vo2}</div>
                    <div style={{ color: 'black', fontWeight: 600 }}>ml / kg / min</div>
                </div>
            )}
        </motion.div>
    );
};

// ================= KarvonenCalculator =================
const KarvonenCalculator = () => {
    const [age, setAge] = useState('');
    const [fcr, setFcr] = useState('');
    const [result, setResult] = useState(null);

    const calculate = () => {
        if (!age || !fcr) return;
        const fcm = 220 - parseInt(age);
        const fcreseve = fcm - parseInt(fcr);
        const zones = [{ pct: '50-60%', val: Math.round(fcreseve * 0.5 + parseInt(fcr)) + '-' + Math.round(fcreseve * 0.6 + parseInt(fcr)) }, { pct: '70-80%', val: Math.round(fcreseve * 0.7 + parseInt(fcr)) + '-' + Math.round(fcreseve * 0.8 + parseInt(fcr)) }, { pct: '90-100%', val: Math.round(fcreseve * 0.9 + parseInt(fcr)) + '-' + fcm }];
        setResult({ zones });
    };

    return (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Zonas Cardíacas (Karvonen)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group"><label className="form-label">Edad</label><input type="number" className="form-input" value={age} onChange={e => setAge(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Pulsaciones Reposo</label><input type="number" className="form-input" value={fcr} onChange={e => setFcr(e.target.value)} /></div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', background: 'var(--color-secondary)', color: 'black' }} onClick={calculate}>CALCULAR ZONAS</button>
            {result && (
                <div style={{ marginTop: '1.5rem' }}>{result.zones.map((z, i) => <div key={i} style={{ padding: '0.8rem', background: 'var(--glass-bg)', marginBottom: '0.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}><span>Zona {z.pct}</span><span style={{ fontWeight: 800 }}>{z.val} PPM</span></div>)}</div>
            )}
        </motion.div>
    );
};

export default CalculadoraPage;
