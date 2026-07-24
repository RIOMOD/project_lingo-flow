$ErrorActionPreference = "Stop"

# Define base paths
$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $baseDir

# 6. Kiểm tra đường dẫn
$pwd = (Get-Location).Path
if ($pwd -match "[^\x00-\x7F]") {
    Write-Host "========================================================" -ForegroundColor Yellow
    Write-Host "CẢNH BÁO: Đường dẫn project chứa ký tự Unicode/Tiếng Việt." -ForegroundColor Yellow
    Write-Host "Đường dẫn hiện tại: $pwd" -ForegroundColor Yellow
    Write-Host "Maven hoặc Java có thể gặp lỗi classpath trên Windows với đường dẫn này." -ForegroundColor Yellow
    Write-Host "Khuyến nghị: Nên chuyển project sang đường dẫn không dấu (VD: C:\dev\project-lingo-flow)." -ForegroundColor Yellow
    Write-Host "Kịch bản vẫn sẽ chạy bằng cách copy JAR ra Temp." -ForegroundColor Yellow
    Write-Host "========================================================" -ForegroundColor Yellow
}

# 7. Kiểm tra biến môi trường .env
$envPath = Join-Path $baseDir ".env"
$envExamplePath = Join-Path $baseDir ".env.example"

if (-not (Test-Path $envPath)) {
    if (Test-Path $envExamplePath) {
        Write-Host "LỖI: backend/.env is missing." -ForegroundColor Red
        Write-Host "Copy backend/.env.example to backend/.env and configure the required values." -ForegroundColor Yellow
        exit 1
    }
}

# 2. Gọi stop-backend.ps1 trước khi build
$stopScript = Join-Path $baseDir "stop-backend.ps1"
if (Test-Path $stopScript) {
    Write-Host "Stopping running backend (if any)..." -ForegroundColor Cyan
    powershell -NoProfile -ExecutionPolicy Bypass -File $stopScript
}

# Change to backend directory for Maven
Set-Location $baseDir

# Xóa thư mục target nếu có
if (Test-Path "target") {
    Write-Host "Cleaning local target directory..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force "target" -ErrorAction SilentlyContinue
}

# 3. Chạy Maven Wrapper
Write-Host "Building project with Maven..." -ForegroundColor Cyan
$env:MAVEN_OPTS="-Dfile.encoding=UTF-8"
cmd.exe /c "mvnw.cmd clean package -DskipTests"
$exitCode = $LASTEXITCODE

# 4. Dừng ngay nếu Maven trả về exit code khác 0
if ($exitCode -ne 0) {
    Write-Host "Build failed with exit code $exitCode" -ForegroundColor Red
    exit $exitCode
}

# 5. Chỉ chọn executable JAR, loại bỏ các JAR không liên quan
$jarFile = Get-ChildItem -Path "target" -Filter "*-SNAPSHOT.jar" | Where-Object { 
    $_.Name -notmatch "\.original" -and 
    $_.Name -notmatch "-plain" -and 
    $_.Name -notmatch "-javadoc" -and 
    $_.Name -notmatch "-sources" 
} | Select-Object -First 1

if (-not $jarFile) {
    Write-Host "Cannot find executable JAR in target directory." -ForegroundColor Red
    exit 1
}

# Tạo thư mục chạy bên ngoài target
$runDir = "$env:TEMP\lingoflow-backend"
if (-not (Test-Path $runDir)) {
    New-Item -ItemType Directory -Force -Path $runDir | Out-Null
}

# 7. Copy executable JAR sang $env:TEMP\lingoflow-backend
$destJar = Join-Path $runDir $jarFile.Name
Write-Host "Copying executable JAR to safe location: $destJar" -ForegroundColor Cyan
Copy-Item $jarFile.FullName -Destination $destJar -Force

$pidFile = Join-Path $runDir "backend.pid"

Write-Host "Starting backend from safe location..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop." -ForegroundColor Yellow

# 8. Chạy Java từ bản JAR bên ngoài backend/target
# Sử dụng NoNewWindow để log in thẳng ra terminal (cho concurrently)
$process = Start-Process -FilePath "java" -ArgumentList "-jar", """$destJar""" -PassThru -NoNewWindow

# 9. Ghi PID backend vào file
$process.Id | Out-File -FilePath $pidFile -Encoding UTF8

try {
    # Block script until process exits (so concurrently knows it's running and can kill it)
    $process | Wait-Process
} finally {
    # 10. Khi backend dừng, xóa PID file
    if (Test-Path $pidFile) { 
        Remove-Item $pidFile -Force -ErrorAction SilentlyContinue 
    }
    
    # 11. Trả về exit code của process nếu nó lỗi
    if ($process.ExitCode -ne 0 -and $process.ExitCode -ne $null) {
        exit $process.ExitCode
    }
}
