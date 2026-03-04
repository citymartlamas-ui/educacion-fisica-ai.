import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    ArrowLeft,
    Plus,
    Users,
    Clock,
    Dumbbell,
    ChevronRight,
    Trophy,
    Info,
    Video,
    ExternalLink
} from 'lucide-react';
import { db } from './firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

const GamesPage = ({ onNavigate, user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [selectedGame, setSelectedGame] = useState(null);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    const categories = ['Todos', 'Persecución', 'Cooperación', 'Equilibrio', 'Lanzamiento', 'Pre-deportivo'];

    // Mock data for initial view while Firestore loads or if it's empty
    const mockGames = [
        {
            id: '1',
            title: 'El Pañuelo Veloz',
            category: 'Persecución',
            ageRange: '6-12 años',
            duration: '15 min',
            materials: ['Pañuelo', 'Conos'],
            intensity: 'High',
            description: 'Un juego clásico de velocidad y reflejos donde dos equipos compiten por atrapar un pañuelo.',
            instructions: 'Se dividen en dos grupos numerados. Al decir un número, el jugador de cada equipo corre al centro...',
            objectives: 'Desarrollar la velocidad de reacción y la agilidad.',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        },
        {
            id: '2',
            title: 'Puente Humano',
            category: 'Cooperación',
            ageRange: '8-14 años',
            duration: '20 min',
            materials: ['Colchonetas'],
            intensity: 'Media',
            description: 'Los alumnos deben cruzar un "río" usando a sus compañeros como apoyo seguro.',
            instructions: 'En grupos de 5, deben avanzar de un punto A a un punto B sin tocar el suelo...',
            objectives: 'Fomentar el trabajo en equipo y la confianza.',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        },
        {
            id: '3',
            title: 'Circuito de Equilibrio Ninja',
            category: 'Equilibrio',
            ageRange: '5-10 años',
            duration: '25 min',
            materials: ['Bancos', 'Cuerdas', 'Aros'],
            intensity: 'Media',
            description: 'Un recorrido de obstáculos que desafía la estabilidad y el control postural.',
            instructions: 'Caminar sobre cuerdas en el suelo, saltar aros y mantener el equilibrio en bancos suizos...',
            objectives: 'Mejorar el equilibrio dinámico y estático.',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        }
    ];

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const q = query(collection(db, 'games'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const fetchedGames = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setGames(fetchedGames.length > 0 ? fetchedGames : mockGames);
            } catch (error) {
                console.error("Error fetching games:", error);
                setGames(mockGames);
            } finally {
                setLoading(false);
            }
        };
        fetchGames();
    }, []);

    const filteredGames = games.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            game.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || game.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <button className="btn btn-secondary" onClick={() => onNavigate('tools')} style={{ marginBottom: '2rem' }}>
                    <ArrowLeft size={16} /> Volver
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Banco de <span className="text-gradient">Juegos Motores</span></h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Explora más de 500 recursos para tus clases de Educación Física.</p>
                    </div>
                    {user?.role === 'admin' && (
                        <button className="btn btn-primary" onClick={() => onNavigate('admin-games')}>
                            <Plus size={18} /> Agregar Nuevo Juego
                        </button>
                    )}
                </div>
            </header>

            {/* Search & Filters */}
            <div className="glass" style={{ padding: '1.5rem', marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, objetivo o material..."
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Games Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>Cargando juegos maestros...</div>
                ) : filteredGames.length > 0 ? (
                    filteredGames.map((game, i) => (
                        <motion.div
                            key={game.id}
                            className="glass"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                            onClick={() => setSelectedGame(game)}
                            whileHover={{ scale: 1.02, borderColor: 'var(--color-primary)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-primary-glow)', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                                    {game.category}
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                    <Clock size={12} /> {game.duration}
                                </div>
                            </div>
                            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>{game.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', flex: 1 }}>{game.description}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                {game.materials.slice(0, 3).map((mat, idx) => (
                                    <span key={idx} style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                                        {mat}
                                    </span>
                                ))}
                                {game.materials.length > 3 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{game.materials.length - 3}</span>}
                            </div>
                            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 600 }}>{game.ageRange}</span>
                                <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                        <Info size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                        <h3>No encontramos juegos con esos criterios</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Intenta con otra categoría o palabra clave.</p>
                    </div>
                )}
            </div>

            {/* Game Detail Modal */}
            <AnimatePresence>
                {selectedGame && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
                        onClick={() => setSelectedGame(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: 'var(--color-surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '3rem' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                <div>
                                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-primary-glow)', padding: '0.3rem 0.8rem', borderRadius: '6px' }}>{selectedGame.category}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-secondary)', background: 'var(--color-secondary-glow)', padding: '0.3rem 0.8rem', borderRadius: '6px' }}>{selectedGame.intensity} INTENSIDAD</span>
                                    </div>
                                    <h2 style={{ fontSize: '2.5rem' }}>{selectedGame.title}</h2>
                                </div>
                                <button className="btn-icon" onClick={() => setSelectedGame(null)}>×</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                <div className="glass-static" style={{ padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                        <Users size={16} /> Edad Recomendada
                                    </div>
                                    <div style={{ fontWeight: 700 }}>{selectedGame.ageRange}</div>
                                </div>
                                <div className="glass-static" style={{ padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                        <Clock size={16} /> Duración
                                    </div>
                                    <div style={{ fontWeight: 700 }}>{selectedGame.duration}</div>
                                </div>
                                <div className="glass-static" style={{ padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                        <Dumbbell size={16} /> Materiales
                                    </div>
                                    <div style={{ fontWeight: 700 }}>{selectedGame.materials.join(', ')}</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                                    <Trophy size={18} /> OBJETIVOS PEDAGÓGICOS
                                </h4>
                                <p style={{ color: 'var(--text-primary)', lineHeight: '1.8' }}>{selectedGame.objectives}</p>
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                                    <Info size={18} /> INSTRUCCIONES
                                </h4>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{selectedGame.instructions}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-primary" style={{ flex: 1 }}>AGREGAR A MI SESIÓN</button>
                                {selectedGame.videoUrl && (
                                    <a
                                        href={selectedGame.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                        style={{ flex: 1, gap: '0.75rem' }}
                                    >
                                        <Video size={18} /> VER VIDEO DEMOSTRATIVO <ExternalLink size={14} />
                                    </a>
                                )}
                                <button className="btn btn-secondary">DESCARTAR</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GamesPage;
