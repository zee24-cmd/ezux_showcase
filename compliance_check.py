import os
import sys
import re

def check_frontend_compliance():
    print("Checking ezux-showcase Compliance (EzUX, i18n, RTL)...")
    errors = []
    
    # Check for EzLayout and EzProvider in App.tsx
    app_tsx = "/Users/zed/Documents/ezux-showcase/src/App.tsx"
    if os.path.exists(app_tsx):
        with open(app_tsx, 'r') as f:
            content = f.read()
            if 'EzProvider' not in content or 'EzLayout' not in content:
                errors.append("App.tsx missing mandatory EzProvider or EzLayout wrapping.")
    
    # Check components for non-standard imports and i18n bypass
    src_dir = "/Users/zed/Documents/ezux-showcase/src"
    for root, dirs, files in os.walk(src_dir):
        if "node_modules" in root or "dist" in root or "compliance_check.py" in root:
            continue
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                    
                    # EZUX BYPASS CHECK: Direct imports from ./ui/ instead of 'ezux'
                    if "from './ui/" in content or "from '../ui/" in content:
                        errors.append(f"{file}: Prohibited direct import from './ui/'. Use 'ezux' library.")
                    
                    # I18N BYPASS CHECK: Hardcoded strings in TSX (heuristic)
                    if file.endswith('.tsx') and "demos" not in root:
                        hardcoded = re.findall(r'>([^<{}\n\r]+)<', content)
                        for text in hardcoded:
                            text = text.strip()
                            if text and len(text) > 3 and not text.isdigit():
                                if text not in ['{', '}', '...', ':', 'loading...']:
                                    errors.append(f"{file}: Potential hardcoded string found: '{text}'. Use i18n.t().")

    return errors

def main():
    fe_errors = check_frontend_compliance()
    all_errors = fe_errors
    
    print("\n--- GOVERNANCE AUDIT SUMMARY ---")
    if not all_errors:
        print("✅ 100% COMPLIANCE DETECTED. TRUST RESTORED.")
        sys.exit(0)
    else:
        print(f"❌ {len(all_errors)} GOVERNANCE VIOLATIONS DETECTED:")
        for err in all_errors:
            print(f"  - {err}")
        sys.exit(1)

if __name__ == "__main__":
    main()
