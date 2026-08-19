# Garante que existe um .env na raiz com um JWT_SECRET valido.
# Idempotente: se o .env ja existe, nao mexe nele (nao troca o segredo a toa,
# senao toda sessao ativa cairia). So gera na primeira vez.

$raiz = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $raiz ".env"

if (Test-Path $envPath) {
    Write-Output ".env ja existe em $envPath - nada a fazer."
    exit 0
}

$bytes = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$segredo = [Convert]::ToBase64String($bytes)

@"
# Gerado automaticamente por scripts/setup-env.ps1 - nao versionar.
JWT_SECRET=$segredo
"@ | Set-Content -Path $envPath -NoNewline

Write-Output "Criado $envPath com um JWT_SECRET novo."
