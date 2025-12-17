@echo off
(
  echo --- git status ---
  git status
  echo.
  echo --- git pull origin master ---
  git pull origin master
) > git_sync_output.txt 2>&1
