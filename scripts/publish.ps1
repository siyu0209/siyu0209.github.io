# 一键发布到 GitHub Pages（公网可访问，不依赖本机）
#
# 做法（与真实可用的流程一致）：
#   1. 用令牌确认账号，仓库不存在就创建公开仓库；
#   2. 按部署形态构建（仓库名是 <用户名>.github.io 时用根路径，否则用 /<仓库名>/ 前缀）；
#   3. 源码提交到 main 分支；
#   4. 构建产物 dist/ 单独提交到 gh-pages 分支（这样仓库里不会混进构建结果）；
#   5. 把 Pages 的发布源指向 gh-pages，触发构建并等待完成。
#
# 用法：
#   .\scripts\publish.ps1 -Token ghp_xxxxxxxx
#   .\scripts\publish.ps1 -Token ghp_xxxxxxxx -Repo siyu0209.github.io
#
# 令牌权限：classic 勾 repo；fine-grained 需 Contents: Read and write + Pages: Read and write + Administration: Read and write。

param(
  [string]$Token = $env:GITHUB_TOKEN,
  [string]$Repo = 'siyu0209.github.io'
)

# git 会把进度写到 stderr，PowerShell 5.1 在 Stop 模式下会把它当成错误中断脚本，
# 所以这里用 Continue，改由 $LASTEXITCODE 判断成败。
$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

if (-not $Token) {
  Write-Host '缺少令牌。用法： .\scripts\publish.ps1 -Token <你的 GitHub 令牌>' -ForegroundColor Yellow
  Write-Host '令牌在这里生成： https://github.com/settings/tokens' -ForegroundColor Yellow
  exit 1
}

$api = 'https://api.github.com'
$headers = @{
  Authorization          = "Bearer $Token"
  Accept                 = 'application/vnd.github+json'
  'X-GitHub-Api-Version' = '2022-11-28'
  'User-Agent'           = 'zhoutao-portfolio-publish'
}

# 调 GitHub API：手工用 UTF-8 字节发 JSON，避免 Invoke-RestMethod 的编码坑
function Invoke-GitHub {
  param([string]$Method, [string]$Path, [string]$Json)
  $url = "$api$Path"
  try {
    if ($Json) {
      $bytes = [Text.Encoding]::UTF8.GetBytes($Json)
      $r = Invoke-WebRequest -Uri $url -Method $Method -Headers $headers -Body $bytes -ContentType 'application/json; charset=utf-8' -UseBasicParsing
    } elseif ($Method -eq 'GET') {
      $r = Invoke-WebRequest -Uri $url -Method Get -Headers $headers -UseBasicParsing
    } else {
      $r = Invoke-WebRequest -Uri $url -Method $Method -Headers $headers -UseBasicParsing
    }
    return @{ ok = $true; status = [int]$r.StatusCode; body = $r.Content }
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      $code = [int]$resp.StatusCode
      $text = ''
      try { $text = (New-Object IO.StreamReader($resp.GetResponseStream())).ReadToEnd() } catch { }
      return @{ ok = $false; status = $code; body = $text }
    }
    return @{ ok = $false; status = 0; body = $_.Exception.Message }
  }
}

# ---------- 1. 确认账号 ----------
Write-Host '[1/5] 校验令牌…' -ForegroundColor Cyan
$me = Invoke-GitHub -Method 'GET' -Path '/user'
if (-not $me.ok) {
  Write-Host "      令牌无效或权限不足：HTTP $($me.status) $($me.body)" -ForegroundColor Red
  exit 1
}
$owner = ($me.body | ConvertFrom-Json).login
Write-Host "      账号：$owner"

# ---------- 2. 确保仓库存在 ----------
$repoInfo = Invoke-GitHub -Method 'GET' -Path "/repos/$owner/$Repo"
if ($repoInfo.ok) {
  Write-Host "      仓库 $owner/$Repo 已存在"
} else {
  Write-Host "      创建仓库 $owner/$Repo（公开）…"
  $payload = '{"name":"' + $Repo + '","private":false,"auto_init":false}'
  $created = Invoke-GitHub -Method 'POST' -Path '/user/repos' -Json $payload
  if (-not $created.ok) {
    Write-Host "      建仓库失败：HTTP $($created.status) $($created.body)" -ForegroundColor Red
    exit 1
  }
  Write-Host '      已创建'
}

# 仓库名等于 <用户名>.github.io 时，Pages 走用户站点根路径，网址不带仓库名
if ($Repo -ieq "$owner.github.io") {
  $basePath = '/'
  $siteUrl = "https://$owner.github.io/"
} else {
  $basePath = "/$Repo/"
  $siteUrl = "https://$owner.github.io/$Repo/"
}

$projectRoot = Split-Path $PSScriptRoot -Parent
Push-Location $projectRoot

try {
  # ---------- 3. 构建 ----------
  Write-Host "[2/5] 构建（base = $basePath）…" -ForegroundColor Cyan
  $env:BASE_PATH = $basePath
  $env:VITE_SITE_URL = "https://$owner.github.io"
  npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw "构建失败（退出码 $LASTEXITCODE）" }
  if (-not (Test-Path 'dist/index.html')) { throw '构建产物里没有 dist/index.html' }

  $remote = "https://x-access-token:$Token@github.com/$owner/$Repo.git"
  $gitId = @('-c', 'user.name=zhoutao', '-c', 'user.email=zhoutao@users.noreply.github.com')

  # ---------- 4. 源码推到 main ----------
  Write-Host '[3/5] 提交源码到 main…' -ForegroundColor Cyan
  if (-not (Test-Path '.git')) { git init -b main 2>&1 | Out-Null }
  git add -A 2>&1 | Out-Null
  git @gitId commit -m "deploy: 更新源码 $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>&1 | Out-Null
  git branch -M main 2>&1 | Out-Null

  $remotes = git remote 2>$null
  if ($remotes -contains 'origin') { git remote set-url origin $remote 2>&1 | Out-Null }
  else { git remote add origin $remote 2>&1 | Out-Null }

  git push -u origin main 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "推送 main 失败（退出码 $LASTEXITCODE）" }
  # 推完立刻把令牌从 .git/config 抹掉
  git remote set-url origin "https://github.com/$owner/$Repo.git" 2>&1 | Out-Null

  # ---------- 5. 构建产物推到 gh-pages ----------
  Write-Host '[4/5] 提交构建产物到 gh-pages…' -ForegroundColor Cyan
  Push-Location 'dist'
  try {
    if (-not (Test-Path '.git')) { git init -b gh-pages 2>&1 | Out-Null }
    git @gitId add -A 2>&1 | Out-Null
    git @gitId commit -m "build: 静态产物 $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>&1 | Out-Null
    git branch -M gh-pages 2>&1 | Out-Null
    $distRemotes = git remote 2>$null
    if ($distRemotes -contains 'origin') { git remote set-url origin $remote 2>&1 | Out-Null }
    else { git remote add origin $remote 2>&1 | Out-Null }

    git push --force origin gh-pages 2>&1 | Out-Null
    $pushCode = $LASTEXITCODE
    git remote set-url origin "https://github.com/$owner/$Repo.git" 2>&1 | Out-Null
    if ($pushCode -ne 0) { throw "推送 gh-pages 失败（退出码 $pushCode）" }
  } finally {
    Pop-Location
  }

  # ---------- 6. 指定 Pages 发布源并等待构建 ----------
  Write-Host '[5/5] 开启 GitHub Pages…' -ForegroundColor Cyan
  $pagesBody = '{"source":{"branch":"gh-pages","path":"/"}}'
  $put = Invoke-GitHub -Method 'PUT' -Path "/repos/$owner/$Repo/pages" -Json $pagesBody
  if (-not $put.ok -and $put.status -eq 404) {
    # Pages 还没初始化：先 POST 建站，再 PUT 改发布源
    Invoke-GitHub -Method 'POST' -Path "/repos/$owner/$Repo/pages" -Json $pagesBody | Out-Null
    $put = Invoke-GitHub -Method 'PUT' -Path "/repos/$owner/$Repo/pages" -Json $pagesBody
  }
  if (-not $put.ok) {
    Write-Host "      设置发布源失败：HTTP $($put.status) $($put.body)" -ForegroundColor Yellow
    Write-Host '      请到仓库 Settings → Pages，把 Source 设为 gh-pages / (root)' -ForegroundColor Yellow
  }

  Invoke-GitHub -Method 'POST' -Path "/repos/$owner/$Repo/pages/builds" | Out-Null

  # 轮询构建状态，最多等 120 秒
  $state = 'queued'
  for ($i = 0; $i -lt 24; $i++) {
    Start-Sleep -Seconds 5
    $latest = Invoke-GitHub -Method 'GET' -Path "/repos/$owner/$Repo/pages/builds/latest"
    if (-not $latest.ok) { continue }
    $build = $latest.body | ConvertFrom-Json
    $state = $build.status
    Write-Host "      构建状态：$state"
    if ($state -eq 'built') { break }
    if ($state -eq 'errored') {
      Write-Host "      构建报错：$($build.error.message)" -ForegroundColor Red
      break
    }
  }
} catch {
  Write-Host "      出错：$($_.Exception.Message)" -ForegroundColor Red
  Pop-Location
  exit 1
}

Pop-Location

Write-Host ''
if ($state -eq 'built') {
  Write-Host '发布完成，现在可以访问：' -ForegroundColor Green
} else {
  Write-Host '已推送，GitHub 还在构建（通常 1–2 分钟），稍后访问：' -ForegroundColor Yellow
}
Write-Host "  $siteUrl" -ForegroundColor Green
