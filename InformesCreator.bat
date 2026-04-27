@echo off
chcp 65001 > nul
echo ============================================
echo   InformesCreator
echo   Generador de Informes de Avance
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

REM Verificar si esta instalado en la ubicacion por defecto
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set "PYTHON_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    goto :found_python
)
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PYTHON_CMD=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    goto :found_python
)
if exist "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" (
    set "PYTHON_CMD=%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
    goto :found_python
)

echo [ERROR] Python no esta instalado.
echo.
echo Ejecuta primero:
echo   install_windows.bat
echo.
echo O instala Python manualmente desde https://python.org
echo Asegurate de marcar "Add Python to PATH"
echo.
pause
exit /b 1

:found_python
REM Verificar entorno virtual
if exist "%LOCALAPPDATA%\InformesCreator\.venv\Scripts\activate.bat" (
    call "%LOCALAPPDATA%\InformesCreator\.venv\Scripts\activate.bat"
) else if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
) else if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo [ERROR] No se encontro el entorno virtual.
    echo Ejecuta primero: install_windows.bat
    pause
    exit /b 1
)

REM ============================================================
REM VERIFICAR Y LEVANTAR OLLAMA SERVER
REM ============================================================
echo.
echo Verificando Ollama...

set OLLAMA_CMD=
for %%C in (ollama) do (
    %%C --version > nul 2>&1
    if not errorlevel 1 (
        set OLLAMA_CMD=%%C
        goto :ollama_found_cmd
    )
)

REM Buscar en rutas tipicas de Windows
if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
    set "OLLAMA_CMD=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"
    goto :ollama_found_cmd
)
if exist "C:\Program Files\Ollama\ollama.exe" (
    set "OLLAMA_CMD=C:\Program Files\Ollama\ollama.exe"
    goto :ollama_found_cmd
)
if exist "C:\Program Files (x86)\Ollama\ollama.exe" (
    set "OLLAMA_CMD=C:\Program Files (x86)\Ollama\ollama.exe"
    goto :ollama_found_cmd
)

echo [ADVERTENCIA] Ollama no esta instalado.
echo.
echo Para usar la generacion de informes con IA, necesitas instalar Ollama:
echo   https://ollama.com/download/windows
echo.
echo Podes usar la app sin Ollama, pero no podras generar informes.
echo.
goto :ollama_done

:ollama_found_cmd
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

REM Verificar modelo configurado
set MODEL_NAME=gemma4:31b-cloud
%PYTHON_CMD% -c "import json,urllib.request; data=json.load(urllib.request.urlopen('http://localhost:11434/api/tags')); models=[m['name'] for m in data.get('models',[])]; print('MODELS:'+','.join(models))" > _models.txt 2>&1
findstr /C:"%MODEL_NAME%" _models.txt > nul 2>&1
if errorlevel 1 (
    echo [INFO] Modelo %MODEL_NAME% no encontrado. Descargando...
    echo Esto puede tardar varios minutos...
    "%OLLAMA_CMD%" pull %MODEL_NAME%
    if errorlevel 1 (
        echo [ADVERTENCIA] No se pudo descargar el modelo %MODEL_NAME%.
    ) else (
        echo [OK] Modelo %MODEL_NAME% descargado.
    )
) else (
    echo [OK] Modelo %MODEL_NAME% disponible.
)
del _models.txt > nul 2>&1

REM Verificar si el modelo cloud responde (detecta auth 401)
%PYTHON_CMD% -c "import urllib.request,json; req=urllib.request.Request('http://localhost:11434/api/generate', data=json.dumps({'model':'%MODEL_NAME%','prompt':'hi','stream':False}).encode(), headers={'Content-Type':'application/json'}); r=urllib.request.urlopen(req, timeout=10); print('OK')" > _test.txt 2>&1
if errorlevel 1 (
    type _test.txt | findstr /C:"401" > nul 2>&1
    if not errorlevel 1 (
        echo.
        echo ============================================
        echo   ATENCION: Login de Ollama Cloud requerido
        echo ============================================
        echo.
        echo El modelo %MODEL_NAME% necesita autenticacion.
        echo.
        echo Paso 1: Ejecuta en una terminal separada:
        echo   ollama login
        echo.
        echo Paso 2: Segui las instrucciones en el navegador.
        echo.
        echo Paso 3: Volve a ejecutar InformesCreator.bat
        echo.
        del _test.txt > nul 2>&1
        pause
        exit /b 1
    )
)
del _test.txt > nul 2>&1

:ollama_done
echo.

REM ============================================================
REM INICIAR SERVIDOR WEB
REM ============================================================
echo Iniciando servidor...
echo Local:    http://localhost:8080
echo.
cd /d "%~dp0app"
%PYTHON_CMD% -m uvicorn web.main:app --host 0.0.0.0 --port 8080

pause
