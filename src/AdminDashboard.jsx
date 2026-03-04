import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
    Users,
    FileText,
    Settings,
    BarChart3,
    ShieldCheck,
    Search,
    Filter,
    MoreVertical,
    CheckCircle2,
    XCircle,
    UserPlus,
    Video,
    Trophy,
    Save
} from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [isAddingGame, setIsAddingGame] = useState(false);
    const [gameForm, setGameForm] = useState({
        title: '',
        category: 'Persecución',
        ageRange: '',
        duration: '',
        intensity: 'Media',
        description: '',
        instructions: '',
        objectives: '',
        materials: '',
        videoUrl: ''
    });
    const [loading, setLoading] = useState(false);

    const stats = [
        { label: 'Total Usuarios', value: '128', icon: <Users size={20} />, color: 'var(--color-primary)' },
        { label: 'Sesiones Generadas', value: '1,452', icon: <FileText size={20} />, color: 'var(--color-secondary)' },
        { label: 'Juegos en Banco', value: '500+', icon: <Trophy size={20} />, color: 'var(--color-accent)' },
        { label: 'Suscripciones Pro', value: '45', icon: <ShieldCheck size={20} />, color: '#10b981' },
    ];

    const handleAddGame = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const materialsArray = gameForm.materials.split(',').map(m => m.trim()).filter(m => m !== '');
            await addDoc(collection(db, 'games'), {
                ...gameForm,
                materials: materialsArray,
                createdAt: serverTimestamp()
            });
            alert('¡Juego agregado con éxito!');
            setIsAddingGame(false);
            setGameForm({
                title: '',
                category: 'Persecución',
                ageRange: '',
                duration: '',
                intensity: 'Media',
                description: '',
                instructions: '',
                objectives: '',
                materials: '',
                videoUrl: ''
            });
        } catch (error) {
            console.error("Error adding game:", error);
            alert('Error al agregar el juego');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div>
                    <h1>Panel de <span className="text-gradient">Administración</span></h1>
                    <p>Gestiona usuarios, contenidos y configuraciones del sistema.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => { setActiveTab('games'); setIsAddingGame(true); }}>
                        Gestionar Juegos
                    </button>
                    <button className="btn btn-primary">
                        <UserPlus size={18} /> Nuevo Usuario
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="admin-stats-grid">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        className="glass admin-stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <span className="stat-value">{stat.value}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="admin-content-layout">
                {/* Sidebar Navigation */}
                <aside className="admin-sidebar glass">
                    <nav>
                        <button
                            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('users'); setIsAddingGame(false); }}
                        >
                            <Users size={18} /> Usuarios
                        </button>
                        <button
                            className={`admin-nav-item ${activeTab === 'games' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('games'); setIsAddingGame(true); }}
                        >
                            <Trophy size={18} /> Banco de Juegos
                        </button>
                        <button
                            className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('analytics'); setIsAddingGame(false); }}
                        >
                            <BarChart3 size={18} /> Analíticas
                        </button>
                        <button
                            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('settings'); setIsAddingGame(false); }}
                        >
                            <Settings size={18} /> Configuración
                        </button>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="admin-main-content glass">
                    {isAddingGame ? (
                        <div className="game-management">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2>Agregar Nuevo <span className="text-gradient">Juego Motor</span></h2>
                                <button className="btn btn-secondary" onClick={() => setIsAddingGame(false)}>
                                    Cancelar
                                </button>
                            </div>

                            <form onSubmit={handleAddGame} className="admin-form">
                                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Título del Juego</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            required
                                            value={gameForm.title}
                                            onChange={e => setGameForm({ ...gameForm, title: e.target.value })}
                                            placeholder="Ej: El Pañuelo Veloz"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Categoría</label>
                                        <select
                                            className="form-select"
                                            value={gameForm.category}
                                            onChange={e => setGameForm({ ...gameForm, category: e.target.value })}
                                        >
                                            <option>Persecución</option>
                                            <option>Cooperación</option>
                                            <option>Equilibrio</option>
                                            <option>Lanzamiento</option>
                                            <option>Pre-deportivo</option>
                                            <option>Relajación</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Edad (Rango)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            required
                                            value={gameForm.ageRange}
                                            onChange={e => setGameForm({ ...gameForm, ageRange: e.target.value })}
                                            placeholder="Ej: 6-12 años"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Duración Aprox.</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            required
                                            value={gameForm.duration}
                                            onChange={e => setGameForm({ ...gameForm, duration: e.target.value })}
                                            placeholder="Ej: 15 min"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Intensidad</label>
                                        <select
                                            className="form-select"
                                            value={gameForm.intensity}
                                            onChange={e => setGameForm({ ...gameForm, intensity: e.target.value })}
                                        >
                                            <option>Baja</option>
                                            <option>Media</option>
                                            <option>Alta</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>URL del Video (YouTube)</label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={gameForm.videoUrl}
                                            onChange={e => setGameForm({ ...gameForm, videoUrl: e.target.value })}
                                            placeholder="https://youtube.com/..."
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                    <label>Materiales (separados por coma)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={gameForm.materials}
                                        onChange={e => setGameForm({ ...gameForm, materials: e.target.value })}
                                        placeholder="Balones, Conos, Cuerdas..."
                                    />
                                </div>

                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                    <label>Descripción Corta</label>
                                    <textarea
                                        className="form-textarea"
                                        required
                                        value={gameForm.description}
                                        onChange={e => setGameForm({ ...gameForm, description: e.target.value })}
                                        placeholder="Resumen rápido del juego..."
                                    />
                                </div>

                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                    <label>Objetivos Pedagógicos</label>
                                    <textarea
                                        className="form-textarea"
                                        required
                                        value={gameForm.objectives}
                                        onChange={e => setGameForm({ ...gameForm, objectives: e.target.value })}
                                        placeholder="¿Qué competencia desarrolla?"
                                    />
                                </div>

                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                    <label>Instrucciones / Desarrollo</label>
                                    <textarea
                                        className="form-textarea"
                                        required
                                        value={gameForm.instructions}
                                        onChange={e => setGameForm({ ...gameForm, instructions: e.target.value })}
                                        placeholder="Paso a paso para el docente..."
                                        style={{ minHeight: '150px' }}
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '2rem', width: '100%', gap: '1rem' }}>
                                    {loading ? 'Guardando...' : <><Save size={18} /> Guardar Juego en el Banco</>}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="user-management">
                            <div className="table-header">
                                <div className="search-bar">
                                    <Search size={16} />
                                    <input type="text" placeholder="Buscar usuarios..." />
                                </div>
                                <div className="table-actions">
                                    <button className="btn-icon-text">
                                        <Filter size={16} /> Filtrar
                                    </button>
                                </div>
                            </div>

                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Email</th>
                                            <th>Rol</th>
                                            <th>Estado</th>
                                            <th>Registro</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { name: 'Admin Principal', email: 'admin@edufisica.ai', role: 'admin', status: 'active', date: '2026-01-15' },
                                            { name: 'Victor Rivera', email: 'victor@example.com', role: 'docente', status: 'active', date: '2026-02-28' },
                                            { name: 'Juan Perez', email: 'juan@perez.com', role: 'docente', status: 'inactive', date: '2026-02-20' },
                                        ].map((user, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <div className="user-cell">
                                                        <div className="user-avatar">{user.name[0]}</div>
                                                        <span>{user.name}</span>
                                                    </div>
                                                </td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`role-badge ${user.role}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${user.status}`}>
                                                        {user.status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td>{user.date}</td>
                                                <td>
                                                    <button className="btn-icon">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <style jsx>{`
                .admin-container {
                    padding: 2rem 0;
                    color: var(--text-primary);
                }

                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2.5rem;
                }

                .admin-header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                }

                .admin-header p {
                    color: var(--text-secondary);
                }

                .admin-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                .admin-stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 1.5rem;
                    border-radius: var(--radius-lg);
                }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stat-info {
                    display: flex;
                    flex-direction: column;
                }

                .stat-label {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .admin-content-layout {
                    display: grid;
                    grid-template-columns: 240px 1fr;
                    gap: 1.5rem;
                    align-items: start;
                }

                .admin-sidebar {
                    padding: 1rem;
                    border-radius: var(--radius-lg);
                }

                .admin-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    width: 100%;
                    padding: 0.85rem 1rem;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                }

                .admin-nav-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-primary);
                }

                .admin-nav-item.active {
                    background: var(--color-primary-glow);
                    color: var(--color-primary);
                    font-weight: 600;
                }

                .admin-main-content {
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                }

                .table-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 0.6rem 1rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--glass-border);
                    width: 300px;
                }

                .search-bar input {
                    background: transparent;
                    border: none;
                    color: white;
                    outline: none;
                    width: 100%;
                }

                .admin-table-wrapper {
                    overflow-x: auto;
                }

                .admin-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }

                .admin-table th {
                    text-align: left;
                    padding: 1rem;
                    color: var(--text-secondary);
                    font-weight: 600;
                    border-bottom: 1px solid var(--glass-border);
                }

                .admin-table td {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .user-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--color-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.8rem;
                }

                .role-badge {
                    padding: 0.25rem 0.6rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .role-badge.admin {
                    background: rgba(0, 229, 255, 0.15);
                    color: var(--color-primary);
                }

                .role-badge.docente {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--text-secondary);
                }

                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.85rem;
                }

                .status-badge.active {
                    color: #10b981;
                }

                .status-badge.inactive {
                    color: #ef4444;
                }

                @media (max-width: 992px) {
                    .admin-content-layout {
                        grid-template-columns: 1fr;
                    }
                    
                    .admin-sidebar nav {
                        display: flex;
                        overflow-x: auto;
                        gap: 0.5rem;
                        padding-bottom: 0.5rem;
                    }

                    .admin-nav-item {
                        white-space: nowrap;
                        width: auto;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
