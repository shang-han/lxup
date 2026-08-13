[CmdletBinding()]
param(
    [string]$OutputDirectory = (Join-Path (Split-Path $PSScriptRoot -Parent) "deliverables")
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path $PSScriptRoot -Parent
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$packageName = "LXUP"
$stageRoot = Join-Path $OutputDirectory $packageName
$archivePath = Join-Path $OutputDirectory "LXUP-Portable-$stamp.zip"

if (Test-Path -LiteralPath $stageRoot) {
    throw "Staging directory already exists: $stageRoot"
}
if (Test-Path -LiteralPath $archivePath) {
    throw "Archive already exists: $archivePath"
}
if (-not (Get-Command tar.exe -ErrorAction SilentlyContinue)) {
    throw "tar.exe is required to create the ZIP archive."
}

New-Item -ItemType Directory -Path $stageRoot | Out-Null

$launcherExe = Get-ChildItem -LiteralPath $projectRoot -File -Filter "LXUP*.exe" |
    Where-Object { $_.Name -notmatch "1\.exe$" } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
if (-not $launcherExe) {
    throw "Launcher executable is missing from project root."
}
Copy-Item -LiteralPath $launcherExe.FullName -Destination $stageRoot

foreach ($file in @(
    "launcher_gui.py",
    "LXUP-icon.ico",
    "README.md",
    "start-all.bat",
    "start-hermes.bat",
    "stop-all.bat",
    "bootstrap-openclaw.bat",
    "bootstrap-hermes.bat",
    "bootstrap-codex.bat"
)) {
    Copy-Item -LiteralPath (Join-Path $projectRoot $file) -Destination $stageRoot
}

function Copy-PortableTree {
    param(
        [Parameter(Mandatory)][string]$Source,
        [Parameter(Mandatory)][string]$Destination,
        [string[]]$ExcludeDirectories = @(),
        [string[]]$ExcludeFiles = @()
    )

    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    # Do not follow junctions from the source tree. OpenClaw's generated
    # plugin projects contain junctions back into the host runtime; following
    # them would duplicate the runtime or capture host-specific paths.
    $robocopyArgs = @($Source, $Destination, "/E", "/XJ", "/COPY:DAT", "/DCOPY:DAT", "/R:2", "/W:1", "/NFL", "/NDL", "/NJH", "/NJS", "/NP")
    if ($ExcludeDirectories.Count) { $robocopyArgs += "/XD"; $robocopyArgs += $ExcludeDirectories }
    if ($ExcludeFiles.Count) { $robocopyArgs += "/XF"; $robocopyArgs += $ExcludeFiles }
    & robocopy.exe @robocopyArgs
    if ($LASTEXITCODE -gt 7) {
        throw "robocopy failed with exit code $LASTEXITCODE while copying $Source"
    }
}

Copy-PortableTree (Join-Path $projectRoot "ai-assistant") (Join-Path $stageRoot "ai-assistant") -ExcludeDirectories @((Join-Path $projectRoot "ai-assistant\data"))
$controlUiSource = Join-Path $projectRoot "control-ui"
Copy-PortableTree $controlUiSource (Join-Path $stageRoot "control-ui") -ExcludeDirectories @((Join-Path $controlUiSource "dist"))
Copy-PortableTree (Join-Path $projectRoot "sidecar") (Join-Path $stageRoot "sidecar") -ExcludeDirectories @("__pycache__")
Copy-PortableTree (Join-Path $projectRoot "scripts") (Join-Path $stageRoot "scripts")
Copy-PortableTree (Join-Path $projectRoot "skill-packs") (Join-Path $stageRoot "skill-packs")

# Copy the complete execution runtimes, but rebuild user-owned homes and
# managed plugins into a short, relocatable layout. The source homes contain
# login state, sessions, API keys, and huge duplicated OpenClaw peer installs.
$runtimeSource = Join-Path $projectRoot "runtime"
$runtimeStage = Join-Path $stageRoot "runtime"
New-Item -ItemType Directory -Path $runtimeStage -Force | Out-Null

Copy-PortableTree (Join-Path $runtimeSource "codex") (Join-Path $runtimeStage "codex")
Copy-PortableTree (Join-Path $runtimeSource "hermes-libs") (Join-Path $runtimeStage "hermes-libs")
Copy-PortableTree (Join-Path $runtimeSource "openclaw") (Join-Path $runtimeStage "openclaw") -ExcludeFiles @("*.map", "*.ts", "*.mts", "*.cts")
# Both source Python folders are the same 3.11.15 distribution. Keep one copy
# so the launcher has a deterministic interpreter without shipping a duplicate.
$pythonSource = Join-Path $runtimeSource "python\\cpython-3.11.15-windows-x86_64-none"
if (-not (Test-Path -LiteralPath $pythonSource -PathType Container)) {
    throw "Bundled Python runtime is missing: $pythonSource"
}
Copy-PortableTree $pythonSource (Join-Path $runtimeStage "python\\cpython-3.11.15-windows-x86_64-none") -ExcludeFiles @(".lock")

$dataStage = Join-Path $runtimeStage "data"
New-Item -ItemType Directory -Path $dataStage -Force | Out-Null
$nodeSource = Join-Path $runtimeSource "data\\node.exe"
if (-not (Test-Path -LiteralPath $nodeSource -PathType Leaf)) {
    throw "Bundled Node runtime is missing: $nodeSource"
}
Copy-Item -LiteralPath $nodeSource -Destination $dataStage

$workspaceStage = Join-Path $runtimeStage "workspace"
New-Item -ItemType Directory -Path $workspaceStage -Force | Out-Null
foreach ($workspaceFile in @("AGENTS.md", "HEARTBEAT.md", "IDENTITY.md", "SOUL.md", "TOOLS.md")) {
    $sourceFile = Join-Path $runtimeSource "workspace\\$workspaceFile"
    if (Test-Path -LiteralPath $sourceFile -PathType Leaf) {
        Copy-Item -LiteralPath $sourceFile -Destination $workspaceStage
    }
}

# Hermes and Codex skills are static runtime assets, not user credentials.
# Keep the installed skill trees while dropping caches, locks, and backups.
$hermesHomeStage = Join-Path $runtimeStage "hermes-home"
$hermesSkillsSource = Join-Path $runtimeSource "hermes-home\\skills"
if (Test-Path -LiteralPath $hermesSkillsSource -PathType Container) {
    Copy-PortableTree $hermesSkillsSource (Join-Path $hermesHomeStage "skills") -ExcludeDirectories @((Join-Path $hermesSkillsSource ".curator_backups")) -ExcludeFiles @("*.lock")
}
$codexHomeStage = Join-Path $runtimeStage "codex-home"
$codexSkillsSource = Join-Path $runtimeSource "codex-home\\skills"
if (Test-Path -LiteralPath $codexSkillsSource -PathType Container) {
    Copy-PortableTree $codexSkillsSource (Join-Path $codexHomeStage "skills") -ExcludeFiles @("*.lock")
}

$openclawHomeStage = Join-Path $runtimeStage "openclaw-home"
New-Item -ItemType Directory -Path $openclawHomeStage -Force | Out-Null
$openclawConfigSource = Join-Path $runtimeSource "openclaw-home\\openclaw.json"
if (-not (Test-Path -LiteralPath $openclawConfigSource -PathType Leaf)) {
    throw "OpenClaw config is missing: $openclawConfigSource"
}
Copy-Item -LiteralPath $openclawConfigSource -Destination $openclawHomeStage

# Rebuild the installed OpenClaw plugins into short projects. The original
# managed npm cache stores a full ~300 MB OpenClaw peer copy inside every
# plugin and reaches 300+ character paths. One shared peer copy is enough for
# Node's module resolution; each plugin keeps its own non-peer dependencies.
$pluginsStage = Join-Path $openclawHomeStage "plugins"
$sharedPluginNodeModules = Join-Path $pluginsStage "node_modules"
New-Item -ItemType Directory -Path $sharedPluginNodeModules -Force | Out-Null
$sharedOpenClaw = Join-Path $runtimeSource "openclaw\\node_modules\\openclaw"
if (-not (Test-Path -LiteralPath $sharedOpenClaw -PathType Container)) {
    throw "OpenClaw package is missing: $sharedOpenClaw"
}
Copy-PortableTree $sharedOpenClaw (Join-Path $sharedPluginNodeModules "openclaw") -ExcludeFiles @("*.map", "*.ts", "*.mts", "*.cts")

$pluginSpecs = @(
    @{ Id = "deepseek"; Short = "deepseek"; Project = "openclaw-deepseek-provider-2481ed984b"; Package = "node_modules\\@openclaw\\deepseek-provider" },
    @{ Id = "qqbot"; Short = "qqbot"; Project = "openclaw-qqbot-d3553f72f8"; Package = "node_modules\\@openclaw\\qqbot" },
    @{ Id = "openclaw-weixin"; Short = "weixin"; Project = "tencent-weixin-openclaw-weixin-7783ac86ba"; Package = "node_modules\\@tencent-weixin\\openclaw-weixin" },
    @{ Id = "wecom-openclaw-plugin"; Short = "wecom"; Project = "wecom-wecom-openclaw-plugin-18f843d908"; Package = "node_modules\\@wecom\\wecom-openclaw-plugin" }
)
$pluginLoadPaths = @()
foreach ($spec in $pluginSpecs) {
    $sourceProject = Join-Path (Join-Path $runtimeSource "openclaw-home\\npm\\projects") $spec.Project
    $sourceNodeModules = Join-Path $sourceProject "node_modules"
    $targetProject = Join-Path $pluginsStage $spec.Short
    if (-not (Test-Path -LiteralPath $sourceNodeModules -PathType Container)) {
        throw "Installed OpenClaw plugin dependencies are missing: $sourceNodeModules"
    }

    $nestedOpenClawDirs = @(Get-ChildItem -LiteralPath $sourceNodeModules -Directory -Recurse -Force -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -eq "openclaw" } |
        Select-Object -ExpandProperty FullName)
    Copy-PortableTree $sourceNodeModules (Join-Path $targetProject "node_modules") -ExcludeDirectories $nestedOpenClawDirs -ExcludeFiles @("*.map", "*.ts", "*.mts", "*.cts")

    $targetPackage = Join-Path $targetProject $spec.Package
    if (-not (Test-Path -LiteralPath (Join-Path $targetPackage "package.json") -PathType Leaf)) {
        throw "Portable plugin package is missing: $targetPackage"
    }
    $pluginLoadPaths += "runtime/openclaw-home/plugins/$($spec.Short)/$($spec.Package.Replace('\\','/'))"
}

# Keep a writable log directory in the archive even though source log files are
# intentionally excluded. The EXE writes its first launch line before services start.
$logDirectory = Join-Path $stageRoot "runtime\\logs"
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
[System.IO.File]::WriteAllText((Join-Path $logDirectory ".keep"), "", [System.Text.UTF8Encoding]::new($false))

# Retain a usable local gateway default while removing this machine's access
# token, model keys, channels, absolute paths, and local session state.
$openClawConfig = Join-Path $stageRoot "runtime\\openclaw-home\\openclaw.json"
if (Test-Path -LiteralPath $openClawConfig) {
    $config = Get-Content -LiteralPath $openClawConfig -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($config.gateway -and $config.gateway.auth) {
        $config.gateway.auth.token = "dev-local-token"
    }
    if ($config.models -and $config.models.providers) {
        foreach ($provider in $config.models.providers.PSObject.Properties) {
            if ($provider.Value.PSObject.Properties.Name -contains "apiKey") {
                $provider.Value.apiKey = ""
            }
        }
    }
    if ($config.PSObject.Properties.Name -contains "channels") {
        $config.channels = [pscustomobject]@{}
    }
    if ($config.agents -and $config.agents.list) {
        foreach ($agent in @($config.agents.list)) {
            $agent.workspace = "runtime/workspace"
        }
    }
    if (-not $config.plugins) {
        $config.plugins = [pscustomobject]@{}
    }
    $pluginLoadConfig = [pscustomobject]@{ paths = $pluginLoadPaths }
    if ($config.plugins.PSObject.Properties.Name -contains "load") {
        $config.plugins.load = $pluginLoadConfig
    } else {
        $config.plugins | Add-Member -NotePropertyName load -NotePropertyValue $pluginLoadConfig
    }
    $config.plugins.entries = [pscustomobject]@{}
    foreach ($spec in $pluginSpecs) {
        $config.plugins.entries | Add-Member -NotePropertyName $spec.Id -NotePropertyValue ([pscustomobject]@{ enabled = $true })
    }
    $json = $config | ConvertTo-Json -Depth 100
    [System.IO.File]::WriteAllText($openClawConfig, $json + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
}

# runtime/data is an execution directory, not portable user data. Keep only
# node.exe; gateway.db and readiness markers contain local authorization and
# runtime state and must never enter the customer archive.
$dataStage = Join-Path $stageRoot "runtime\\data"
if (Test-Path -LiteralPath $dataStage) {
    Get-ChildItem -LiteralPath $dataStage -Force |
        Where-Object { $_.Name -ne "node.exe" } |
        Remove-Item -Recurse -Force -ErrorAction Stop
}
$unexpectedData = Get-ChildItem -LiteralPath $dataStage -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne "node.exe" }
if ($unexpectedData) {
    throw "Portable staging contains unexpected runtime data: $($unexpectedData.Name -join ', ')"
}

foreach ($required in @(
    (Join-Path $stageRoot "runtime\data\node.exe"),
    (Join-Path $stageRoot "runtime\python\cpython-3.11.15-windows-x86_64-none\python.exe"),
    (Join-Path $stageRoot "runtime\openclaw\node_modules\openclaw\openclaw.mjs"),
    (Join-Path $stageRoot "runtime\openclaw-home\plugins\deepseek\node_modules\@openclaw\deepseek-provider\package.json"),
    (Join-Path $stageRoot "runtime\openclaw-home\plugins\qqbot\node_modules\@openclaw\qqbot\package.json"),
    (Join-Path $stageRoot "runtime\openclaw-home\plugins\weixin\node_modules\@tencent-weixin\openclaw-weixin\package.json"),
    (Join-Path $stageRoot "runtime\openclaw-home\plugins\wecom\node_modules\@wecom\wecom-openclaw-plugin\package.json"),
    (Join-Path $stageRoot "runtime\hermes-libs\hermes_cli\main.py"),
    (Join-Path $stageRoot "control-ui\node_modules\vite\bin\vite.js"),
    (Join-Path $stageRoot "control-ui\node_modules\vite\dist\node\cli.js")
)) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
        throw "Portable staging is incomplete; required file is missing: $required"
    }
}

# Type declarations and source maps are never loaded by the bundled Node
# runtime. Removing them keeps the deeply nested OpenClaw dependency tree
# below Windows' legacy 260-character extraction limit.
$openClawNodeModules = Join-Path $stageRoot "runtime\openclaw\node_modules"
if (Test-Path -LiteralPath $openClawNodeModules) {
    Get-ChildItem -LiteralPath $openClawNodeModules -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match '\.(map|ts|mts|cts)$' } |
        Remove-Item -Force -ErrorAction SilentlyContinue
}
$sharedPluginNodeModulesStage = Join-Path $stageRoot "runtime\openclaw-home\plugins\node_modules"
if (Test-Path -LiteralPath $sharedPluginNodeModulesStage) {
    Get-ChildItem -LiteralPath $sharedPluginNodeModulesStage -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match '\.(map|ts|mts|cts)$' } |
        Remove-Item -Force -ErrorAction SilentlyContinue
}

# The config is the only copied JSON that intentionally describes runtime
# locations. Reject any drive-qualified path or non-empty provider key before
# creating the archive.
$stagedConfig = Get-Content -LiteralPath (Join-Path $stageRoot "runtime\openclaw-home\openclaw.json") -Raw -Encoding UTF8 | ConvertFrom-Json
if (@($stagedConfig.agents.list | Where-Object { $_.workspace -match '^[A-Za-z]:[\\/]' })) {
    throw "Portable staging still contains an absolute OpenClaw workspace path."
}
if ($stagedConfig.models.providers.PSObject.Properties | Where-Object { $_.Value.apiKey }) {
    throw "Portable staging still contains an OpenClaw provider API key."
}
Push-Location $OutputDirectory
try {
    $archiveExcludeRoots = @(
        ".git",
        "ai-assistant/data",
        "control-ui/dist",
        "sidecar/__pycache__",
        "runtime/openclaw-home/agents",
        "runtime/openclaw-home/canvas",
        "runtime/openclaw-home/credentials",
        "runtime/openclaw-home/devices",
        "runtime/openclaw-home/identity",
        "runtime/openclaw-home/logs",
        "runtime/openclaw-home/openclaw-weixin",
        "runtime/openclaw-home/plugin-skills",
        "runtime/openclaw-home/skill-workshop",
        "runtime/openclaw-home/state",
        "runtime/openclaw-home/workspace",
        "runtime/openclaw-home/workspace-attestations",
        "runtime/workspace/.git",
        "runtime/workspace/memory"
    )
    $tarArgs = @("-a", "-c", "-f", $archivePath)
    foreach ($root in $archiveExcludeRoots) {
        $tarArgs += "--exclude=$packageName/$root"
        $tarArgs += "--exclude=$packageName/$root/*"
    }
    $tarArgs += "--exclude=$packageName/runtime/data/.sidecar.ready"
    $tarArgs += "--exclude=$packageName/runtime/data/gateway.db"
    $tarArgs += "--exclude=$packageName/runtime/openclaw-home/openclaw.json.bak"
    $tarArgs += "--exclude=$packageName/runtime/openclaw-home/openclaw.json.bak.*"
    $tarArgs += "--exclude=$packageName/runtime/openclaw-home/openclaw.json.last-good"
    $tarArgs += "--exclude=$packageName/runtime/workspace/USER.md"
    $tarArgs += "--exclude=$packageName/runtime/workspace/openclaw-workspace-state.json"
    $tarArgs += $packageName
    & tar.exe @tarArgs
    if ($LASTEXITCODE -ne 0) {
        throw "tar.exe failed with exit code $LASTEXITCODE"
    }

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [IO.Compression.ZipFile]::OpenRead($archivePath)
    try {
        $requiredEntries = @(
            "$packageName/launcher_gui.py",
            "$packageName/LXUP-icon.ico",
            "$packageName/control-ui/node_modules/vite/bin/vite.js",
            "$packageName/control-ui/node_modules/vite/dist/node/cli.js",
            "$packageName/runtime/python/cpython-3.11.15-windows-x86_64-none/python.exe",
            "$packageName/runtime/openclaw-home/plugins/node_modules/openclaw/package.json",
            "$packageName/runtime/openclaw-home/plugins/deepseek/node_modules/@openclaw/deepseek-provider/package.json",
            "$packageName/runtime/openclaw-home/plugins/qqbot/node_modules/@openclaw/qqbot/package.json",
            "$packageName/runtime/openclaw-home/plugins/weixin/node_modules/@tencent-weixin/openclaw-weixin/package.json",
            "$packageName/runtime/openclaw-home/plugins/wecom/node_modules/@wecom/wecom-openclaw-plugin/package.json"
        )
        foreach ($entryName in $requiredEntries) {
            if (-not ($zip.Entries | Where-Object FullName -eq $entryName)) {
                throw "ZIP verification failed; missing entry: $entryName"
            }
        }

        $unexpectedDataEntries = $zip.Entries | Where-Object {
            $_.FullName -match "^$packageName/runtime/data/" -and
            $_.FullName -notin @(
                "$packageName/runtime/data/",
                "$packageName/runtime/data/node.exe"
            )
        }
        if ($unexpectedDataEntries) {
            throw "ZIP verification failed; runtime data leaked: $($unexpectedDataEntries[0].FullName)"
        }

        $forbiddenStateEntries = $zip.Entries | Where-Object {
            $_.FullName -match "^$packageName/runtime/(codex-home|hermes-home)/(auth\.json|config\.toml|config\.yaml|state|sessions|\.tmp|tmp|cache|logs|\.env)(/|$)" -or
            $_.FullName -match "^$packageName/runtime/openclaw-home/(agents|canvas|credentials|devices|identity|logs|openclaw-weixin|plugin-skills|skill-workshop|state|workspace|workspace-attestations)(/|$)" -or
            $_.FullName -match "^$packageName/runtime/data/(gateway\.db|\.sidecar\.ready)$"
        }
        if ($forbiddenStateEntries) {
            throw "ZIP verification failed; machine state leaked: $($forbiddenStateEntries[0].FullName)"
        }
    }
    finally {
        $zip.Dispose()
    }
}
finally {
    Pop-Location
}

Write-Host "Portable folder: $stageRoot"
Write-Host "ZIP archive:     $archivePath"
