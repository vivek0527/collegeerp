with open('src/components/portals/AcademicCalendarManager.tsx', 'r') as f:
    text = f.read()

brace_level = 0
for i, char in enumerate(text):
    if char == '{':
        brace_level += 1
    elif char == '}':
        brace_level -= 1
        if brace_level < 0:
            print(f"Negative brace level at index {i}")

print(f"Final brace level: {brace_level}")
