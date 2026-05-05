@echo off
title InformesCreator - Inicializador
color 0B

echo ===================================================
echo     InformesCreator - Sistema de Informes Escolares
echo ===================================================
echo.

:: Verificar si Python esta instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no esta instalado o no esta en el PATH.
    echo Por favor instala Python 3.10+ desde python.org e intenta de nuevo.
    pause
    exit /b
)

:: Verificar entorno virtual
if not exist "venv\" (
    echo [INFO] Creando entorno virtual de Python...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] No se pudo crear el entorno virtual.
        pause
        exit /b
    )
)

:: Activar entorno e instalar requerimientos
echo [INFO] Activando entorno e instalando dependencias (esto puede tardar la primera vez)...
call venv\Scripts\activate
python -m pip install --upgrade pip >nul 2>&1

:: Instalar requerimientos
pip install -r requirements.txt >nul 2>&1

echo.
echo [INFO] Iniciando servidor web...
echo.
echo ===================================================
echo   Abre tu navegador en: http://localhost:8080
echo ===================================================
echo.

:: Iniciar FastAPI en el directorio app
cd app
python web\main.py

pause
