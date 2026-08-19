# Roda o backend localmente (sem Docker), gerando o .env na primeira vez
# e exportando o JWT_SECRET de la pro processo do Maven.

$raiz = Split-Path -Parent $PSScriptRoot
& (Join-Path $raiz "scripts\setup-env.ps1")

$envPath = Join-Path $raiz ".env"
Get-Content $envPath | Where-Object { $_ -match '^[A-Z_]+=' } | ForEach-Object {
    $chave, $valor = $_ -split '=', 2
    [System.Environment]::SetEnvironmentVariable($chave, $valor, "Process")
}

Set-Location $PSScriptRoot
mvn spring-boot:run
