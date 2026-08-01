import sys
p = 'ChordMindMapB.tsx'
c = open(p, encoding='utf-8').read()
old = ".scaleExtent([0.15, 4])\n      .on('zoom', (event) => {"
new = ".scaleExtent([0.15, 4])\n      .filter((event) => {\n        const target = event.target as Element;\n        return !target.closest || !target.closest('.main-node');\n      })\n      .on('zoom', (event) => {"
if old in c:
    c = c.replace(old, new, 1)
    open(p, 'w', encoding='utf-8').write(c)
    print('Replaced successfully')
else:
    print('Pattern not found')
    idx = c.find('scaleExtent')
    if idx >= 0:
        print(repr(c[idx-10:idx+80]))