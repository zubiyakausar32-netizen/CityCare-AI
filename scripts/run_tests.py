import subprocess
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

if __name__ == '__main__':
    result = subprocess.run([sys.executable, '-m', 'pytest', 'backend/tests', '-q'], cwd=str(ROOT_DIR))
    raise SystemExit(result.returncode)
