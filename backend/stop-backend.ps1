$ErrorActionPreference = "SilentlyContinue"

$runDir = "$env:TEMP\lingoflow-backend"
$pidFile = Join-Path $runDir "backend.pid"
$stopped = $false

# 1. Đọc PID từ file
if (Test-Path $pidFile) {
    $pidStr = Get-Content $pidFile
    if ($pidStr -match '^\d+$') {
        $processId = [int]$pidStr
        # Kiểm tra xem process có tồn tại và là java.exe không
        $process = Get-CimInstance Win32_Process -Filter "ProcessId = $processId"
        if ($process -and $process.Name -match "java") {
            # 2. Dừng process đó
            Write-Host "Stopping backend process PID: $processId (from pidfile)" -ForegroundColor Cyan
            Stop-Process -Id $processId -Force
            $stopped = $true
            # 6. Chờ process thoát
            while (Get-Process -Id $processId -ErrorAction SilentlyContinue) {
                Start-Sleep -Milliseconds 500
            }
        }
    }
    # 7. Xóa PID file cũ
    Remove-Item $pidFile -Force
}

# 3. Nếu chưa dừng được từ PID file, tìm kiếm qua WMI
if (-not $stopped) {
    $targetName1 = "english-learning-backend"
    $targetName2 = "com.example.englishlearning.EnglishLearningApplication"
    
    $processes = Get-CimInstance Win32_Process -Filter "Name = 'java.exe'" | Where-Object { 
        $_.CommandLine -match $targetName1 -or $_.CommandLine -match $targetName2 
    }

    if ($processes) {
        foreach ($p in $processes) {
            Write-Host "Stopping backend process PID: $($p.ProcessId) (from WMI)" -ForegroundColor Cyan
            Stop-Process -Id $p.ProcessId -Force
            # 6. Chờ process thoát
            while (Get-Process -Id $p.ProcessId -ErrorAction SilentlyContinue) {
                Start-Sleep -Milliseconds 500
            }
        }
    } else {
        # 8. Không báo lỗi khi backend chưa chạy
        Write-Host "No backend process found running." -ForegroundColor Gray
    }
}

# Cleanup các file log và tmp cũ trong target nếu còn sót
if (Test-Path "target\*.original") { Remove-Item "target\*.original" -Force }
if (Test-Path "target\*.tmp") { Remove-Item "target\*.tmp" -Force }
if (Test-Path "target\*.log") { Remove-Item "target\*.log" -Force }

Write-Host "Backend stopped." -ForegroundColor Green
