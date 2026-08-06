with open("src/app/branddashboard/page.tsx", "r") as f:
    text = f.read()

start = text.find('<div id="approval-queue-section"')
end = text.find('{/* Create Invoice Modal */}', start)
if end != -1:
    end = text.rfind('</div>', start, end) + 6
    print(text[end-20:end+20])
else:
    print("Not found")
