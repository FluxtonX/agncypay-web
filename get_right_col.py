with open("src/app/branddashboard/page.tsx", "r") as f:
    text = f.read()

start = text.find('<div id="approval-queue-section"')
end = text.find('{/* Embedded Checkout Modal */}', start)
if end != -1:
    # go back until the closing div of approval-queue-section
    end = text.rfind('</div>', start, end) + 6
    print(f"Start: {start}, End: {end}")
    print(text[end-20:end+20])
else:
    print("Not found")
