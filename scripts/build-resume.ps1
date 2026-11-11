# 把 resume-src/resume.html 渲染成 public/resume.pdf（A4、单页、无页眉页脚）
# 用法： .\scripts\build-resume.ps1
# 依赖：本机装了 Chrome / Edge（任一即可）；不需要额外安装任何东西
$ErrorActionPreference = 'Continue'

$root = Split-Path -Parent $PSScriptRoot
$src  = Join-Path $root 'resume-src\resume.html'
$dst  = Join-Path $root 'public\resume.pdf'

if (-not (Test-Path $src)) { Write-Host "找不到简历源文件：$src" -ForegroundColor Red; exit 1 }

$candidates = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
)
$browser = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { Write-Host "没找到 Chrome 或 Edge，装一个再跑" -ForegroundColor Red; exit 1 }

if (Test-Path $dst) { Remove-Item $dst -Force }
$url = 'file:///' + ($src -replace '\\', '/')
& $browser --headless=new --disable-gpu --no-pdf-header-footer "--print-to-pdf=$dst" $url 2>&1 | Out-Null
Start-Sleep -Milliseconds 1200

if (-not (Test-Path $dst)) { Write-Host "渲染失败，PDF 没生成" -ForegroundColor Red; exit 1 }
$size = (Get-Item $dst).Length
Write-Host ("简历已更新：public/resume.pdf  {0:N0} 字节" -f $size) -ForegroundColor Green
Write-Host "内容只有一页 A4；如果变两页，把 resume.html 里的字号或段落删一点再跑一次。"