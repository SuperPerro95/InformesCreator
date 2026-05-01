@echo off
chcp 65001 > nul
echo ============================================
echo   InformesCreator v0.5.3 - Instalador
echo ============================================
echo.

setlocal enabledelayedexpansion

REM ============================================================
REM 1. DETECTAR PYTHON
REM ============================================================
echo [1/2] Verificando Python...

set PYTHON_CMD=
set PYTHONW_CMD=

for %%C in (python py python3) do (
    %%C --version > nul 2>&1
    if not errorlevel 1 (
        set PYTHON_CMD=%%C
        goto :found_python
    )
)

REM Buscar en ubicaciones por defecto (ordenado por mas reciente)
for %%V in (313 312 311 310) do (
    if exist "%LOCALAPPDATA%\Programs\Python\Python%%V\python.exe" (
        set "PYTHON_CMD=%LOCALAPPDATA%\Programs\Python\Python%%V\python.exe"
        set "PYTHONW_CMD=%LOCALAPPDATA%\Programs\Python\Python%%V\pythonw.exe"
        goto :found_python
    )
)

echo [INFO] Python no esta instalado. Descargando e instalando Python 3.12.9...
echo.

curl -L -o python_installer.exe "https://www.python.org/ftp/python/3.12.9/python-3.12.9-amd64.exe" > nul 2>&1
if errorlevel 1 (
    echo [ERROR] No se pudo descargar Python.
    echo Descargalo manualmente desde: https://python.org/downloads
    echo Asegurate de marcar "Add Python to PATH" durante la instalacion.
    pause
    exit /b 1
)

echo [OK] Instalador descargado. Instalando silenciosamente...
echo Esto puede tomar unos minutos...

python_installer.exe /quiet InstallAllUsers=0 PrependPath=1 Include_test=0 TargetDir="%LOCALAPPDATA%\Programs\Python\Python312"
if errorlevel 1 (
    echo [ERROR] Fallo la instalacion de Python.
    pause
    exit /b 1
)

del python_installer.exe > nul 2>&1

set "PATH=%LOCALAPPDATA%\Programs\Python\Python312;%LOCALAPPDATA%\Programs\Python\Python312\Scripts;%PATH%"
set "PYTHON_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
set "PYTHONW_CMD=%LOCALAPPDATA%\Programs\Python\Python312\pythonw.exe"
echo [OK] Python instalado.
echo.

:found_python
%PYTHON_CMD% --version
echo.

REM ============================================================
REM 2. LANZAR INSTALADOR GRAFICO
REM ============================================================
echo [2/2] Iniciando instalador grafico...
echo.

if defined PYTHONW_CMD (
    if exist "%PYTHONW_CMD%" (
        start "" "%PYTHONW_CMD%" app\install_gui.py
        exit /b 0
    )
)

REM Fallback: usar python normal (mostrara la terminal)
start "" "%PYTHON_CMD%" app\install_gui.py
exit /b 0
