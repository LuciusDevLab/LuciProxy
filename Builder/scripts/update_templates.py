import base64
import re
from pathlib import Path

def update_templates():
    base_dir = Path(__file__).resolve().parent.parent.parent
    dash_path = base_dir / "LuciProxy" / "src" / "assets" / "dashboard.html"
    tpl_path = base_dir / "LuciProxy" / "src" / "assets" / "templates.js"

    dash_bytes = dash_path.read_bytes()
    dash_b64 = base64.b64encode(dash_bytes).decode("ascii")

    content = tpl_path.read_text(encoding="utf-8")
    new_content = re.sub(
        r'const DASHBOARD_B64 = "[^"]*";',
        f'const DASHBOARD_B64 = "{dash_b64}";',
        content
    )
    tpl_path.write_text(new_content, encoding="utf-8")
    print(f"Updated templates.js: DASHBOARD_B64 length is {len(dash_b64)} chars.")

if __name__ == "__main__":
    update_templates()
