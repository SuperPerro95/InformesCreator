@echo off
chcp 65001 > nul

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
