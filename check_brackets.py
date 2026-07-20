with open('src/app/branddashboard/page.tsx', 'r') as f:
    text = f.read()

def check(text):
    stack = []
    for i, c in enumerate(text):
        if c in '{[(<':
            stack.append((c, i))
        elif c in '}])>':
            if not stack:
                print(f"Unmatched {c} at {i}")
                return
            top, pos = stack.pop()
            # This is too naive for JSX/TSX
            # But let's just do a naive count of { }
            
    print(f"Braces: {text.count('{')} open, {text.count('}')} closed")
    print(f"Divs: {text.count('<div')} open, {text.count('</div')} closed")
check(text)
