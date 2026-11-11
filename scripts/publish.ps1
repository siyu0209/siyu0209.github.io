<#
.SYNOPSIS
  一键把本站发布到 GitHub Pages（公网可访问，不需要本机常开）。

.DESCRIPTION
  做四件事：
    1. 用令牌确认账号，仓库不存在就自动创建（公开仓库）；
    2. 构建：仓库名是 <用户名>.github.io 时按根路径构建，否则按 /<仓库名>/ 前缀构建；
    3. 初始化 git 并推送到 main；
    4. 打开仓库的 Pages 服务，输出最终网址。

.PARAMETER Token
  GitHub 个人访问令牌（classic 勾 repo，或 fine-grained 勾 Administration: Read and write + Contents: Read and write）。
  也可以先设置环境变量 $env:GITHUB_TOKEN 再省略此参数。

.PARAMETER Repo
  仓库名，默认 portfolio，最终网址 https://<用户名>.github.io/<仓库名>/
  如果希望网址是 https://<用户名>.github.io/（不带仓库名，推荐），把仓库名写成 <用户名>.github.io

.EXAMPLE
  .\scripts\publish.ps1 -Token ghp_xxxxxxxx
  .\scripts\publish.ps1 -Token ghp_xxxxxxxx -Repo siyu0209.github.io
#>
param(
  [string]$Token = $env:GITHUB_TOKEN,
  [string]$Repo = 'portfolio'
)

$ErrorActionPreference = 'Stop'

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

# ---------- 1. 确认账号 ----------
Write-Host '[1/4] 校验令牌…' -ForegroundColor Cyan
$me = Invoke-RestMethod -Uri "$api/user" -Headers $headers
$owner = $me.login
Write-Host "      账号：$owner"

# ---------- 2. 确保仓库存在 ----------
$repoExists = $true
try {
  Invoke-RestMethod -Uri "$api/repos/$owner/$Repo" -Headers $headers | Out-Null
  Write-Host "      仓库 $owner/$Repo 已存在"
} catch {
  $repoExists = $false
}

if (-not $repoExists) {
  Write-Host "      创建仓库 $owner/$Repo（公开）…"
  $body = @{ name = $Repo; private = $false; auto_init = $false } | ConvertTo-Json
  Invoke-RestMethod -Uri "$api/user/repos" -Method Post -Headers $headers -Body $body | Out-Null
}

# 仓库名等于 <用户名>.github.io 时，Pages 走用户站点根路径，网址不带仓库名
if ($Repo -ieq "$owner.github.io") {
  $basePath = '/'
  $siteUrl = "https://$owner.github.io/"
} else {
  $basePath = "/$Repo/"
  $siteUrl = "https://$owner.github.io/$Repo/"
}

# ---------- 3. 按部署形态构建 ----------
Write-Host "[2/4] 构建（base = $basePath）…" -ForegroundColor Cyan
Push-Location (Split-Path $PSScriptRoot -Parent)
try {
  $env:BASE_PATH = $basePath
  $env:VITE_SITE_URL = "https://$owner.github.io"
  npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw "构建失败（退出码 $LASTEXITCODE）" }

  # ---------- 4. 推送 ----------
  Write-Host '[3/4] 推送到 GitHub…' -ForegroundColor Cyan
  if (-not (Test-Path .git)) { git init | Out-Null }
  git add -A
  git commit -m "deploy: 发布作品集 $(Get-Date -Format 'yyyy-MM-dd HH:mm')" | Out-Null
  git branch -M main

  $remote = "https://x-access-token:$Token@github.com/$owner/$Repo.git"
  $existing = git remote 2>$null
  if ($existing -contains 'origin') {
    git remote set-url origin $remote
  } else {
    git remote add origin $remote
  }
  git push -u origin main --force
  if ($LASTEXITCODE -ne 0) { throw "推送失败（退出码 $LASTEXITCODE）" }

  # 推完把令牌从 .git/config 里抹掉，只留普通地址
  git remote set-url origin "https://github.com/$owner/$Repo.git"

  # ---------- 5. 打开 Pages ----------
  Write-Host '[4/4] 开启 GitHub Pages…' -ForegroundColor Cyan
  $pagesBody = @{ source = @{ branch = 'main'; path = '/' } } | ConvertTo-Json -Depth 4
  try {
    Invoke-RestMethod -Uri "$api/repos/$owner/$Repo/pages" -Method Post -Headers $headers -Body $pagesBody | Out-Null
    Write-Host '      Pages 已开启'
  } catch {
    # 已经开过会返回 409，直接重新触发一次构建即可
    try {
      Invoke-RestMethod -Uri "$api/repos/$owner/$Repo/pages/builds" -Method Post -Headers $headers | Out-Null
      Write-Host '      Pages 已在运行，已触发重新构建'
    } catch {
      Write-Host '      提示：请在仓库 Settings → Pages 里把 Source 设为 main 分支根目录' -ForegroundColor Yellow
    }
  }
} finally {
  Pop-Location
}

Write-Host ''
Write-Host "发布完成，1–2 分钟后可访问：" -ForegroundColor Green
Write-Host "  $siteUrl" -ForegroundColor Green
