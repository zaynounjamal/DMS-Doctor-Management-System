@echo off
(
  echo Running git commands...
  git checkout -b feature/doctor-dashboard-enhancements
  git add .
  git commit -m "Enhance doctor dashboard: icons, colors, and live background"
  git push -u origin feature/doctor-dashboard-enhancements
) > git_output.txt 2>&1
