#!/usr/bin/env python3
"""
InformesCreator - Servidor Web (FastAPI)

Uso:
    python web/main.py
    uvicorn web.main:app --host 0.0.0.0 --port 8080 --reload
"""

import os
import socket
import sys
import webbrowser
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# Agregar raíz del proyecto al path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from web.api.routes import router as api_router


def get_local_ip():
    """Obtiene la IP local para compartir en la red."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0)
        try:
            s.connect(('10.254.254.254', 1))
            ip = s.getsockname()[0]
        except Exception:
            ip = '127.0.0.1'
        finally:
            s.close()
        return ip
    except Exception:
        return '127.0.0.1'


@asynccontextmanager
async def lifespan(app: FastAPI):
    local_ip = get_local_ip()
    print("\n" + "=" * 60)
    print("  InformesCreator Web iniciado")
    print("=" * 60)
    print(f"  Local:    http://localhost:8080")
    print(f"  Red:      http://{local_ip}:8080")
    print("=" * 60)
    try:
        webbrowser.open("http://localhost:8080")
    except Exception:
        pass
    yield


app = FastAPI(
    title="InformesCreator API",
    description="API para generación de informes de avance escolares",
    version="0.5.0",
    lifespan=lifespan,
)

# Montar API en /api
app.include_router(api_router, prefix="/api")

# Montar archivos estáticos (frontend SPA)
static_dir = Path(__file__).resolve().parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("web.main:app", host="0.0.0.0", port=8080, reload=True)
