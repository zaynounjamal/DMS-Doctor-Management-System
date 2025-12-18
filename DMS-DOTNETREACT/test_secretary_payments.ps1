$ErrorActionPreference = "Stop"

Write-Host "1. Logging in..."
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5024/api/auth/login" -Method Post -ContentType "application/json" -Body (@{username="secretary1"; password="Secretary123!"} | ConvertTo-Json)
    $token = $loginResponse.token
    Write-Host "   Login successful."
} catch {
    Write-Error "Login failed: $_"
    exit
}

$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

Write-Host "2. Adding Balance ($50)..."
try {
    $balanceResponse = Invoke-RestMethod -Uri "http://localhost:5024/api/secretary/patients/1/balance" -Method Post -Headers $headers -Body (@{amount=50} | ConvertTo-Json)
    Write-Host "   Balance added. New Balance: $($balanceResponse.balance)"
} catch {
    Write-Warning "Add Balance failed (maybe patient 1 not found?): $_"
    # Try Patient 5 just in case
    try {
        Write-Host "   Retrying with Patient 5..."
        $balanceResponse = Invoke-RestMethod -Uri "http://localhost:5024/api/secretary/patients/5/balance" -Method Post -Headers $headers -Body (@{amount=50} | ConvertTo-Json)
        Write-Host "   Balance added to Patient 5. New Balance: $($balanceResponse.balance)"
    } catch {
        Write-Error "Add Balance Retry failed: $_"
    }
}

Write-Host "3. Fetching Payment History..."
try {
    $history = Invoke-RestMethod -Uri "http://localhost:5024/api/secretary/payments" -Method Get -Headers $headers
    
    # Filter for Deposits
    $deposits = $history.payments | Where-Object { $_.paymentMethod -eq "Deposit" }
    
    Write-Host "   Found $($deposits.Count) Deposits in history."
    
    if ($deposits.Count -gt 0) {
        $deposits | Select-Object -First 5 | Format-Table paymentDate, amount, paymentMethod, type, patientName
        Write-Host "SUCCESS: Deposits are visible!"
    } else {
        Write-Host "FAILURE: No Deposits found in history."
        # Show some payments to ensure we got data
        $history.payments | Select-Object -First 3 | Format-Table paymentDate, amount, paymentMethod, type
    }

    Write-Host "   Total Revenue Summary: $($history.summary.totalAmount)"

} catch {
    Write-Error "Fetch History failed: $_"
}
