import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

console.log("Gemini API Key loaded:", apiKey ? "Yes (" + apiKey.substring(0, 10) + "...)" : "NO - MISSING!");

let genAI = null;
let model = null;

try {
    if (apiKey) {
        genAI = new GoogleGenerativeAI(apiKey);
        // Usamos gemini-2.5-flash que es el estándar actual según tu lista de modelos
        model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });
        console.log("Gemini Model Initialized: gemini-2.5-flash (Latest)");
    }
} catch (err) {
    console.error("Gemini Initialization Failed:", err);
}

export { model };

export const generateLessonPlan = async (prompt) => {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("GEMINI ERROR DETAILS:", error.message);
        console.error("FULL ERROR:", JSON.stringify(error, null, 2));
        return "Error: " + error.message;
    }
};

// Capacidades oficiales del CNEB - Educación Física (NO deben modificarse)
const CNEB_CAPACIDADES = {
    "Se desenvuelve de manera autónoma a través de su motricidad": [
        "Comprende su cuerpo",
        "Se expresa corporalmente"
    ],
    "Asume una vida saludable": [
        "Comprende las relaciones entre la actividad física, alimentación, postura e higiene personal y del ambiente, y la salud",
        "Incorpora prácticas que mejoran su calidad de vida"
    ],
    "Interactúa a través de sus habilidades sociomotrices": [
        "Se relaciona utilizando sus habilidades sociomotrices",
        "Crea y aplica estrategias y tácticas de juego"
    ]
};

// Estándares de Aprendizaje oficiales del CNEB - Educación Física
// Fuente: Currículo Nacional de la Educación Básica (CNEB) - Texto copiado textualmente
// Mapeo: Nivel 1=Ciclo I | Nivel 2=Ciclo II | Nivel 3=Ciclo III | Nivel 4=Ciclo IV
//        Nivel 5=Ciclo V | Nivel 6=Ciclo VI | Nivel 7=Ciclo VII
const CNEB_ESTANDARES = {

    // CICLO I: Inicial 3 y 4 años
    "Ciclo I": {
        "Se desenvuelve de manera autónoma a través de su motricidad":
            "Se desenvuelve de manera autónoma a través de su motricidad cuando explora y descubre desde sus posibilidades de movimiento las partes de su cuerpo y su imagen corporal. Realiza acciones motrices básicas en las que coordina movimientos para desplazarse y manipular objetos. Expresa corporalmente a través del gesto, el tono, las posturas y movimientos sus sensaciones y emociones en situaciones cotidianas.",
        "Asume una vida saludable":
            "Este nivel tiene principalmente como base el nivel 1 de la competencia \"Se desenvuelve de manera autónoma a través de su motricidad\".",
        "Interactúa a través de sus habilidades sociomotrices":
            "Este nivel tiene principalmente como base el nivel 1 de la competencia \"Se desenvuelve de manera autónoma a través de su motricidad\"."
    },

    // CICLO II: Inicial 5 años
    "Ciclo II": {
        "Se desenvuelve de manera autónoma a través de su motricidad":
            "Se desenvuelve de manera autónoma a través de su motricidad cuando explora y descubre su lado dominante y sus posibilidades de movimiento por propia iniciativa en situaciones cotidianas. Realiza acciones motrices básicas en las que coordina movimientos para desplazarse con seguridad y utiliza objetos con precisión, orientándose y regulando sus acciones en relación a estos, a las personas, el espacio y el tiempo. Expresa corporalmente sus sensaciones, emociones y sentimientos a través del tono, gesto, posturas, ritmo y movimiento en situaciones de juego.",
        "Asume una vida saludable":
            "Este nivel tiene principalmente como base el nivel 2 de la competencia \"Se desenvuelve de manera autónoma a través de su motricidad\".",
        "Interactúa a través de sus habilidades sociomotrices":
            "Este nivel tiene principalmente como base el nivel 2 de la competencia \"Se desenvuelve de manera autónoma a través de su motricidad\"."
    },

    // CICLO III: 1° y 2° Primaria
    "Ciclo III": {
        "Se desenvuelve de manera autónoma a través de su motricidad":
            "Se desenvuelve de manera autónoma a través de su motricidad cuando comprende cómo usar su cuerpo en las diferentes acciones que realiza utilizando su lado dominante y realiza movimientos coordinados que le ayudan a sentirse seguro en la práctica de actividades físicas. Se orienta espacialmente en relación a sí mismo y a otros puntos de referencia. Se expresa corporalmente con sus pares utilizando el ritmo, gestos y movimientos como recursos para comunicar.",
        "Asume una vida saludable":
            "Asume una vida saludable cuando diferencia los alimentos saludables de su dieta personal y familiar, los momentos adecuados para ingerirlos y las posturas que lo ayudan al buen desempeño en la práctica de actividades físicas, recreativas y de la vida cotidiana, reconociendo la importancia del autocuidado. Participa regularmente en la práctica de actividades lúdicas identificando su ritmo cardíaco, respiración y sudoración; utiliza prácticas de activación corporal y psicológica antes de la actividad lúdica.",
        "Interactúa a través de sus habilidades sociomotrices":
            "Interactúa a través de sus habilidades sociomotrices al aceptar al otro como compañero de juego y busca el consenso sobre la manera de jugar para lograr el bienestar común y muestra una actitud de respeto evitando juegos violentos y humillantes; expresa su posición ante un conflicto con intención de resolverlo y escucha la posición de sus compañeros en los diferentes tipos de juegos. Resuelve situaciones motrices a través de estrategias colectivas y participa en la construcción de reglas de juego adaptadas a la situación y al entorno, para lograr un objetivo común en la práctica de actividades lúdicas."
    },

    // CICLO IV: 3° y 4° Primaria
    "Ciclo IV": {
        "Se desenvuelve de manera autónoma a través de su motricidad":
            "Se desenvuelve de manera autónoma a través de su motricidad cuando comprende cómo usar su cuerpo explorando la alternancia de sus lados corporales de acuerdo a su utilidad y ajustando la posición del cuerpo en el espacio y en el tiempo en diferentes etapas de las acciones motrices, con una actitud positiva y una voluntad de experimentar situaciones diversas. Experimenta nuevas posibilidades expresivas de su cuerpo y las utiliza para relacionarse y comunicar ideas, emociones, sentimientos, pensamientos.",
        "Asume una vida saludable":
            "Asume una vida saludable cuando diferencia los alimentos de su dieta personal, familiar y de su región que son saludables de los que no lo son. Previene riesgos relacionados con la postura e higiene conociendo aquellas que favorecen y no favorecen su salud e identifica su fuerza, resistencia y velocidad en la práctica de actividades lúdicas. Adapta su esfuerzo en la práctica de actividad física de acuerdo a las características de la actividad y a sus posibilidades, aplicando conocimientos relacionados con el ritmo cardíaco, la respiración y la sudoración. Realiza prácticas de activación corporal y psicológica, e incorpora el autocuidado relacionado con los ritmos de actividad y descanso para mejorar el funcionamiento de su organismo.",
        "Interactúa a través de sus habilidades sociomotrices":
            "Interactúa a través de sus habilidades sociomotrices al tomar acuerdos sobre la manera de jugar y los posibles cambios o conflictos que se den y propone adaptaciones o modificaciones para favorecer la inclusión de compañeros en actividades lúdicas, aceptando al oponente como compañero de juego. Adapta la estrategia de juego anticipando las intenciones de sus compañeros y oponentes para cumplir con los objetivos planteados. Propone reglas y las modifica de acuerdo a las necesidades del contexto y los intereses del grupo en la práctica de actividades físicas."
    },

    // CICLO V: 5° y 6° Primaria
    "Ciclo V": {
        "Se desenvuelve de manera autónoma a través de su motricidad":
            "Se desenvuelve de manera autónoma a través de su motricidad cuando acepta sus posibilidades y limitaciones según su desarrollo e imagen corporal. Realiza secuencias de movimientos coordinados aplicando la alternancia de sus lados corporales de acuerdo a su utilidad. Produce con sus pares secuencias de movimientos corporales, expresivos o rítmicos en relación a una intención.",
        "Asume una vida saludable":
            "Asume una vida saludable cuando utiliza instrumentos que miden la aptitud física e estado nutricional e interpreta la información de los resultados obtenidos para mejorar su calidad de vida. Replantea sus hábitos saludables, higiénicos y alimenticios tomando en cuenta los cambios físicos propios de la edad, evita la realización de ejercicios y posturas contraindicadas para la salud en la práctica de actividad física. Incorpora prácticas saludables para su organismo consumiendo alimentos adecuados a las características personales y evitando el consumo de drogas. Propone ejercicios de activación y relajación antes, durante y después de la práctica y participa en actividad física de distinta intensidad regulando su esfuerzo.",
        "Interactúa a través de sus habilidades sociomotrices":
            "Interactúa a través de sus habilidades sociomotrices proactivamente con un sentido de cooperación teniendo en cuenta las adaptaciones o modificaciones propuestas por el grupo en diferentes actividades físicas. Hace uso de estrategias de cooperación y oposición seleccionando los diferentes elementos técnicos y tácticos que se pueden dar en la práctica de actividades lúdicas y predeportivas, para resolver la situación de juego que le dé un mejor resultado y que responda a las variaciones que se presentan en el entorno."
    },

    // CICLO VI: 1° y 2° Secundaria
    "Ciclo VI": {
        "Se desenvuelve de manera autónoma a través de su motricidad":
            "Se desenvuelve de manera autónoma a través de su motricidad cuando relaciona cómo su imagen corporal y la aceptación de los otros influyen en el concepto de sí mismo. Realiza habilidades motrices específicas, regulando su tono, postura, equilibrio y tomando como referencia la trayectoria de objetos, los otros y sus propios desplazamientos. Produce secuencias de movimientos y gestos corporales para manifestar sus emociones con base en el ritmo y la música y utilizando diferentes materiales.",
        "Asume una vida saludable":
            "Asume una vida saludable cuando comprende los beneficios que la práctica de actividad física produce sobre su salud, para mejorar su calidad de vida. Conoce su estado nutricional e identifica los beneficios nutritivos y el origen de los alimentos, promueve el consumo de alimentos de su región, analiza la proporción adecuada de ingesta para mejorar su rendimiento físico y mental. Analiza los hábitos perjudiciales para su organismo. Realiza prácticas de higiene personal y del ambiente. Adopta posturas adecuadas para evitar lesiones y accidentes en la práctica de actividad física y en la vida cotidiana. Realiza prácticas que ayuden a mejorar sus capacidades físicas con las que regula su esfuerzo controlando su frecuencia cardíaca y respiratoria, al participar en sesiones de actividad física de diferente intensidad.",
        "Interactúa a través de sus habilidades sociomotrices":
            "Interactúa a través de sus habilidades sociomotrices con autonomía en situaciones que no le son favorables y asume con una actitud de liderazgo los desafíos propios de la práctica de actividades físicas, experimentando el placer y disfrute que ellas representan. Formula y aplica estrategias para solucionar problemas individuales y colectivos, incorporando elementos técnicos y tácticos pertinentes y adecuando a los cambios que se dan en la práctica. Analiza los posibles aciertos y dificultades ocurridos durante la práctica para mejorar la estrategia de juego."
    },

    // CICLO VII: 3°, 4° y 5° Secundaria
    "Ciclo VII": {
        "Se desenvuelve de manera autónoma a través de su motricidad":
            "Se desenvuelve de manera autónoma a través de su motricidad cuando toma conciencia de cómo su imagen corporal contribuye a la construcción de su identidad y autoestima. Organiza su cuerpo en relación a las acciones y habilidades motrices según la práctica de actividad física que quiere realizar. Produce con sus compañeros diálogos corporales que combinan movimientos en los que expresan emociones, sentimientos y pensamientos sobre temas de su interés en un determinado contexto.",
        "Asume una vida saludable":
            "Asume una vida saludable cuando evalúa sus necesidades calóricas y toma en cuenta su gasto calórico diario, los alimentos que consume, su origen e inocuidad, y las características de la actividad física que practica. Elabora un programa de actividad física y alimentación saludable, interpretando los resultados de las pruebas de aptitud física, entre otras, para mantener y/o mejorar su bienestar. Participa regularmente en sesiones de actividad física de diferente intensidad y promueve campañas donde se promocione la salud integrada al bienestar colectivo.",
        "Interactúa a través de sus habilidades sociomotrices":
            "Interactúa a través de sus habilidades sociomotrices integrando a todas las personas de la comunidad educativa en eventos lúdico-deportivos y promoviendo la práctica de actividad física basada en el disfrute, la tolerancia, equidad de género, inclusión y respeto, asumiendo su responsabilidad durante todo el proceso. Propone sistemas tácticos de juego en la resolución de problemas y los adecúa según las necesidades del entorno, asumiendo y adjudicando roles y funciones bajo un sistema de juego que vincula las habilidades y capacidades de cada uno de los integrantes del equipo en la práctica de diferentes actividades físicas."
    }
};

// Función para determinar el ciclo a partir del grado y nivel
const getCiclo = (grado, nivel) => {
    const g = (grado || '').toLowerCase();
    const n = (nivel || '').toLowerCase();

    // Inicial
    if (n.includes('inicial') || n.includes('preescolar')) {
        if (g.includes('3') || g.includes('4')) return 'Ciclo I';
        return 'Ciclo II'; // 5 años
    }

    // Primaria
    if (n.includes('primaria')) {
        if (g.includes('1') || g.includes('primer')) return 'Ciclo III';
        if (g.includes('2') || g.includes('segundo')) return 'Ciclo III';
        if (g.includes('3') || g.includes('tercer')) return 'Ciclo IV';
        if (g.includes('4') || g.includes('cuarto')) return 'Ciclo IV';
        if (g.includes('5') || g.includes('quinto')) return 'Ciclo V';
        if (g.includes('6') || g.includes('sexto')) return 'Ciclo V';
    }

    // Secundaria
    if (n.includes('secundaria')) {
        if (g.includes('1') || g.includes('primer')) return 'Ciclo VI';
        if (g.includes('2') || g.includes('segundo')) return 'Ciclo VI';
        if (g.includes('3') || g.includes('tercer')) return 'Ciclo VII';
        if (g.includes('4') || g.includes('cuarto')) return 'Ciclo VII';
        if (g.includes('5') || g.includes('quinto')) return 'Ciclo VII';
    }

    // Fallback: detectar por texto del grado
    if (g.includes('3 años') || g.includes('4 años')) return 'Ciclo I';
    if (g.includes('5 años')) return 'Ciclo II';
    if (g.match(/1[°°er]/) || g.match(/2[°°do]/)) return 'Ciclo III';
    if (g.match(/3[°°er]/) || g.match(/4[°°to]/)) return 'Ciclo IV';
    if (g.match(/5[°°to]/) || g.match(/6[°°to]/)) return 'Ciclo V';

    return 'Ciclo VI'; // default secundaria
};

export const generateStructuredSession = async (formData) => {
    const ciclo = getCiclo(formData.grado, formData.nivel);
    const estandaresCiclo = CNEB_ESTANDARES[ciclo] || CNEB_ESTANDARES['Ciclo VI'];

    // Construir el bloque de competencias con capacidades y estándares oficiales CNEB
    const competenciasSeleccionadas = formData.sugerirCompetencia
        ? Object.entries(CNEB_CAPACIDADES)
            .map(([comp, caps]) => {
                const estandar = estandaresCiclo[comp] || 'Adaptar según el nivel y grado.';
                return `COMPETENCIA: ${comp}\nCAPACIDADES OFICIALES (USAR EXACTAMENTE): ${caps.join(' | ')}\nESTÁNDAR DE APRENDIZAJE OFICIAL (${ciclo} - USAR TEXTUALMENTE): ${estandar}`;
            })
            .join('\n\n')
        : formData.competencias
            .map(comp => {
                const estandar = estandaresCiclo[comp] || 'Adaptar según el nivel y grado.';
                return `COMPETENCIA: ${comp}\nCAPACIDADES OFICIALES (USAR EXACTAMENTE): ${(CNEB_CAPACIDADES[comp] || []).join(' | ')}\nESTÁNDAR DE APRENDIZAJE OFICIAL (${ciclo} - USAR TEXTUALMENTE): ${estandar}`;
            })
            .join('\n\n');

    const prompt = `Eres un docente experto de Educación Física en Perú. Genera una SESIÓN DE APRENDIZAJE profesional alineada al Currículo Nacional (CNEB).

DATOS DEL DOCENTE:
- Docente: ${formData.docente || 'No especificado'}
- Institución Educativa: ${formData.ie || 'No especificada'}
- Director(a): ${formData.director || 'No especificado'}
- DRE: ${formData.dre || 'No especificada'}
- UGEL: ${formData.ugel || 'No especificada'}
- Nivel: ${formData.nivel}
- Grado y Sección: ${formData.grado}
- Área: ${formData.area}
- Tema: ${formData.tema}
- Duración: ${formData.duracion}
${formData.contexto ? `- Contexto Local: ${formData.contexto}` : ''}

⚠️ COMPETENCIAS Y CAPACIDADES OFICIALES DEL CNEB (OBLIGATORIO - COPIA EXACTAMENTE ESTAS CAPACIDADES, NO LAS INVENTES NI LAS CAMBIES):
${competenciasSeleccionadas}

COMPETENCIA TRANSVERSAL: ${formData.competenciaTransversal || 'Sugiere una pertinente'}
ENFOQUE TRANSVERSAL: ${formData.enfoqueTransversal || 'Sugiere uno pertinente'}
INSTRUMENTO DE EVALUACIÓN: ${formData.instrumento}
${formData.alumnos ? `LISTA DE ALUMNOS: ${formData.alumnos}` : ''}

RESPONDE ÚNICAMENTE con un JSON válido (sin markdown, sin \`\`\`json, sin texto extra) con esta estructura exacta:
{
    "titulo": "Título de la sesión",
    "datos_informativos": {
        "docente": "",
        "ie": "",
        "director": "",
        "dre": "",
        "ugel": "",
        "nivel": "",
        "grado": "",
        "area": "Educación Física",
        "tema": "",
        "duracion": "",
        "fecha": "____/____/2025",
        "numero_sesion": "N°___"
    },
    "propositos_aprendizaje": {
        "competencias": [
            {
                "nombre": "nombre de la competencia",
                "capacidades": ["capacidad 1", "capacidad 2"],
                "estandar": "COPIA AQUÍ EL ESTÁNDAR OFICIAL DEL CICLO QUE SE TE PROPORCIONÓ TEXTUALMENTE"
            }
        ],
        "competencia_transversal": "",
        "enfoque_transversal": "",
        "valor": "",
        "actitud": ""
    },
    "proposito_sesion": "Párrafo describiendo el propósito de la sesión",
    "situacion_significativa": "Narrativa motivadora y desafiante para los estudiantes",
    "criterios_evaluacion": [
        {"criterio": "descripción del criterio", "evidencia": "qué evidencia se espera"}
    ],
    "evidencia_aprendizaje": "Descripción de la evidencia",
    "producto": "Resultado tangible de la sesión",
    "secuencia_didactica": {
        "inicio": {
            "duracion": "15-20 min",
            "actividades": [
                {"momento": "Motivación", "descripcion": "Descripción detallada", "recursos": "materiales"},
                {"momento": "Saberes Previos", "descripcion": "Preguntas o actividades", "recursos": ""},
                {"momento": "Problematización", "descripcion": "Situación problemática", "recursos": ""},
                {"momento": "Propósito", "descripcion": "Se comunica el propósito de la sesión", "recursos": ""}
            ]
        },
        "desarrollo": {
            "duracion": "50-60 min",
            "actividades": [
                {"momento": "Activación Corporal / Calentamiento", "descripcion": "Ejercicios detallados", "recursos": "materiales", "organizacion": "individual/parejas/grupos", "tiempo": "10 min"},
                {"momento": "Parte Principal", "descripcion": "Actividades principales con variantes detalladas paso a paso", "recursos": "materiales", "organizacion": "grupos", "tiempo": "30 min"},
                {"momento": "Vuelta a la Calma", "descripcion": "Ejercicios de relajación y estiramiento", "recursos": "", "organizacion": "individual", "tiempo": "10 min"}
            ]
        },
        "cierre": {
            "duracion": "10-15 min",
            "actividades": [
                {"momento": "Evaluación Formativa", "descripcion": "Actividad de evaluación", "recursos": ""},
                {"momento": "Metacognición", "descripcion": "Preguntas de reflexión: ¿Qué aprendimos hoy? ¿Cómo lo aprendimos? ¿Para qué nos sirve?", "recursos": ""}
            ]
        }
    },
    "instrumento_evaluacion": {
        "tipo": "${formData.instrumento}",
        "criterios_instrumento": [
            {"criterio": "criterio 1 observable y medible"},
            {"criterio": "criterio 2 observable y medible"},
            {"criterio": "criterio 3 observable y medible"},
            {"criterio": "criterio 4 observable y medible"}
        ],
        "alumnos": ${formData.alumnos ? JSON.stringify(formData.alumnos.split('\n').filter(a => a.trim())) : '["Alumno 1", "Alumno 2", "Alumno 3"]'}
    },
    "referencias_bibliograficas": ["Referencia 1", "Referencia 2"]
    ${formData.generarTeoria ? `,"teoria": {"titulo": "Título de la teoría", "contenido": "Contenido teórico completo y detallado del tema, con conceptos clave, reglas, biomecánica, historia breve, beneficios, etc. Mínimo 3 párrafos."}` : ''}
    ${formData.generarFicha ? `,"ficha_aplicacion": {"titulo": "Ficha de Aplicación: ${formData.tema}", "preguntas": [${Array.from({ length: formData.numPreguntasFicha || 5 }, (_, i) => `{"numero": ${i + 1}, "pregunta": "Pregunta ${i + 1} relacionada con el tema", "tipo": ${i % 3 === 1 ? '"opcion_multiple", "opciones": ["a) Opción 1", "b) Opción 2", "c) Opción 3", "d) Opción 4"]' : '"abierta"'}}`).join(', ')}]}` : ''}
}

IMPORTANTE: 
- Las actividades del desarrollo deben ser MUY detalladas, con instrucciones paso a paso.
- Usa lenguaje pedagógico formal pero inspirador.
- Las actividades deben ser 100% prácticas y motrices.
- El estándar de aprendizaje debe ser COPIADO TEXTUALMENTE del que se te proporcionó arriba.
- Si debes SUGERIR competencias, elige MÁXIMO 2 de las 3 existentes, las más pertinentes al tema.
- La ficha de aplicación debe tener EXACTAMENTE ${formData.numPreguntasFicha || 5} preguntas, alternando tipos (abiertas y opción múltiple).
- DEVUELVE SOLO EL JSON, sin ningún texto adicional antes o después.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Limpiar posibles marcadores de código
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        const parsed = JSON.parse(text);
        return { success: true, data: parsed };
    } catch (error) {
        console.error("GEMINI STRUCTURED ERROR:", error.message);
        return { success: false, error: error.message };
    }
};

export const generateRubric = async (formData) => {
    const prompt = `Eres un docente experto de Educación Física en Perú. Genera una RÚBRICA DE EVALUACIÓN analítica y detallada.

DATOS DE LA RÚBRICA:
- Nivel: ${formData.nivel}
- Grado: ${formData.grado}
- Unidad/Tema: ${formData.tema}
- Competencia principal: ${formData.competencia}
- Capacidad priorizada: ${formData.capacidad || 'La más pertinente para el tema'}

Instrucciones:
1. Crea de 3 a 5 criterios de evaluación (indicadores) específicos para el tema y grado.
2. Cada criterio debe tener 4 niveles de logro:
   - AD (Logro Destacado): Supera lo esperado.
   - A (Logro Esperado): Cumple lo esperado.
   - B (En Proceso): Está cerca de cumplirlo.
   - C (En Inicio): Muestra dificultades.
3. Las descripciones deben ser observables, medibles y redactadas en tercera persona del singular (ej. "Realiza...", "Demuestra...").

RESPONDE ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
    "titulo": "Rúbrica de Evaluación: ${formData.tema}",
    "criterios": [
        {
            "nombre": "Nombre del Criterio 1",
            "descripciones": {
                "AD": "Descripción para Logro Destacado",
                "A": "Descripción para Logro Esperado",
                "B": "Descripción para En Proceso",
                "C": "Descripción para En Inicio"
            }
        }
    ]
}
DEVUELVE SOLO EL JSON, sin ningún texto adicional antes o después.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(text);
        return { success: true, data: parsed };
    } catch (error) {
        console.error("GEMINI RUBRIC ERROR:", error.message);
        return { success: false, error: error.message };
    }
};
