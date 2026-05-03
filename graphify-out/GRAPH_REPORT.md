# Graph Report - InformesCreator  (2026-04-28)

## Corpus Check
- 31 files · ~562,361 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 689 nodes · 1659 edges · 30 communities detected
- Extraction: 78% EXTRACTED · 22% INFERRED · 0% AMBIGUOUS · INFERRED: 370 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `Config` - 94 edges
2. `$()` - 58 edges
3. `InstallWizard` - 38 edges
4. `hide()` - 33 edges
5. `show()` - 25 edges
6. `Student` - 24 edges
7. `apiGet()` - 23 edges
8. `setLoading()` - 21 edges
9. `main()` - 18 edges
10. `Observaciones Section` - 18 edges

## Surprising Connections (you probably didn't know these)
- `test_get_available_models()` --calls--> `get_available_models()`  [INFERRED]
  tests/test_ollama_client.py → app/setup_ollama.py
- `Report output path Informes/<Curso>/` --semantically_similar_to--> `Informes/ directory`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `test_discover_courses()` --calls--> `discover_courses()`  [INFERRED]
  tests/test_course_manager.py → app/course_manager.py
- `test_get_students()` --calls--> `get_students()`  [INFERRED]
  tests/test_course_manager.py → app/course_manager.py
- `test_create_student_template()` --calls--> `create_student_template()`  [INFERRED]
  tests/test_course_manager.py → app/course_manager.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (78): BaseModel, Config, Gestiona la configuración del InformesCreator., InstallWizard, main(), _read_version(), assign_course_questionnaire_endpoint(), AssignQuestionnaireRequest (+70 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (103): $(), addEmptyObsRow(), apiGet(), apiPost(), apiPut(), checkOllamaStatus(), closeProfileModal(), closeQuestionnaireEditor() (+95 more)

### Community 2 - "Community 2"
Cohesion: 0.03
Nodes (103): API prefix /api, app.js, APPDATA config location, Attendance inputs, Attendance warning (>30% absences), Single-user local authentication, Background particles canvas, build_dist.py (+95 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (102): Establece un valor de configuración y lo persiste., add_students_to_course(), create_course(), create_student_template(), discover_courses(), format_observations_table(), get_course_contents(), get_course_session() (+94 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (58): base_path(), default_variant(), _get_config_dir(), model(), ollama_url(), output_dir(), Devuelve el directorio donde se guarda la configuración del usuario., Carga la configuración desde el archivo JSON.         Si no existe, crea uno con (+50 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (44): classify_model(), probe_model(), Determina si un modelo es cloud o local basado en sus campos., Hace una llamada de prueba a un modelo y devuelve resultado del diagnóstico., run_diagnostics(), ollama_models(), ollama_status(), Ollama setup (app/setup_ollama.py) (+36 more)

### Community 6 - "Community 6"
Cohesion: 0.48
Nodes (33): Alumno1, Alumno2, Alumno3, Alumno4, Alumno5, Alumno6, Alumno7, A = Ausente (+25 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (11): LauncherApp, main(), _read_version(), Tkinter, _compare_versions(), main(), Escribe un .bat que hace el swap de carpetas despues de que este proceso muera., Ejecuta el .bat en segundo plano (sin ventana). (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.19
Nodes (11): check_ollama_server(), generate_report(), get_available_models(), Verifica que el servidor Ollama esté respondiendo., Obtiene la lista de modelos instalados en Ollama., Genera un informe llamando a la API de Ollama., test_check_ollama_server_failure(), test_check_ollama_server_success() (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.38
Nodes (6): _ask_dimension(), _ask_option(), Ejecuta el cuestionario interactivo y devuelve las respuestas., Pregunta una dimensión completa y devuelve lista de respuestas numéricas., Muestra opciones numeradas y devuelve la seleccionada., run_questionnaire()

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (2): build_update(), main()

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (2): Hero Banner Image (Root), Hero Banner Image (Static)

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (1): Formatea una lista de observaciones como tabla markdown.

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (1): Actualiza el archivo .md de un alumno con nuevas observaciones y recalcula resum

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (1): Construye el system prompt para Ollama.

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (1): Construye el user prompt combinando todos los datos del alumno.

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (1): Representa una observación de clase de un alumno.

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (1): Representa los datos estructurados de un alumno.

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (1): Parsea un archivo markdown de alumno y devuelve un objeto Student.

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (1): Extrae las observaciones de la tabla markdown.

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (1): Crea el perfil único de la app. Solo funciona si no existe uno previo.

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (1): Valida credenciales contra el perfil guardado.

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (1): Devuelve datos del perfil sin el hash de contraseña.

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (1): Elimina el JSON de sesión de un curso. No borra la carpeta ni los .md.

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (1): Devuelve el contenido del informe como archivo markdown para descargar.

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (1): Crea un nuevo curso con sus alumnos.

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (1): Devuelve las observaciones raw de un alumno.

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (1): Guarda observaciones de un alumno y recalcula asistencia.

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (1): Abre un dialogo nativo de seleccion de carpeta y devuelve la ruta absoluta.

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (1): Login Page Screenshot

## Knowledge Gaps
- **121 isolated node(s):** `Prueba end-to-end completa del flujo de InformesCreator.  Esta prueba simula la`, `InformesCreator - Resolucion de paths centralizada.  Este modulo resuelve las ru`, `Devuelve la raiz del proyecto.`, `Devuelve un path dentro de la carpeta app/.`, `Devuelve un path dentro de user_data/. Crea el directorio si no existe.` (+116 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 10`** (3 nodes): `build_update()`, `main()`, `build_update.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (2 nodes): `Hero Banner Image (Root)`, `Hero Banner Image (Static)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `Formatea una lista de observaciones como tabla markdown.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `Actualiza el archivo .md de un alumno con nuevas observaciones y recalcula resum`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `Construye el system prompt para Ollama.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `Construye el user prompt combinando todos los datos del alumno.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `Representa una observación de clase de un alumno.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `Representa los datos estructurados de un alumno.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `Parsea un archivo markdown de alumno y devuelve un objeto Student.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `Extrae las observaciones de la tabla markdown.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `Crea el perfil único de la app. Solo funciona si no existe uno previo.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `Valida credenciales contra el perfil guardado.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `Devuelve datos del perfil sin el hash de contraseña.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `Elimina el JSON de sesión de un curso. No borra la carpeta ni los .md.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `Devuelve el contenido del informe como archivo markdown para descargar.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `Crea un nuevo curso con sus alumnos.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `Devuelve las observaciones raw de un alumno.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `Guarda observaciones de un alumno y recalcula asistencia.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `Abre un dialogo nativo de seleccion de carpeta y devuelve la ruta absoluta.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `Login Page Screenshot`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Config` connect `Community 0` to `Community 8`, `Community 3`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **Why does `Student markdown parser` connect `Community 2` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `main()` connect `Community 3` to `Community 0`, `Community 2`, `Community 5`, `Community 8`, `Community 9`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Are the 87 inferred relationships involving `Config` (e.g. with `CourseContentsRequest` and `StudentObservation`) actually correct?**
  _`Config` has 87 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Prueba end-to-end completa del flujo de InformesCreator.  Esta prueba simula la`, `InformesCreator - Resolucion de paths centralizada.  Este modulo resuelve las ru`, `Devuelve la raiz del proyecto.` to the rest of the system?**
  _121 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.03 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._