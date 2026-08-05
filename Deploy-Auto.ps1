# ============================================================
#   Deploy-Auto.ps1  -  Automatically push stamp website
#   Two strategies in one script:
#     A) If git.exe is installed/available -> add + commit + push
#     B) Otherwise -> run the pure-Node "deploy-gitless.js"
# ============================================================
param(
  [string]$CommitMsg = "🎨 UI Upgrade: Signature + Templates + Hexagon/Triangle + SEO + Grid Footer"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================"  -ForegroundColor Cyan
Write-Host "  🚀 Online Stamp Doc · Auto-Deploy Script"                   -ForegroundColor Cyan
Write-Host "============================================================"  -ForegroundColor Cyan
Write-Host ""

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

# ------------------------------------------------------------
# STEP 1 — Try to locate git.exe
# ------------------------------------------------------------
$gitExe = $null
foreach ($p in @(
  "$env:ProgramFiles\Git\cmd\git.exe",
  "${env:ProgramFiles(x86)}\Git\cmd\git.exe",
  "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe",
  "$env:ProgramW6432\Git\cmd\git.exe"
)) { if (Test-Path $p) { $gitExe = $p; break } }

if (-not $gitExe) {
  try {
    $c = Get-Command git -ErrorAction Stop
    $gitExe = $c.Source
  } catch { $gitExe = $null }
}

# ------------------------------------------------------------
# STRATEGY A — git.exe exists
# ------------------------------------------------------------
if ($gitExe) {
  Write-Host "✅ Found git.exe at:  $gitExe" -ForegroundColor Green
  Write-Host ""

  # Allow PowerShell script execution if npm requires it
  $pol = Get-ExecutionPolicy -Scope CurrentUser
  if ($pol -eq "Restricted") {
    Write-Host "⚙️  Lifting execution policy (CurrentUser -> RemoteSigned) so npm scripts work..." -ForegroundColor Yellow
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
  }

  Write-Host "  🗂️  git add -A"
  & $gitExe add -A

  Write-Host "  ✍️  git commit"
  & $gitExe -c user.name="madadkhan11111" -c user.email="madadkhan11111@users.noreply.github.com" commit --allow-empty-message -m $CommitMsg 2>&1 | Out-Host

  Write-Host "  📡 git push origin main"
  & $gitExe push origin main 2>&1 | Out-Host

  Write-Host ""
  Write-Host "🎉  PUSH COMPLETE via git.exe" -ForegroundColor Green
  Write-Host "   Live site:    https://onlinestampdoc.com/"
  Write-Host "   Repository:   https://github.com/madadkhan11111/stamp-website"
  exit 0
}

# ------------------------------------------------------------
# STRATEGY B — No git.exe → use deploy-gitless.js via Node
# ------------------------------------------------------------
Write-Host "⚠️  git.exe not found on this machine." -ForegroundColor Yellow
Write-Host "   Falling back to the pure-Node GitHub-API deploy script (deploy-gitless.js)." -ForegroundColor Yellow
Write-Host ""

# Ensure node.exe
try { $node = (Get-Command node -ErrorAction Stop).Source } catch {
  Write-Error "❌  Node.js not found. Please install Node.js first (LTS from https://nodejs.org/)."
  exit 1
}

# Make sure TOKEN is set
if (-not $env:GITHUB_TOKEN) {
  Write-Host ""
  Write-Host "❌  GITHUB_TOKEN is NOT set in your environment." -ForegroundColor Red
  Write-Host ""
  Write-Host "👉  Do this ONCE, then re-run this script:" -ForegroundColor Cyan
  Write-Host "   1. Open:  https://github.com/settings/tokens"
  Write-Host "   2. Generate NEW CLASSIC TOKEN  →  check the  ✅ repo  scope."
  Write-Host "   3. Run in this terminal:"
  Write-Host '         $env:GITHUB_TOKEN = "ghp_YourTokenHere"'
  Write-Host '         setx GITHUB_TOKEN "ghp_YourTokenHere"'
  Write-Host ""
  exit 2
}

Write-Host "▶️  Running:  node deploy-gitless.js  ..." -ForegroundColor Cyan
& $node (Join-Path $here "deploy-gitless.js")
exit $LASTEXITCODE
