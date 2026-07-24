@echo off
setlocal EnableDelayedExpansion

set "BASE_DIR=%~dp0"
set "WRAPPER_DIR=%BASE_DIR%.mvn\wrapper"
set "DIST_DIR=%WRAPPER_DIR%\dists\apache-maven-3.9.9"
set "MAVEN_CMD=%DIST_DIR%\bin\mvn.cmd"
set "MAVEN_ZIP=%WRAPPER_DIR%\apache-maven-3.9.9-bin.zip"
set "MAVEN_URL=https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip"
set "IDEA_MAVEN=C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.2\plugins\maven\lib\maven3\bin\mvn.cmd"

if exist "%IDEA_MAVEN%" (
  call "%IDEA_MAVEN%" %*
  exit /b !ERRORLEVEL!
)

if not exist "%MAVEN_CMD%" (
  if not exist "%WRAPPER_DIR%" mkdir "%WRAPPER_DIR%"
  if not exist "%MAVEN_ZIP%" (
    echo Downloading Maven 3.9.9...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Invoke-WebRequest -Uri '%MAVEN_URL%' -OutFile '%MAVEN_ZIP%'"
    if errorlevel 1 exit /b 1
  )

  if exist "%DIST_DIR%" rmdir /s /q "%DIST_DIR%"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Expand-Archive -LiteralPath '%MAVEN_ZIP%' -DestinationPath '%WRAPPER_DIR%\dists' -Force"
  if errorlevel 1 exit /b 1
)

call "%MAVEN_CMD%" %*
exit /b !ERRORLEVEL!
