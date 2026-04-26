@echo off
chcp 65001 > nul
echo ============================================
echo   InformesCreator - Instalador para Windows
echo ============================================
echo.

setlocal enabledelayedexpansion

REM Buscar Python en PATH
set PYTHON_CMD=
for %%C in (python py python3) do (
    %%C --version > nul 2>&1
    if not errorlevel 1 (
        set PYTHON_CMD=%%C
        goto :found_python
    )
)

echo [INFO] Python no esta instalado. Descargando e instalando Python...
echo.

REM Descargar el instalador completo de Python (no la version embeddable)
echo Descargando Python 3.12.9...
curl -L -o python_installer.exe "https://www.python.org/ftp/python/3.12.9/python-3.12.9-amd64.exe" > nul 2>&1
if errorlevel 1 (
    echo [ERROR] No se pudo descargar Python.
    echo.
    echo Por favor descarga Python manualmente desde:
    echo   https://python.org/downloads
    echo.
    echo Asegurate de marcar "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

echo [OK] Instalador descargado. Instalando silenciosamente...
echo Esto puede tomar unos minutos...
echo.

REM Instalar silenciosamente para el usuario actual, agregando a PATH
python_installer.exe /quiet InstallAllUsers=0 PrependPath=1 Include_test=0 TargetDir="%LOCALAPPDATA%\Programs\Python\Python312"
if errorlevel 1 (
    echo [ERROR] Fallo la instalacion de Python.
    pause
    exit /b 1
)

del python_installer.exe > nul 2>&1

REM Actualizar PATH para esta sesion
set "PATH=%LOCALAPPDATA%\Programs\Python\Python312;%LOCALAPPDATA%\Programs\Python\Python312\Scripts;%PATH%"

set PYTHON_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe
echo [OK] Python instalado.
echo.

:found_python
%PYTHON_CMD% --version
echo.

REM Crear entorno virtual si no existe
if not exist ".venv" (
    echo Creando entorno virtual...
    %PYTHON_CMD% -m venv .venv
    if errorlevel 1 (
        echo [ERROR] No se pudo crear el entorno virtual.
        pause
        exit /b 1
    )
    echo [OK] Entorno virtual creado.
) else (
    echo [OK] Entorno virtual ya existe.
)
echo.

REM Activar entorno virtual
call .venv\Scripts\activate.bat

REM Instalar dependencias
echo Instalando dependencias...
pip install -r app\requirements.txt
if errorlevel 1 (
    echo [ERROR] Fallo la instalacion de dependencias.
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas.
echo.

REM ============================================================
REM VERIFICAR E INSTALAR OLLAMA
REM ============================================================
set OLLAMA_CMD=
for %%C in (ollama) do (
    %%C --version > nul 2>&1
    if not errorlevel 1 (
        set OLLAMA_CMD=%%C
        goto :found_ollama
    )
)

REM Buscar en rutas tipicas de Windows
if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
    set "OLLAMA_CMD=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"
    goto :found_ollama
)
if exist "C:\Program Files\Ollama\ollama.exe" (
    set "OLLAMA_CMD=C:\Program Files\Ollama\ollama.exe"
    goto :found_ollama
)
if exist "C:\Program Files (x86)\Ollama\ollama.exe" (
    set "OLLAMA_CMD=C:\Program Files (x86)\Ollama\ollama.exe"
    goto :found_ollama
)

echo [INFO] Ollama no esta instalado. Descargando e instalando...
echo.

curl -L -o OllamaSetup.exe "https://ollama.com/download/OllamaSetup.exe" > nul 2>&1
if errorlevel 1 (
    echo [ERROR] No se pudo descargar Ollama.
    echo.
    echo Descargalo manualmente desde:
    echo   https://ollama.com/download/windows
    echo.
    pause
    exit /b 1
)

echo [OK] Descargado. Instalando silenciosamente...
OllamaSetup.exe /S
if errorlevel 1 (
    echo [ERROR] Fallo la instalacion de Ollama.
    pause
    exit /b 1
)

del OllamaSetup.exe > nul 2>&1

REM Rebuscar Ollama despues de instalar
if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
    set "OLLAMA_CMD=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"
) else if exist "C:\Program Files\Ollama\ollama.exe" (
    set "OLLAMA_CMD=C:\Program Files\Ollama\ollama.exe"
) else (
    echo [ERROR] No se encontro Ollama despues de instalar.
    pause
    exit /b 1
)

echo [OK] Ollama instalado.
echo.

:found_ollama
echo [OK] Ollama detectado: %OLLAMA_CMD%
echo.

REM Verificar si el servidor esta corriendo
curl -s http://localhost:11434/api/tags > nul 2>&1
if errorlevel 1 (
    echo [INFO] El servidor Ollama no esta corriendo. Iniciando...
    start /B "" "%OLLAMA_CMD%" serve > nul 2>&1
    echo Esperando a que Ollama este listo...
    set /a retries=0
    :wait_ollama
    timeout /t 1 > nul
    curl -s http://localhost:11434/api/tags > nul 2>&1
    if errorlevel 1 (
        set /a retries+=1
        if !retries! lss 15 goto :wait_ollama
        echo [ERROR] Ollama no respondio a tiempo.
        echo Intenta iniciarlo manualmente con: ollama serve
        pause
        exit /b 1
    )
    echo [OK] Servidor Ollama iniciado.
) else (
    echo [OK] Servidor Ollama ya esta corriendo.
)
echo.

REM Verificar modelo configurado
set MODEL_NAME=gemma4:31b-cloud
echo Verificando modelo %MODEL_NAME%...

REM Usar Python para verificar modelos disponibles
%PYTHON_CMD% -c "import json,urllib.request; data=json.load(urllib.request.urlopen('http://localhost:11434/api/tags')); models=[m['name'] for m in data.get('models',[])]; print('MODELS:'+','.join(models))" > _models.txt 2>&1
findstr /C:"%MODEL_NAME%" _models.txt > nul 2>&1
if errorlevel 1 (
    echo [INFO] Modelo %MODEL_NAME% no encontrado. Descargando...
    echo Esto puede tardar varios minutos...
    "%OLLAMA_CMD%" pull %MODEL_NAME%
    if errorlevel 1 (
        echo [ADVERTENCIA] No se pudo descargar el modelo %MODEL_NAME%.
        echo Podes descargarlo manualmente despues con:
        echo   ollama pull %MODEL_NAME%
    ) else (
        echo [OK] Modelo descargado.
    )
) else (
    echo [OK] Modelo %MODEL_NAME% disponible.
)
del _models.txt > nul 2>&1
echo.

echo ============================================
echo   Instalacion completa!
echo ============================================
echo.
echo Para iniciar el servidor, ejecuta:
echo   InformesCreator.bat
echo.
pause
