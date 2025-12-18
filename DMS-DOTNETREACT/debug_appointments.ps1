$ErrorActionPreference = "Stop"

function Get-Appointments {
    param ($token, $tab)
    $headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5024/api/secretary/appointments?tab=$tab" -Method Get -Headers $headers
        return $response
    } catch {
        Write-Error "Failed to fetch tab '$tab': $_"
        return @()
    }
}

Write-Host "1. Logging in..."
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5024/api/auth/login" -Method Post -ContentType "application/json" -Body (@{username="secretary1"; password="Secretary123!"} | ConvertTo-Json)
    $token = $loginResponse.token
} catch {
    Write-Error "Login failed: $_"
    exit
}

Write-Host "2. Fetching Counts..."
$all = Get-Appointments -token $token -tab "all"
$today = Get-Appointments -token $token -tab "today"
$tomorrow = Get-Appointments -token $token -tab "tomorrow"
$future = Get-Appointments -token $token -tab "future"
$past = Get-Appointments -token $token -tab "past"

Write-Host "------------------------------------------------"
Write-Host "Total (tab=all):    $($all.Count)"
Write-Host "Sum of Tabs:        $($today.Count + $tomorrow.Count + $future.Count + $past.Count)"
Write-Host "------------------------------------------------"
Write-Host "Today:    $($today.Count)"
Write-Host "Tomorrow: $($tomorrow.Count)"
Write-Host "Future:   $($future.Count)"
Write-Host "Past:     $($past.Count)"
Write-Host "------------------------------------------------"

if ($all.Count -ne ($today.Count + $tomorrow.Count + $future.Count + $past.Count)) {
    Write-Warning "MISMATCH DETECTED! Some appointments are not being covered by tabs."
    
    # Simple set difference logic (PowerShell isn't great at this effectively without more code, but lets try ID comparison)
    $coveredIds = @($today.id) + @($tomorrow.id) + @($future.id) + @($past.id)
    $missingMap = $all | Where-Object { $coveredIds -notcontains $_.id }
    
    if ($missingMap) {
        Write-Host "Missing Appointments Details:"
        $missingMap | Format-Table id, appointmentDate, appointmentTime, status, patient
    }
} else {
    Write-Host "Counts match. No gaps in tab logic."
}

# Also verify statuses of 'all'
Write-Host "`nStatus Breaddown (All):"
$group = $all | Group-Object status
$group | Select-Object Name, Count | Format-Table -AutoSize
