try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    [Windows.Media.Ocr.OcrEngine, Windows.Foundation.UniversalApiContract, ContentType = WindowsRuntime] | Out-Null
    [Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation.UniversalApiContract, ContentType = WindowsRuntime] | Out-Null
    [Windows.Storage.StorageFile, Windows.Foundation.UniversalApiContract, ContentType = WindowsRuntime] | Out-Null
    
    $langs = [Windows.Media.Ocr.OcrEngine]::AvailableRecognizerLanguages
    $tags = @()
    foreach ($l in $langs) {
        $tags += $l.LanguageTag
    }
    Write-Host "AVAILABLE_LANGUAGES: $($tags -join ', ')"
} catch {
    Write-Host "OCR_INIT_ERROR: $($_.Exception.Message)"
}
