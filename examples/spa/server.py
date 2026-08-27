"""Dev server for the vUX SPA example.

Run:  python3 server.py   then open http://localhost:8931/

Provides the three things the example needs and a real deployment must provide too:
- SPA history fallback: unknown non-file paths serve index.html
- the vUX library exposed at /lib/vUX/ (mapped to the repo root, two levels up)
- the shared example stylesheet at /shared/ (mapped to examples/shared/)
- no-store cache headers, plus simulated latency on /display/ fragments so the
  progress indicator is visible
"""
import http.server, os, time

ROOT = os.path.dirname(os.path.abspath(__file__))
LIB_PREFIX = "/lib/vUX/"
LIB_ROOT = os.path.abspath(os.path.join(ROOT, "..", ".."))  # the vUX repo root
SHARED_PREFIX = "/shared/"
SHARED_ROOT = os.path.abspath(os.path.join(ROOT, "..", "shared"))  # examples/shared

class SPAFallbackHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        clean = path.split("?", 1)[0].split("#", 1)[0]
        if clean.startswith(LIB_PREFIX):
            return os.path.join(LIB_ROOT, *clean[len(LIB_PREFIX):].split("/"))
        if clean.startswith(SHARED_PREFIX):
            return os.path.join(SHARED_ROOT, *clean[len(SHARED_PREFIX):].split("/"))
        return super().translate_path(path)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        # simulate real-network latency on route fragments so the progress bar is visible
        if self.path.startswith("/display/"):
            time.sleep(0.7)
        super().do_GET()

    def send_head(self):
        path = self.translate_path(self.path)
        # SPA fallback: unknown non-file paths serve index.html
        if not os.path.exists(path) or (os.path.isdir(path) and not os.path.exists(os.path.join(path, "index.html"))):
            self.path = "/index.html"
        return super().send_head()

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args), flush=True)

if __name__ == "__main__":
    os.chdir(ROOT)
    print("Serving vUX SPA example on http://localhost:8931/")
    http.server.ThreadingHTTPServer(("0.0.0.0", 8931), SPAFallbackHandler).serve_forever()
