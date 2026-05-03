# InformesCreator

Generador de informes de avance escolares mediante inteligencia artificial. Aplicacion web local que combina notas de clase en formato markdown con un cuestionario interactivo para producir informes personalizados usando la API de [Ollama](https://ollama.com).

## Caracteristicas

- **Interfaz web amigable**: Wizard de 6 pasos en el navegador, sin necesidad de usar la terminal
- **Flujo por curso**: Seleccionas el curso, confirmas la lista de alumnos, y completas el cuestionario alumno por alumno
- **Parseo de notas de clase**: Lee archivos markdown por alumno con observaciones, asistencia y resumen
- **Cuestionario estructurado**: 3 dimensiones (pedagogica, socioemocional, dominio de contenidos)
- **Mapeo inteligente al prompt**: Las respuestas numericas se traducen a palabras descriptivas para la IA
- **Variantes de informe**: Formal, detallado o breve
- **Prompt humanizado**: Instrucciones para que el resultado suene escrito por un docente
- **Sin dependencia de materia ni escuela**: Funciona para cualquier docente

## Requisitos

- Python 3.10+ (solo para desarrollo/build)
- [Ollama](https://ollama.com) instalado y corriendo (local o cloud)

### Verificacion rapida de Ollama

El proyecto incluye un script de diagnostico que verifica la instalacion, el servidor, los modelos disponibles y la conectividad (incluyendo cloud):

```bash
python check_ollama.py
```

## Instalacion (desarrollo)

### 1. Clonar o descargar el proyecto

```bash
cd InformesCreator
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Instalar Ollama (si no lo tenes)

En Windows, abri PowerShell como administrador y ejecuta:

```powershell
irm https://ollama.com/install.ps1 | iex
```

En macOS/Linux:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 4. Descargar un modelo

```bash
ollama pull gemma-4:31b-cloud
```

Recomendamos `gemma-4:31b-cloud` por su rendimiento y calidad en espanol.
Tambien soporta modelos locales como `gemma3`.

### 5. Verificar que Ollama este activo

```bash
ollama serve
```

## Uso (modo desarrollo)

```bash
python web/main.py
```

Esto inicia un servidor local en `http://localhost:8080` y abre automaticamente el navegador. La interfaz web guia al docente paso a paso.

Tambien podes usar uvicorn directamente:

```bash
uvicorn web.main:app --host 0.0.0.0 --port 8080 --reload
```

La API REST esta documentada automaticamente en `http://localhost:8080/docs` (Swagger UI).

### Flujo de la aplicacion

1. **Configuracion de Ollama**: verifica instalacion, elegis modelo
2. **Configuracion de archivos**: indicas la ruta donde estan los archivos de los alumnos
3. **Curso y Alumnos**: seleccionas el curso y confirmas la lista de alumnos
4. **Cuestionario**: completas la valoracion (TEA/TEP/TED) y las 3 dimensiones **alumno por alumno**
5. **Variante de informe**: elegis formal, detallado o breve
6. **Generacion del informe**: la IA produce el informe y se guarda automaticamente. Luego podes pasar al siguiente alumno.

### Estructura de carpetas esperada

```
Mi escuela/
└── CURSOS/
    └── <Curso>/
        └── Alumnos/
            └── <Apellido_Nombre>.md
```

### Formato de archivo de alumno

Cada archivo `.md` sigue esta estructura:

```markdown
# Apellido, NOMBRE

**Curso:** 1ro B ESN5 | **Lista Nº:** 1

---

## Observaciones

| Fecha | Codigo | Tipo | Comentario |
|-------|--------|------|------------|
| 2026-04-22 | P | Presente | Conversacion en clase |
| 2026-04-23 | A | Ausente | |

### Leyenda:
- **P** = Presente
- **A** = Ausente
- **P-EXC** = Presente excelente trabajo
- **P-x** = Presente sin material/tarea
- **T** = Tarde

---

## Resumen

- **Total Presentes:** 1
- **P-EXC:** 0
- **Tarde:** 0
- **Total Ausencias:** 1
- **Inasistencias seguidas:** 0
- **Ultima actualizacion:** 2026-04-23
```

## Cuestionario

### Valoracion preliminar

- **TEA**: Trayectoria Educativa Alcanzada
- **TEP**: Trayectoria Educativa en Proceso
- **TED**: Trayectoria Educativa Discontinua

### Dimensiones

| Dimension | Preguntas | Escala |
|-----------|-----------|--------|
| I. Comportamiento Pedagogico | 6 | 1=NUNCA, 2=RARA VEZ, 3=EN OCASIONES, 4=SIEMPRE |
| II. Comportamiento Socioemocional | 6 | 1=NUNCA, 2=RARA VEZ, 3=EN OCASIONES, 4=SIEMPRE |
| III. Dominio de Contenidos | 5 | 1=No Logrado, 2=En Proceso, 3=Logrado |

### Observaciones particulares

Campo de texto libre opcional para situaciones puntuales.

## Salida

El informe se guarda en:

```
Informes/<Curso>/Informe_<Apellido>_<Nombre>.md
```

Con formato:

```markdown
# Informe de Avance: Apellido, NOMBRE

**Curso:** 1ro B ESN5 | **Lista Nº:** 1

---

[Contenido generado por la IA]

---

_Generado automaticamente por InformesCreator_
```

## Personalizacion

### Agregar variantes de informe

Crea un archivo `variants.json`:

```json
[
    {
        "id": "D",
        "name": "Narrativo",
        "description": "~150 palabras, estilo narrativo fluido",
        "word_count_target": "150",
        "tone_instructions": "Variante: Narrativo. Conta una breve historia del avance del alumno."
    }
]
```

### Cambiar modelo de IA

Se puede cambiar durante la ejecucion o editando `config.json`:

```json
{
    "model": "llama3"
}
```

## Build para Windows (ejecutable `.exe`)

Para generar un ejecutable unico que el docente pueda usar sin instalar Python:

### Requisitos del build

- Windows 10/11
- Python 3.10+ instalado
- PowerShell

### Pasos

1. Abrir PowerShell en la carpeta del proyecto
2. Ejecutar el script de build:

```powershell
.\build.ps1
```

Esto hace todo automaticamente:
- Crea un entorno virtual
- Instala dependencias
- Ejecuta los tests
- Genera `dist\InformesCreator.exe`

### Distribucion

La carpeta `dist\` contiene el ejecutable listo para usar. Para distribuir:

1. Comprimí `dist\InformesCreator.exe` en un ZIP
2. El usuario solo necesita:
   - El archivo `InformesCreator.exe`
   - [Ollama](https://ollama.com) instalado y corriendo

Al ejecutar `InformesCreator.exe`, se abre automaticamente el navegador en `http://localhost:8080`.

### Configuracion del .exe

Cuando se ejecuta desde el `.exe`, la configuracion (`config.json`) se guarda automaticamente en:

```
%APPDATA%\InformesCreator\config.json
```

Esto evita problemas de permisos si el ejecutable esta en `Archivos de programa`.

## Tests

```bash
python -m pytest tests/ -v
```

## Licencia

MIT
