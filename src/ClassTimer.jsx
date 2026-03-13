import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Timer, Play, Pause, RotateCcw, Volume2, 
    VolumeX, ArrowLeft, Plus, Trash2, 
    ChevronRight, Zap, BellRing, Settings2
} from 'lucide-react';

const ClassTimer = ({ onNavigate }) => {
    const [stations, setStations] = useState([
        { id: 1, name: 'Estación 1: Calentamiento', duration: 300 }, // 5 mins
        { id: 2, name: 'Estación 2: Coordinación', duration: 180 },  // 3 mins
        { id: 3, name: 'Estación 3: Fuerza', duration: 180 },       // 3 mins
    ]);
    
    const [currentStationIndex, setCurrentStationIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(stations[0].duration);
    const [isActive, setIsActive] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    
    const timerRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleStationComplete();
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft]);

    const handleStationComplete = () => {
        setIsActive(false);
        if (soundEnabled) {
            playWhistle();
        }
        
        if (currentStationIndex < stations.length - 1) {
            setTimeout(() => {
                const nextIndex = currentStationIndex + 1;
                setCurrentStationIndex(nextIndex);
                setTimeLeft(stations[nextIndex].duration);
            }, 2000);
        }
    };

    const playWhistle = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsActive(!isActive);
    
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(stations[currentStationIndex].duration);
    };

    const addStation = () => {
        const newId = stations.length > 0 ? Math.max(...stations.map(s => s.id)) + 1 : 1;
        setStations([...stations, { id: newId, name: `Nueva Estación ${newId}`, duration: 60 }]);
    };

    const removeStation = (id) => {
        const newStations = stations.filter(s => s.id !== id);
        setStations(newStations);
        if (currentStationIndex >= newStations.length) {
            setCurrentStationIndex(Math.max(0, newStations.length - 1));
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <button className="btn btn-secondary" onClick={() => onNavigate('tools')} style={{ marginBottom: '1.5rem' }}>
                    <ArrowLeft size={16} /> Volver
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                             <Timer className="text-secondary" /> Cronómetro <span className="text-gradient">Maestro Plus</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Automatiza los tiempos de tus circuitos y estaciones.</p>
                    </div>
                    <button className="btn-icon" onClick={() => setShowSettings(!showSettings)}>
                        <Settings2 size={20} />
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 992 ? '1fr 350px' : '1fr', gap: '2rem' }}>
                
                {/* Timer Display */}
                <div className="glass" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', textAlign: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <svg width="250" height="250" viewBox="0 0 250 250">
                            <circle cx="125" cy="125" r="115" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                            <motion.circle 
                                cx="125" cy="125" r="115" 
                                fill="none" 
                                stroke="var(--color-secondary)" 
                                strokeWidth="10" 
                                strokeLinecap="round"
                                strokeDasharray="722"
                                initial={{ strokeDashoffset: 0 }}
                                animate={{ strokeDashoffset: 722 - (722 * (timeLeft / (stations[currentStationIndex]?.duration || 1))) }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <div style={{ fontSize: '4.5rem', fontWeight: 900, fontFamily: 'Orbitron', lineHeight: 1 }}>
                                {formatTime(timeLeft)}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '0.5rem' }}>
                                RESTANTE
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stations[currentStationIndex]?.name || 'Fin del Circuito'}</h2>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                            ESTACIÓN {currentStationIndex + 1} DE {stations.length}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <button className="btn-icon" onClick={() => setSoundEnabled(!soundEnabled)} style={{ width: '50px', height: '50px' }}>
                            {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                        </button>
                        
                        <button 
                            className="btn" 
                            onClick={toggleTimer}
                            style={{ 
                                width: '80px', height: '80px', borderRadius: '50%', 
                                background: isActive ? 'var(--color-warning)' : 'var(--color-secondary)',
                                color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 0 30px ${isActive ? 'rgba(245, 158, 11, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`
                            }}
                        >
                            {isActive ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" style={{ marginLeft: '4px' }} />}
                        </button>

                        <button className="btn-icon" onClick={resetTimer} style={{ width: '50px', height: '50px' }}>
                            <RotateCcw size={24} />
                        </button>
                    </div>
                </div>

                {/* Stations List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem' }}>Secuencia de Clase</h3>
                        <button className="btn btn-secondary" onClick={addStation} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                            <Plus size={14} /> Añadir
                        </button>
                    </div>

                    <div style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
                        {stations.map((s, idx) => (
                            <motion.div 
                                key={s.id} 
                                className="glass-static"
                                style={{ 
                                    padding: '1rem', 
                                    borderLeft: `3px solid ${idx === currentStationIndex ? 'var(--color-secondary)' : 'transparent'}`,
                                    background: idx === currentStationIndex ? 'rgba(6, 182, 212, 0.1)' : 'var(--glass-bg)',
                                    opacity: idx < currentStationIndex ? 0.5 : 1
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <input 
                                            type="text" 
                                            value={s.name} 
                                            onChange={(e) => {
                                                const newStations = [...stations];
                                                newStations[idx].name = e.target.value;
                                                setStations(newStations);
                                            }}
                                            style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 600, width: '100%', outline: 'none' }}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <input 
                                                type="number" 
                                                value={Math.floor(s.duration / 60)} 
                                                onChange={(e) => {
                                                    const newStations = [...stations];
                                                    const mins = parseInt(e.target.value) || 0;
                                                    newStations[idx].duration = mins * 60 + (s.duration % 60);
                                                    setStations(newStations);
                                                    if (idx === currentStationIndex) setTimeLeft(newStations[idx].duration);
                                                }}
                                                style={{ width: '40px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', borderRadius: '4px' }}
                                            />
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>min</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-icon" onClick={() => removeStation(s.id)} style={{ color: 'var(--color-error)' }}>
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="btn-icon" onClick={() => {
                                            setCurrentStationIndex(idx);
                                            setTimeLeft(s.duration);
                                            setIsActive(false);
                                        }}>
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="glass" style={{ padding: '1.25rem', marginTop: 'auto', background: 'var(--color-primary-glow)', border: '1px solid var(--color-primary)' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Zap size={20} className="text-primary" />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Tip del Maestro</div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Usa el silbato automático para que puedas enfocarte en corregir la técnica de tus alumnos.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassTimer;
