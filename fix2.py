with open('src/components/RealtimeAttendance.tsx', 'r') as f:
    content = f.read()

content = content.replace('                    </tr>\n                })', '                    </tr>\n                  );\n                })')

with open('src/components/RealtimeAttendance.tsx', 'w') as f:
    f.write(content)
