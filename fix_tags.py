import re

with open('src/components/portals/AcademicCalendarManager.tsx', 'r') as f:
    lines = f.readlines()

# We will just print out the lines with indentation to spot the mismatch.
indent = 0
for i, line in enumerate(lines):
    clean = line.strip()
    if clean.startswith('return ('):
        print(f"--- START JSX at {i+1}")
        indent = 0
        
    opens = len(re.findall(r'<\w+[^>]*>$', clean)) + len(re.findall(r'<\w+[^>]*\s+[^>]*>$', clean)) 
    # Actually regex for HTML tags is hard, let's just count <div and </div
    div_opens = line.count('<div')
    div_closes = line.count('</div')
    
    if div_opens > 0 or div_closes > 0:
        indent_str = "  " * indent
        # print(f"{i+1:4d}: {indent_str} +{div_opens} -{div_closes} {clean[:40]}")
        indent += div_opens
        indent -= div_closes
        if indent < 0:
            print(f"NEGATIVE INDENT at line {i+1}: {clean}")
            
print(f"Final indent: {indent}")

