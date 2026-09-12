with open('src/components/RealtimeAttendance.tsx', 'r') as f:
    content = f.read()

content = content.replace("    </div>\n  );\n};\n};\n  );\n", "    </div>\n  );\n};\n")
content = content.replace("      />\n    </div>\n};\n  );\n", "      />\n    </div>\n  );\n};\n")
content = content.replace("      />\n    </div>\n};\n  );", "      />\n    </div>\n  );\n};\n")
content = content.replace("      />\n    </div>\n};\n  );", "      />\n    </div>\n  );\n};\n")


with open('src/components/RealtimeAttendance.tsx', 'w') as f:
    f.write(content)
