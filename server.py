#!/usr/bin/env python3
"""
HTTP Server for Youssef Ali's Portfolio & Admin Dashboard.
Supports /admin direct URL route, direct section URLs (/projects, etc.),
and authentic file downloads for Youssef_Ali_CV (1).docx.
Run:
    python3 server.py [port]
Defaults to port 8000.
"""

import http.server
import socketserver
import sys
import os
import json
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

SECTION_ROUTES = {'/projects', '/about', '/skills', '/education', '/languages', '/contact', '/home'}
ADMIN_ROUTES = {'/admin', '/admin.html'}

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        url_parts = urllib.parse.urlparse(self.path)
        clean_path = url_parts.path.rstrip('/')
        
        # 1. Direct admin and section routes serve index.html with 200 OK
        if clean_path in ADMIN_ROUTES or clean_path in SECTION_ROUTES:
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            with open('index.html', 'rb') as f:
                self.wfile.write(f.read())
            return

        # 2. Dedicated CV download endpoint
        if clean_path in ('/download-cv', '/cv-download'):
            cv_path = os.path.join('assets', 'Youssef_Ali_CV (1).docx')
            if not os.path.exists(cv_path):
                cv_path = 'Youssef_Ali_CV (1).docx'
            if os.path.exists(cv_path):
                self.send_response(200)
                self.send_header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                self.send_header('Content-Disposition', 'attachment; filename="Youssef_Ali_CV (1).docx"')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                with open(cv_path, 'rb') as f:
                    self.wfile.write(f.read())
                return

        # 3. Direct access to CV asset with forced attachment headers
        unquoted_path = urllib.parse.unquote(url_parts.path)
        if 'Youssef_Ali_CV' in unquoted_path and unquoted_path.endswith('.docx'):
            local_file = unquoted_path.lstrip('/')
            if not os.path.exists(local_file):
                local_file = os.path.join('assets', 'Youssef_Ali_CV (1).docx')
            if os.path.exists(local_file):
                self.send_response(200)
                self.send_header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                self.send_header('Content-Disposition', 'attachment; filename="Youssef_Ali_CV (1).docx"')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                with open(local_file, 'rb') as f:
                    self.wfile.write(f.read())
                return

        return super().do_GET()

    def do_POST(self):
        clean_path = self.path.split('?')[0].rstrip('/')
        if clean_path in ('/api/admin/login', '/api/login'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "authenticated": True}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"[*] Portfolio Server running at http://localhost:{PORT}/")
        print(f"[*] Direct Admin Dashboard: http://localhost:{PORT}/admin")
        print(f"[*] Direct Section Route: http://localhost:{PORT}/projects")
        print(f"[*] Press Ctrl+C to terminate server.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
