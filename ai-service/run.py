"""
Entrypoint to run CloudGuard AI Anomaly Service on port 8000.
"""

import sys
import os

# Add directory to python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import uvicorn
    from app.main import app
    if app is not None:
        print("[CloudGuard AI] Starting FastAPI Server with Uvicorn on http://127.0.0.1:8000...")
        uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
    else:
        raise ImportError("FastAPI app is None")
except ImportError:
    from http.server import HTTPServer
    from app.main import FallbackHTTPHandler
    server_address = ('127.0.0.1', 8000)
    httpd = HTTPServer(server_address, FallbackHTTPHandler)
    print("====================================================")
    print("[CloudGuard AI] Starting AI Service on http://127.0.0.1:8000")
    print("REST Endpoints available:")
    print("  GET  /health")
    print("  POST /analyze")
    print("  GET  /rules")
    print("====================================================")
    httpd.serve_forever()
