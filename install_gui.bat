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


setlocal enabledelayedexpansion

REM Buscar pythonw (sin ventana de consola)
set PYTHONW_CMD=
for %%C in (pythonw pyw) do (
    %%C --version > nul 2>&1
    if not errorlevel 1 (
        set PYTHONW_CMD=%%C
        goto :found_pythonw
    )
)

REM Verificar pythonw en ubicaciones por defecto
if exist "%LOCALAPPDATA%\Programs\Python\Python312\pythonw.exe" (
    set "PYTHONW_CMD=%LOCALAPPDATA%\Programs\Python\Python312\pythonw.exe"
    goto :found_pythonw
)
if exist "%LOCALAPPDATA%\Programs\Python\Python311\pythonw.exe" (
    set "PYTHONW_CMD=%LOCALAPPDATA%\Programs\Python\Python311\pythonw.exe"
    goto :found_pythonw
)
if exist "%LOCALAPPDATA%\Programs\Python\Python310\pythonw.exe" (
    set "PYTHONW_CMD=%LOCALAPPDATA%\Programs\Python\Python310\pythonw.exe"
    goto :found_pythonw
)

REM No hay pythonw, buscar python normal
set PYTHON_CMD=
for %%C in (python py python3) do (
    %%C --version > nul 2>&1
    if not errorlevel 1 (
        set PYTHON_CMD=%%C
        goto :found_python
    )
)

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
echo Opciones:
echo 1. Ejecuta install_windows.bat para instalar todo automaticamente.
echo 2. Instala Python manualmente desde https://python.org
echo.
pause
exit /b 1

:found_pythonw
REM Ejecutar sin ventana de consola
%PYTHONW_CMD% app\install_gui.py
exit /b 0

:found_python
echo [OK] Python detectado: %PYTHON_CMD%
echo.
echo Iniciando instalador grafico...
echo.
%PYTHON_CMD% app\install_gui.py
