@echo off
chcp 65001 > nul
echo ============================================
echo   InformesCreator - Instalador Grafico
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
echo El instalador grafico necesita Python para ejecutarse.
echo.
echo Opciones:
echo 1. Ejecuta install_windows.bat para instalar todo automaticamente.
echo 2. Instala Python manualmente desde https://python.org
echo.
pause
exit /b 1

:found_python
echo [OK] Python detectado: %PYTHON_CMD%
echo.
echo Iniciando instalador grafico...
echo.
%PYTHON_CMD% app\install_gui.py

pause
