import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();

console.log("Gemini API Key loaded:", apiKey ? "Yes (" + apiKey.substring(0, 5) + "...)" : "NO - MISSING!");

let genAI = null;
let model = null;

const BUILD_TIME = "2026-03-13 12:00"; // v4.4 - Unidades Didácticas Premium y Profesionales
const MODEL_NAME = "gemini-2.5-flash"; // Única fuente de verdad para el modelo

try {
    if (apiKey) {
        genAI = new GoogleGenerativeAI(apiKey);
        // Usando el modelo especificado centralmente
        model = genAI.getGenerativeModel({ model: MODEL_NAME });
        console.log(`[${BUILD_TIME}] Gemini Initialized: ${MODEL_NAME}`);
    } else {
        console.error("CRITICAL: API Key no encontrada.");
    }
} catch (err) {
    console.error("Gemini Initialization Failed:", err);
}

export { model };

export const generateAIContent = async (prompt) => {
    if (!model) {
        throw new Error("El modelo de IA no está inicializado. Verifica tu API Key.");
    }
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("GEMINI ERROR DETECTADO:", error.message);
        if (error.message.includes("404")) {
            throw new Error("Error 404: El modelo especificado no fue encontrado. Usando configuración base.");
        }
        throw error;
    }
};

export const generateLessonPlan = async (prompt) => {
    return generateAIContent(prompt);
};

export const generateFastSuggestion = async (prompt) => {
    if (!genAI) throw new Error("AI not initialized");
    try {
        const fastModel = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: { maxOutputTokens: 250 }
        });
        const result = await fastModel.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("GEMINI FAST SUGGESTION ERROR:", error.message);
        throw error;
    }
};

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

const CNEB_ESTANDARES = {
    "Ciclo III": {
        "Se desenvuelve de manera autónoma a través de su motricidad": "Se desenvuelve de manera autónoma a través de su motricidad cuando comprende su cuerpo y se expresa corporalmente. Realiza habilidades motrices básicas orientándose en el espacio y en el tiempo con relación a sí mismo y a otros puntos de referencia.",
        "Asume una vida saludable": "Asume una vida saludable cuando comprende la importancia de la activación corporal e higiene personal. Reconoce la necesidad de utilizar cuidados básicos antes, durante y después de la práctica corporal.",
        "Interactúa a través de sus habilidades sociomotrices": "Interactúa a través de sus habilidades sociomotrices al participar en juegos y aceptar a otros. Construye colectivamente acuerdos y reglas para cuidar de sí y sus pares."
    },
    "Ciclo IV": {
        "Se desenvuelve de manera autónoma a través de su motricidad": "Se desenvuelve de manera autónoma a través de su motricidad cuando reconoce la izquierda y derecha en relación a objetos y en sus pares para mejorar sus posibilidades de movimiento.",
        "Asume una vida saludable": "Asume una vida saludable cuando reconoce la importancia de la frecuencia cardíaca y respiratoria, identifica alimentos saludables y adopta posturas adecuadas.",
        "Interactúa a través de sus habilidades sociomotrices": "Interactúa a través de sus habilidades sociomotrices proponiendo cambios en las condiciones de juego para posibilitar la inclusión de sus pares."
    },
    "Ciclo V": {
        "Se desenvuelve de manera autónoma a través de su motricidad": "Se desenvuelve de manera autónoma a través de su motricidad cuando toma conciencia de cómo su imagen corporal contribuye a la construcción de su identidad y autoestima. Organiza su cuerpo en relación a las acciones.",
        "Asume una vida saludable": "Asume una vida saludable cuando reconoce los cambios corporales que experimenta durante la actividad física, identificando la importancia de la higiene y alimentación saludable.",
        "Interactúa a través de sus habilidades sociomotrices": "Interactúa a través de sus habilidades sociomotrices cuando hace uso de estrategias de cooperación y oposición seleccionando elementos técnicos y tácticos."
    },
    "Ciclo VI": {
        "Se desenvuelve de manera autónoma a través de su motricidad": "Se desenvuelve de manera autónoma a través de su motricidad cuando relaciona cómo su imagen corporal y la aceptación de los otros influyen en el concepto de sí mismo. Realiza habilidades motrices específicas, regulando su tono, postura, equilibrio y tomando como referencia la trayectoria de objetos, los otros y sus propios desplazamientos.",
        "Asume una vida saludable": "Asume una vida saludable cuando comprende los beneficios que la práctica de actividad física produce sobre su salud, para mejorar su calidad de vida. Conoce su estado nutricional e identifica los beneficios nutritivos de los alimentos de su comunidad, de su región y del país.",
        "Interactúa a través de sus habilidades sociomotrices": "Interactúa a través de sus habilidades sociomotrices con autonomía en situaciones que no le son favorables y asume con una actitud de liderazgo los desafíos propios de la práctica de actividades físicas."
    },
    "Ciclo VII": {
        "Se desenvuelve de manera autónoma a través de su motricidad": "Se desenvuelve de manera autónoma a través de su motricidad cuando toma conciencia de su imagen corporal y la utiliza para expresar emociones y sentimientos, mejorando su desempeño motor en situaciones complejas y variadas.",
        "Asume una vida saludable": "Asume una vida saludable cuando evalúa sus necesidades calóricas y toma en cuenta su gasto calórico diario, los alimentos que consume, su origen e inocuidad.",
        "Interactúa a través de sus habilidades sociomotrices": "Interactúa a través de sus habilidades sociomotrices integrando a todas las personas de la comunidad educativa en eventos lúdico-deportivos y promoviendo la práctica de actividad física basada en el disfrute."
    }
};

const getCiclo = (grado, nivel) => {
    const g = (grado || '').toLowerCase();
    const n = (nivel || '').toLowerCase();
    if (n.includes('inicial')) return 'Ciclo II';
    if (n.includes('primaria')) {
        if (g.includes('1') || g.includes('2')) return 'Ciclo III';
        if (g.includes('3') || g.includes('4')) return 'Ciclo IV';
        return 'Ciclo V';
    }
    if (g.includes('1') || g.includes('2')) return 'Ciclo VI';
    return 'Ciclo VII';
};

export const generateStructuredSession = async (formData) => {
    const ciclo = getCiclo(formData.grado, formData.nivel);
    const estandaresCiclo = CNEB_ESTANDARES[ciclo] || CNEB_ESTANDARES['Ciclo VI'];

    const instruccionesExtras = [];
    if (formData.generarTeoria) {
        instruccionesExtras.push("DEBES GENERAR la sección 'teoria' con contenido pedagógico y técnico COMPLETAMENTE REDACTADO. MÍNIMO 300 PALABRAS de contenido real sobre el tema. PROHIBIDO USAR PLACEHOLDERS.");
    } else {
        instruccionesExtras.push("La sección 'teoria' debe ser estrictamente null.");
    }
    
    if (formData.generarFicha) {
        instruccionesExtras.push(`DEBES GENERAR la sección 'ficha_aplicacion' con EXACTAMENTE ${formData.numPreguntasFicha} preguntas reales y variadas. PROHIBIDO USAR PLACEHOLDERS.`);
    } else {
        instruccionesExtras.push("La sección 'ficha_aplicacion' debe ser estrictamente null.");
    }

    const prompt = `Actúa como un Especialista en Currículo de Educación Física de Perú con amplia experiencia pedagógica. 
    TAREA: Generar una SESIÓN DE APRENDIZAJE EXCELENTE, profunda y pedagógicamente rica.

    REGLAS DE ORO (OBLIGATORIAS - PROHIBIDO INVENTAR):
    1. COMPETENCIAS: Usa SÓLO estas: [${formData.competencias.join(', ') || 'Una sola competencia coherente'}].
    2. CAPACIDADES: Usa estrictamente las oficiales del CNEB para cada competencia seleccionada. REFERENCIA: ${JSON.stringify(CNEB_CAPACIDADES)}.
    3. ESTÁNDARES: Usa el estándar correspondiente al ${ciclo}. REFERENCIA: ${JSON.stringify(estandaresCiclo)}.
    4. PROHIBIDO INVENTAR O CAMBIAR NOMBRES: No cambies "Comprende su cuerpo" por otra frase. No inventes capacidades para "Asume una vida saludable".
    5. TÍTULO CORTO: El título de la sesión debe ser corto y directo (máximo 8-10 palabras), para que no ocupe más de una fila.
    6. NIVEL Y GRADO: ${formData.grado} de ${formData.nivel}.
    7. TEMA: ${formData.tema}.

    ${instruccionesExtras.join('\n    ')}

    ESTRUCTURA DE LA SESIÓN (REGLA DE CONCISIÓN):
    - Datos Informativos: Completar todos los campos.
    - Propósitos: Definir competencias, capacidades, desempeños precisados y estándares del ${ciclo}.
    - Secuencia Didáctica (SÉ PRECISO, TÉCNICO Y PUNTUAL. Evita explicaciones redundantes): 
        * INICIO: Motivación, saberes previos y conflicto cognitivo en párrafos directos.
        * DESARROLLO: Actividades lúdico-motrices explicadas de forma clara pero sin relleno innecesario.
        * CIERRE: Metacognición y evaluación rápida de forma puntual.
    - Instrumento: Criterios claros para ${formData.instrumento}.

    RESPONDE EXCLUSIVAMENTE CON UN OBJETO JSON SIGUIENDO ESTE MODELO (SIN COMENTARIOS):
    {
        "titulo": "Título Creativo de la Sesión",
        "datos_informativos": {
            "docente": "${formData.docente}",
            "ie": "${formData.ie}",
            "director": "${formData.director || 'Nombre del Director'}",
            "nivel": "${formData.nivel}",
            "grado": "${formData.grado}",
            "area": "Educación Física",
            "tema": "${formData.tema}",
            "duracion": "${formData.duracion}",
            "fecha": "Fecha de ejecución"
        },
        "propositos_aprendizaje": {
            "competencias": [
                { 
                    "nombre": "Nombre de la competencia", 
                    "capacidades": ["Capacidad A", "Capacidad B"], 
                    "desempeños": ["Desempeño precisado para el grado"],
                    "estandar": "Texto del estándar del ciclo" 
                }
            ],
            "competencia_transversal": "Gestiona su aprendizaje de manera autónoma",
            "enfoque_transversal": "${formData.enfoqueTransversal || 'Enfoque de derechos'}",
            "valor": "Valor del enfoque",
            "actitud": "Actitud observable detallada"
        },
        "proposito_sesion": "Redactar el propósito pedagógico aquí",
        "evidencia_aprendizaje": "Descripción de la evidencia",
        "situacion_significativa": "Redactar la situación significativa/reto aquí (mínimo 100 palabras)",
        "criterios_evaluacion": [
            { "criterio": "Criterio 1", "evidencia": "Evidencia 1" }
        ],
        "secuencia_didactica": {
            "inicio": { "duracion": "15 min", "actividades": [{ "momento": "Nombre momento", "descripcion": "Descripción detallada", "recursos": "Materiales", "tiempo": "5m" }] },
            "desarrollo": { "duracion": "60 min", "actividades": [{ "momento": "Nombre momento", "descripcion": "Descripción detallada", "recursos": "Materiales", "tiempo": "15m" }] },
            "cierre": { "duracion": "15 min", "actividades": [{ "momento": "Nombre momento", "descripcion": "Descripción detallada", "recursos": "Materiales", "tiempo": "5m" }] }
        },
        "instrumento_evaluacion": {
            "tipo": "${formData.instrumento}",
            "criterios_instrumento": [{ "criterio": "Criterio de evaluación" }],
            "alumnos": []
        },
        "teoria": ${formData.generarTeoria ? '{ "titulo": "Título de la Teoría", "contenido": "Genera AQUÍ todo el contenido técnico y pedagógico real..." }' : 'null'},
        "ficha_aplicacion": ${formData.generarFicha ? '{ "preguntas": [ { "numero": 1, "pregunta": "Escribir pregunta real...", "opciones": ["Opción A", "Opción B", "Opción C"], "tipo": "cerrada" } ] }' : 'null'},
        "referencias_bibliograficas": ["CNEB 2017", "Manual de Educación Física"]
    }
    
    IMPORTANTE: Si 'teoria' o 'ficha_aplicacion' no son null, DEBES llenarlos con contenido REAL y COMPLETO. Prohibido usar el texto de ejemplo.`;

    try {
        const fullModel = genAI.getGenerativeModel({ 
            model: MODEL_NAME,
            generationConfig: {
                maxOutputTokens: 8192, // Máximo permitido para contenido extenso
                temperature: 0.7,
                responseMimeType: "application/json" // Fuerza a la IA a devolver un JSON válido
            }
        });

        const result = await fullModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        let cleanedText = text.trim();
        // Limpieza de bloques de código markdown
        cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/```\s*$/g, '').trim();
        
        try {
            const parsed = JSON.parse(cleanedText);
            
            // Limpieza de seguridad
            if (!formData.generarTeoria) {
                parsed.teoria = null;
            } else if (parsed.teoria && (parsed.teoria.contenido?.includes("REDACTAR") || (parsed.teoria.contenido || "").length < 50)) {
                console.warn("La IA generó teoría muy corta o con placeholders.");
            }

            if (!formData.generarFicha) {
                parsed.ficha_aplicacion = null;
            }
            
            return { success: true, data: parsed };
        } catch (parseError) {
            console.error("JSON PARSE ERROR ORIGINAL TEXT:", text);
            throw new Error("La IA generó un formato inválido. Intenta de nuevo o reduce el tamaño de la respuesta.");
        }
    } catch (e) {
        console.error("Error en generateStructuredSession:", e);
        return { success: false, error: "Error de IA: " + e.message };
    }
};

export const generateStructuredAnnualPlan = async (formData) => {

    const unidadesInfo = formData.unidades.map(u => {
        // Enforce strictly one competency (the first one selected)
        const comp = u.competencias[0] || 'Sin competencia';
        return {
            nro: u.id,
            titulo: u.titulo,
            competencia: comp
        };
    });

    const prompt = `Actúa como un Especialista Curricular de Educación Física de alto nivel en Perú. Genera un PLAN CURRICULAR ANUAL de Educación Física siguiendo estrictamente esta estructura y usando los Datos Oficiales del CNEB proporcionados.

    DATOS OFICIALES CNEB (PROHIBIDO INVENTAR O CAMBIAR NOMBRES):
    - CAPACIDADES POR COMPETENCIA: ${JSON.stringify(CNEB_CAPACIDADES)}
    - ESTÁNDAR DEL CICLO ACTUAL: ${JSON.stringify(estandaresCiclo)}

    ESTRUCTURA DEL PLAN:
1. DATOS INFORMATIVOS: Copia fiel de los datos administrativos.
2. DESCRIPCIÓN GENERAL Y ANÁLISIS DE LOS RESULTADOS DIAGNÓSTICOS:
   2.1 Características de los estudiantes (basado en el diagnóstico: ${formData.diagnostico || 'No provisto'}).
   2.2 Características del contexto (basado en el cartel de demandas: ${formData.contextoDemandas || 'No provisto'}).
   2.3 Resultados de la evaluación diagnóstica (Escribe el marcador de posición exacto: "[El docente debe pegar aquí los resultados consolidados de su evaluación diagnóstica]").
3. CALENDARIZACIÓN ESCOLAR: (Escribe el marcador: "[El docente debe complementar con el calendario oficial]").
4. IDENTIFICACIÓN DE DEMANDAS Y NECESIDADES: (Escribe el marcador: "[El docente debe pegar aquí sus Carteles de Demandas]").
5. PROPÓSITOS DE APRENDIZAJE: Lista las 3 competencias nacionales y sus capacidades oficiales.
6. ORGANIZACIÓN DE LAS UNIDADES DIDÁCTICAS (MATRIZ): Planificación temporal.
7. ESTÁNDARES Y DESEMPEÑOS PRECISADOS: Por cada competencia y grado. Usa el estándar del ciclo correspondiente.
8. ENFOQUES TRANSVERSALES: Detalles con actitudes observables.
9. TUTORÍA Y ORIENTACIÓN EDUCATIVA.
10. MATERIALES Y RECURSOS.
11. EVALUACIÓN (Escala CNEB).
12. CIERRE Y FODA PEDAGÓGICO.

UNIDADES PROVISTAS POR EL DOCENTE (REGLA DE ORO: USA ÚNICAMENTE ESTAS ${unidadesInfo.length} UNIDADES. PROHIBIDO AÑADIR O QUITAR UNIDADES):
${JSON.stringify(unidadesInfo, null, 2)}

ENFOQUES TRANSVERSALES SELECCIONADOS (REGLA DE ORO: DETALLAR ÚNICAMENTE ESTOS):
${formData.enfoques.join(', ')}

DIMENSIONES DE TUTORÍA: ${formData.dimensionesTutoria.join(', ')}
ACTIVIDADES DE TUTORÍA PROVISTAS POR EL DOCENTE: ${formData.actividadesTutoria || 'No provistas. Genera en base a las dimensiones.'}

RECURSOS Y MATERIALES PROVISTOS: ${formData.recursos || 'No provistos. Genera en base a Educación Física.'}

REGLAS DE RIGUROSIDAD PEDAGÓGICA (NO NEGOCIABLES):
1. MATRIZ DE UNIDADES (SECCIÓN 6): Debe contener exactamente ${unidadesInfo.length} unidades. No añadas unidades "de relleno".
2. COMPETENCIAS Y CAPACIDADES: Usa estrictamente los nombres del bloque DATOS OFICIALES CNEB. No inventes capacidades como "comprende el desarrollo de la corporeidad". Usa "Comprende su cuerpo".
3. CADA UNIDAD SOLO PUEDE TENER UNA COMPETENCIA.
4. ESTÁNDARES (SECCIÓN 7): Redacta el estándar oficial del ciclo sin cambios.

REGLAS DE CONTENIDO:
- Usa los datos: IE: ${formData.ie}, Docente: ${formData.docente}, Grado: ${formData.grado}.
- Los desempeños precisados (sección 7) deben ser específicos para el grado ${formData.grado} y alineados al CNEB.

RESPONDE ÚNICAMENTE UN JSON CON ESTA ESTRUCTURA:
{
    "titulo_principal": "PLANIFICACIÓN CURRICULAR ANUAL ${formData.anio}",
    "datos_informativos": { "ie": "${formData.ie}", "dre": "${formData.dre}", "ugel": "${formData.ugel}", "grado": "${formData.grado}", "seccion": "${formData.seccion}", "docente": "${formData.docente}", "director": "${formData.director}", "anio": "${formData.anio}", "nivel": "${formData.nivel}" },
    "seccion_2_diagnostico": {
        "caracteristicas_estudiantes": "...",
        "caracteristicas_contexto": "...",
        "resultados_espacio": "[Espacio para resultados]"
    },
    "seccion_3_calendarizacion": "[Espacio para calendario]",
    "seccion_4_demandas": "[Espacio para cartel de demandas]",
    "seccion_5_propositos": [
        { "competencia": "nombre completo...", "capacidades": ["cap1", "cap2"] }
    ],
    "organizacion_unidades": [
        { 
            "nro": "1", 
            "titulo": "...", 
            "periodo": "I Bimestre/Trimestre", 
            "competencia_nombre": "Nombre completo de la ÚNICA competencia",
            "capacidades": ["Capacidad 1", "Capacidad 2"],
            "enfoques": ["Enfoque X"] 
        }
    ],
    "estandares_desempenos": [
        { "competencia": "...", "estandar": "...", "desempenos_precisados": "..." }
    ],
    "enfoques_transversales_detalle": [
        { "enfoque": "...", "actitudes_docente": "...", "actitudes_estudiantes": "..." }
    ],
    "tutoria_orientacion": { "plan": "..." },
    "materiales_recursos": { "estructuradas": [], "no_estructuradas": [] },
    "evaluacion": { "escala": ["Listado de niveles de logro CNEB..."] },
    "cierre": { 
        "analisis_foda_pedagogico": { 
            "fortalezas": ["Ítem de fortaleza real 1", "Ítem de fortaleza real 2", "Ítem de fortaleza real 3"], 
            "oportunidades": ["Ítem de oportunidad real 1", "Ítem de oportunidad real 2", "Ítem de oportunidad real 3"], 
            "debilidades": ["Ítem de debilidad real 1", "Ítem de debilidad real 2", "Ítem de debilidad real 3"], 
            "amenazas": ["Ítem de amenaza real 1", "Ítem de amenaza real 2", "Ítem de amenaza real 3"] 
        } 
    }
}`;

    try {
        const text = await generateAIContent(prompt);
        let cleanedText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        return { success: true, data: parsed };
    } catch (e) { 
        console.error("Error en generateStructuredAnnualPlan:", e);
        return { success: false, error: e.message }; 
    }
};

export const generateExam = async (formData) => {
    const prompt = `Genera un examen de Educación Física en JSON. Datos: ${JSON.stringify(formData)}`;
    try {
        const text = await generateAIContent(prompt);
        let cleanedText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        return { success: true, data: JSON.parse(cleanedText) };
    } catch (e) { return { success: false, error: e.message }; }
};

const getGrados = (grado, planificarPor) => {
    if (planificarPor === 'Ciclo') {
        const cicloMap = {
            'Ciclo II': '3, 4 y 5 años (Inicial)',
            'Ciclo III': '1° y 2° Grado',
            'Ciclo IV': '3° y 4° Grado',
            'Ciclo V': '5° y 6° Grado',
            'Ciclo VI': '1° y 2° de Secundaria',
            'Ciclo VII': '3°, 4° y 5° de Secundaria'
        };
        return cicloMap[grado] || grado;
    }
    return grado;
};

export const generateStructuredUnit = async (formData) => {
    const ciclo = getCiclo(formData.grado, formData.nivel);
    const gradosAfectados = getGrados(formData.grado, formData.planificarPor);
    const estandaresCiclo = CNEB_ESTANDARES[ciclo] || CNEB_ESTANDARES['Ciclo VI'];

    const prompt = `Actúa como un Especialista en Currículo de Educación Física de Perú.
    TAREA: Generar una UNIDAD DE APRENDIZAJE (Unidad Didáctica) completa, profunda y pedagógicamente coherente.

    DATOS OFICIALES CNEB (PROHIBIDO INVENTAR):
    - CAPACIDADES: ${JSON.stringify(CNEB_CAPACIDADES)}
    - ESTÁNDAR DEL CICLO ACTUAL (${ciclo}): ${JSON.stringify(estandaresCiclo)}

    REGLAS DE ORO (OBLIGATORIAS):
    1. ALINEACIÓN CNEB: Usa estrictamente las competencias y capacidades oficiales del bloque DATOS OFICIALES CNEB. No inventes nombres alternativos.
    2. TÍTULOS CORTOS: El título de la unidad y de cada sesión en la secuencia deben ser cortos y directos (máximo 8-10 palabras), para que no ocupen más de una fila.
    3. SITUACIÓN SIGNIFICATIVA: Debe ser real, partir de la problemática: "${formData.contexto}". Debe incluir un RETO (preguntas desafiantes) y un PRODUCTO.
    4. SECUENCIA DIDÁCTICA: Debe generar ${formData.duracion} sesiones (una por semana). Cada sesión debe tener título, propósito y criterios.
    5. JUSTIFICACIÓN: Explica el "por qué" y "para qué" de la unidad basándose en las necesidades del estudiante de ${gradosAfectados}.

    DATOS DE ENTRADA:
    - Unidad: ${formData.tituloUnidad}
    - Nivel: ${formData.nivel} | ${formData.planificarPor}: ${formData.grado}
    - Duración: ${formData.duracion} semanas.
    - Temas: ${formData.temasClave}
    - Competencias a priorizar: ${formData.competencias.join(', ')}
    - Enfoques seleccionados: ${formData.enfoques.join(', ')}

    RESPONDE EXCLUSIVAMENTE CON UN OBJETO JSON SIGUIENDO ESTA ESTRUCTURA:
    {
        "titulo_unidad": "${formData.tituloUnidad || 'Nombre Creativo de la Unidad'}",
        "datos_informativos": {
            "docente": "${formData.docente}",
            "ie": "${formData.ie}",
            "director": "${formData.director}",
            "nivel": "${formData.nivel}",
            "area": "${formData.area}",
            "ciclo_grado": "${formData.grado}",
            "anio": "${formData.anio}",
            "periodo": "${formData.periodo}",
            "duracion": "${formData.duracion} semanas",
            "fechas": "${formData.fechaInicio} al ...",
            "num_estudiantes": "${formData.numEstudiantes}",
            "turno": "${formData.turno}"
        },
        "justificacion": "Redacción pedagógica de la justificación de la unidad...",
        "proposito_unidad": "Propósito general de aprendizaje...",
        "situacion_significativa": "Redacción completa de la situación significativa con su reto...",
        "producto_unidad": "${formData.productoFinal || 'Descripción del producto de la unidad'}",
        "competencias_capacidades_estandar": [
            {
                "competencia": "Nombre completo",
                "capacidades": ["Capacidad 1", "Capacidad 2"],
                "estandar": "Texto del estándar del ${ciclo}",
                "desempenos": ["Desempeño 1", "Desempeño 2"]
            }
        ],
        "enfoques_transversales": [
            { "enfoque": "Nombre", "valores": "...", "actitudes": "...", "actitud_docente": "..." }
        ],
        "secuencia_sesiones": [
            { "semana": "Semana 1", "titulo": "...", "proposito": "...", "tiempo": "90 min" }
        ],
        "evaluacion": {
            "criterios": ["Criterio 1", "Criterio 2"],
            "evidencias": ["Evidencia 1"],
            "instrumentos": ["Lista de Cotejo"]
        },
        "orientaciones_pedagogicas": "Recomendaciones para el docente...",
        "referencias": ["CNEB 2017", "Cartilla de Planificación"]
    }`;

    try {
        const fullModel = genAI.getGenerativeModel({ 
            model: MODEL_NAME,
            generationConfig: {
                maxOutputTokens: 8192, // Aumentado para evitar cortes
                temperature: 0.7,
                responseMimeType: "application/json"
            }
        });

        const result = await fullModel.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();
        
        // Limpieza de seguridad para bloques de código JSON
        text = text.replace(/^```json\s*/i, '').replace(/```\s*$/g, '').trim();

        try {
            const parsed = JSON.parse(text);
            return { success: true, data: parsed };
        } catch (parseError) {
            console.error("JSON PARSE ERROR EN UNIDAD:", text);
            throw new Error("La IA generó un formato incompleto. Por favor, intenta de nuevo.");
        }
    } catch (e) {
        console.error("Error en generateStructuredUnit:", e);
        return { success: false, error: "Error de IA: " + e.message };
    }
};



export const generateDiagnosticEvaluation = async (formData) => {
    const ciclo = formData.ciclo || getCiclo(formData.grado, formData.nivel);
    const prompt = `Actúa como un Especialista Curricular de Educación Física de Perú. 
    TAREA: Generar una EVALUACIÓN DIAGNÓSTICA integral alineada al CNEB.

    DATOS PROVISTOS POR EL DOCENTE:
    - Grado: ${formData.grado}
    - Sección: ${formData.seccion}
    - Ciclo: ${ciclo}
    - Contexto del Entorno: ${formData.contexto}
    - Problemática o Interés: ${formData.problematica}
    - Duración Estimada: ${formData.duracion}
    - Estudiantes: ${formData.alumnos || 'No provistos'}

    REGLAS PEDAGÓGICAS (OBLIGATORIAS):
    1. Incluir las 3 COMPETENCIAS del área: "Se desenvuelve...", "Asume..." e "Interactúa...".
    2. SITUACIÓN SIGNIFICATIVA: Debe ser un RETO (desafío) motivador diseñado para que el alumno use sus habilidades motrices, cuide su salud y juegue en equipo.
    3. CRITERIOS DE EVALUACIÓN: Listar desempeños precisados reales para ${formData.grado} grado.
    4. INSTRUMENTO: Generar una Lista de Cotejo o Rúbrica con criterios extraídos de los desempeños.
    5. CONCLUSIONES Y RESULTADOS ESPERADOS: Redactar una sección de conclusiones pedagógicas sobre lo que se espera lograr y cómo los resultados ayudarán a la planificación anual.

    RESPONDE EXCLUSIVAMENTE CON UN OBJETO JSON SIGUIENDO ESTA ESTRUCTURA:
    {
        "datos_generales": {
            "grado": "${formData.grado}",
            "seccion": "${formData.seccion}",
            "ciclo": "${ciclo}",
            "docente": "${formData.docente || 'Docente'}",
            "institucion": "${formData.ie || 'I.E.'}"
        },
        "proposito_evaluacion": "Redactar el propósito aquí...",
        "competencias_capacidades": [
            { "competencia": "Se desenvuelve de manera autónoma a través de su motricidad", "capacidades": ["Comprende su cuerpo", "Se expresa corporalmente"] },
            { "competencia": "Asume una vida saludable", "capacidades": ["Comprende las relaciones entre la actividad física, alimentación, postura e higiene personal y del ambiente, y la salud", "Incorpora prácticas que mejoran su calidad de vida"] },
            { "competencia": "Interactúa a través de sus habilidades sociomotrices", "capacidades": ["Se relaciona utilizando sus habilidades sociomotrices", "Crea y aplica estrategias y tácticas de juego"] }
        ],
        "situacion_significativa": {
            "titulo": "Título del reto",
            "descripcion": "Descripción detallada del reto diagnóstico aquí..."
        },
        "criterios_evaluacion": [
            { "competencia": "...", "criterios": ["Criterio precisado 1", "Criterio precisado 2"] }
        ],
        "evidencias_aprendizaje": "Descripción del producto o actuación",
        "conclusiones_resultados": "Redactar conclusiones pedagógicas detalladas aquí...",
        "secuencia_sesiones": [
            { "sesion": 1, "titulo": "Nombre de la sesión de evaluación 1", "actividad": "Descripción breve de la actividad principal" }
        ],
        "instrumento_recojo": {
            "tipo": "Lista de Cotejo",
            "columnas": ["N°", "Estudiantes", "Criterio 1", "Criterio 2", "Criterio 3"],
            "alumnos": ["Estudiante 1", "Estudiante 2"] 
        }
    }`;

    try {
        const text = await generateAIContent(prompt);
        let cleanedText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        return { success: true, data: JSON.parse(cleanedText) };
    } catch (e) {
        console.error("Error en generateDiagnosticEvaluation:", e);
        return { success: false, error: e.message };
    }
};
