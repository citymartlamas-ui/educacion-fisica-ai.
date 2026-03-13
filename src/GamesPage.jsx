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
    ExternalLink,
    Save,
    Loader2,
    FileText
} from 'lucide-react';
import { db, storage } from './firebase';
import { collection, query, getDocs, orderBy, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const GamesPage = ({ onNavigate, user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [selectedGame, setSelectedGame] = useState(null);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [newResource, setNewResource] = useState({
        title: '',
        category: 'Coordinación',
        type: 'game', // 'game', 'document', 'video'
        description: '',
        videoUrl: '',
        materials: '',
        instructions: '',
        ageRange: 'Todas las edades',
        duration: 'Variable',
        file: null
    });

    const categories = [
        'Todos',
        'Coordinación',
        'Concentración',
        'Equilibrio',
        'Desplazamiento',
        'Motricidad Gruesa',
        'Motricidad Fina',
        'Lanzamientos',
        'Persecución',
        'Cooperación',
        'Pre-deportivo',
        'Esquema Corporal',
        'Ritmo y Espacio',
        'Fuerza y Resistencia',
        'Relajación'
    ];

    // Mock data for initial view while Firestore loads or if it's empty
    const mockGames = [
        {
            id: '1',
            title: 'El Pañuelo Veloz',
            category: 'Persecución',
            ageRange: '6-12 años',
            duration: '15 min',
            materials: ['Pañuelo', 'Conos'],
            intensity: 'ALTA',
            description: 'Un juego clásico de velocidad y reflejos donde dos equipos compiten por atrapar un pañuelo.',
            instructions: 'Se dividen en dos grupos numerados. Al decir un número, el jugador de cada equipo corre al centro...',
            objectives: 'Desarrollar la velocidad de reacción y la agilidad.',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        }
    ];

    const fetchGames = async () => {
        setLoading(true);
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

    useEffect(() => {
        fetchGames();
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewResource(prev => ({ ...prev, file }));
        }
    };

    const handleEditClick = (game) => {
        setEditingGame(game);
        setNewResource({
            title: game.title,
            category: game.category,
            type: game.type || 'game',
            description: game.description,
            videoUrl: game.videoUrl || '',
            materials: Array.isArray(game.materials) ? game.materials.join(', ') : (game.materials || ''),
            instructions: game.instructions || '',
            ageRange: game.ageRange || 'Todas las edades',
            duration: game.duration || 'Variable',
            file: null
        });
        setIsAdminModalOpen(true);
    };

    const handleSaveResource = async () => {
        if (!newResource.title) return alert("Por favor ingresa un título");

        setIsUploading(true);
        try {
            let fileUrl = editingGame?.fileUrl || '';
            let fileName = editingGame?.fileName || '';

            if (newResource.file) {
                const storageRef = ref(storage, `games/${Date.now()}_${newResource.file.name}`);
                const snapshot = await uploadBytes(storageRef, newResource.file);
                fileUrl = await getDownloadURL(snapshot.ref);
                fileName = newResource.file.name;
            }

            const materialsArray = typeof newResource.materials === 'string'
                ? newResource.materials.split(',').map(m => m.trim()).filter(m => m !== '')
                : newResource.materials;

            const gameData = {
                title: newResource.title,
                category: newResource.category,
                type: newResource.type,
                description: newResource.description,
                videoUrl: newResource.videoUrl,
                materials: materialsArray,
                instructions: newResource.instructions,
                ageRange: newResource.ageRange,
                duration: newResource.duration,
                fileUrl,
                fileName,
                updatedAt: serverTimestamp()
            };

            if (editingGame) {
                await updateDoc(doc(db, 'games', editingGame.id), gameData);
                alert("¡Recurso actualizado con éxito!");
            } else {
                await addDoc(collection(db, 'games'), {
                    ...gameData,
                    createdAt: serverTimestamp()
                });
                alert("¡Recurso guardado con éxito!");
            }

            setIsAdminModalOpen(false);
            setEditingGame(null);
            setNewResource({
                title: '',
                category: 'Coordinación',
                type: 'game',
                description: '',
                videoUrl: '',
                materials: '',
                instructions: '',
                ageRange: 'Todas las edades',
                duration: 'Variable',
                file: null
            });
            fetchGames();
        } catch (error) {
            console.error("Error saving resource:", error);
            alert("Error al guardar el recurso");
        } finally {
            setIsUploading(false);
        }
    };

    const filteredGames = games.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (game.description && game.description.toLowerCase().includes(searchTerm.toLowerCase()));
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
                        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '0.5rem' }}>Banco de <span className="text-gradient">Juegos Motores</span></h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Explora los mejores recursos para tus clases.</p>
                    </div>
                    {user?.role === 'admin' && (
                        <button className="btn btn-primary" onClick={() => { setEditingGame(null); setIsAdminModalOpen(true); }}>
                            <Plus size={18} /> Subir Nuevo
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
                        placeholder="Buscar por nombre o descripción..."
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', width: '100%' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Games Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 100%, 300px), 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                        <Loader2 className="spin" style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }} />
                        <p>Cargando recursos...</p>
                    </div>
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
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-primary-glow)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                        {game.category}
                                    </span>
                                    {game.fileUrl && (
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-secondary)', background: 'var(--color-secondary-glow)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                            DOC
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.7rem', alignItems: 'center' }}>
                                    <Clock size={12} /> {game.duration}
                                </div>
                            </div>
                            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>{game.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {game.description}
                            </p>
                            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 600 }}>{game.ageRange}</span>
                                <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                        <Info size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                        <h3>No se encontraron resultados</h3>
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
                        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                        onClick={() => setSelectedGame(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: 'var(--color-surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', maxWidth: '800px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: 'clamp(1.5rem, 5vw, 2.5rem)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                <div>
                                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-primary-glow)', padding: '0.3rem 0.8rem', borderRadius: '6px' }}>{selectedGame.category}</span>
                                        {selectedGame.intensity && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-secondary)', background: 'var(--color-secondary-glow)', padding: '0.3rem 0.8rem', borderRadius: '6px' }}>{selectedGame.intensity} INTENSIDAD</span>}
                                    </div>
                                    <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)' }}>{selectedGame.title}</h2>
                                </div>
                                <button className="btn-icon" onClick={() => setSelectedGame(null)}>×</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                <div className="glass-static" style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                        <Users size={14} /> Edades
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedGame.ageRange}</div>
                                </div>
                                <div className="glass-static" style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                        <Clock size={14} /> Tiempo
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedGame.duration}</div>
                                </div>
                                <div className="glass-static" style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                        <Dumbbell size={14} /> Materiales
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{Array.isArray(selectedGame.materials) ? selectedGame.materials.join(', ') : selectedGame.materials}</div>
                                </div>
                            </div>

                            {selectedGame.description && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Descripción</h4>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>{selectedGame.description}</p>
                                </div>
                            )}

                            {selectedGame.instructions && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Instrucciones / Desarrollo</h4>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>{selectedGame.instructions}</p>
                                </div>
                            )}

                            {selectedGame.fileUrl && (
                                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--color-primary-glow)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-primary)' }}>
                                    <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={18} /> ARCHIVO ADJUNTO
                                    </h4>
                                    <a href={selectedGame.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: 'fit-content' }}>
                                        DESCARGAR <ExternalLink size={14} style={{ marginLeft: '0.5rem' }} />
                                    </a>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '3rem' }}>
                                {user?.role === 'admin' && (
                                    <button
                                        className="btn"
                                        style={{ flex: 1, minWidth: '150px', background: 'var(--color-warning)', color: 'black' }}
                                        onClick={() => {
                                            const g = selectedGame;
                                            setSelectedGame(null);
                                            handleEditClick(g);
                                        }}
                                    >
                                        EDITAR RECURSO
                                    </button>
                                )}
                                {selectedGame.videoUrl && (
                                    <a
                                        href={selectedGame.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                        style={{ flex: 1, gap: '0.75rem', minWidth: '150px' }}
                                    >
                                        <Video size={18} /> VER VIDEO <ExternalLink size={14} />
                                    </a>
                                )}
                                <button className="btn btn-secondary" style={{ flex: 1, minWidth: '150px' }} onClick={() => setSelectedGame(null)}>CERRAR</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Admin Upload/Edit Modal */}
            <AnimatePresence>
                {isAdminModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            style={{ background: 'var(--color-surface)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', maxWidth: '650px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.5rem' }}>{editingGame ? 'Editar' : 'Añadir'} <span className="text-gradient">Recurso</span></h2>
                                <button className="btn-icon" onClick={() => { setIsAdminModalOpen(false); setEditingGame(null); }}>×</button>
                            </div>

                            <div style={{ display: 'grid', gap: '1.25rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Título</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Ej: Juego de velocidad"
                                        value={newResource.title}
                                        onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Categoría</label>
                                        <select
                                            className="form-select"
                                            value={newResource.category}
                                            onChange={e => setNewResource({ ...newResource, category: e.target.value })}
                                        >
                                            {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                                            <option value="Formatos CNEB">Formatos CNEB</option>
                                            <option value="Sesiones">Sesiones Completas</option>
                                            <option value="Documentos">Otros Documentos</option>
                                            <option value="Videos">Videos Demo</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Tipo</label>
                                        <select
                                            className="form-select"
                                            value={newResource.type}
                                            onChange={e => setNewResource({ ...newResource, type: e.target.value })}
                                        >
                                            <option value="game">Juego Individual</option>
                                            <option value="document">Documento (PDF/Word)</option>
                                            <option value="video">Video / Enlace</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Descripción Corta</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Resumen del recurso..."
                                        style={{ minHeight: '60px' }}
                                        value={newResource.description}
                                        onChange={e => setNewResource({ ...newResource, description: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Instrucciones Detalladas</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Paso a paso..."
                                        style={{ minHeight: '100px' }}
                                        value={newResource.instructions}
                                        onChange={e => setNewResource({ ...newResource, instructions: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Enlace Video/Web</label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            placeholder="https://..."
                                            value={newResource.videoUrl}
                                            onChange={e => setNewResource({ ...newResource, videoUrl: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Materiales (comas)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Balón, Conos..."
                                            value={newResource.materials}
                                            onChange={e => setNewResource({ ...newResource, materials: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Edades</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Primaria, 6-8 años..."
                                            value={newResource.ageRange}
                                            onChange={e => setNewResource({ ...newResource, ageRange: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Duración</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="15 min, Variable..."
                                            value={newResource.duration}
                                            onChange={e => setNewResource({ ...newResource, duration: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Archivo (Opcional {editingGame ? ' - Deja vacío para mantener actual' : ''})</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileUpload}
                                        style={{ fontSize: '0.8rem' }}
                                    />
                                    {newResource.file && <p style={{ fontSize: '0.7rem', color: 'var(--color-primary)' }}>{newResource.file.name}</p>}
                                </div>

                                <button
                                    className="btn btn-primary"
                                    style={{ marginTop: '1rem', height: '3rem' }}
                                    onClick={handleSaveResource}
                                    disabled={isUploading}
                                >
                                    {isUploading ? <><Loader2 size={18} className="spin" /> Procesando...</> : <><Save size={18} /> {editingGame ? 'Actualizar' : 'Guardar'} Recurso</>}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GamesPage;
