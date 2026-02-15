# Mail service test runner for Windows (uv veya pip ile)
# Kullanım: .\run_tests.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# uv varsa onu kullan
if (Get-Command uv -ErrorAction SilentlyContinue) {
    Write-Host "uv ile testler calistiriliyor..."
    uv sync --all-extras
    uv run pytest -v --cov=app
    exit $LASTEXITCODE
}

# uv yoksa pip ile dene
Write-Host "uv bulunamadi. pip ile deneniyor..."
pip install -e ".[dev]" 2>$null
python -m pytest -v --cov=app
exit $LASTEXITCODE
