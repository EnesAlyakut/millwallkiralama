@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Millwal Kurumsal Kiralama - Yerel Sunucu

echo.
echo  ==========================================================
echo    MILLWAL KURUMSAL KIRALAMA
echo    Kurulum ve yerel sunucu baslatma
echo  ==========================================================
echo.

REM --- Veritabani yolunu mutlak olarak sabitle (bosluklu klasor adi guvenli) ---
set "ROOT=%~dp0"
set "ROOT=%ROOT:\=/%"
set "DATABASE_URL=file:%ROOT%packages/database/prisma/millwal.db"
echo  Veritabani: %DATABASE_URL%
echo.

REM --- Node kontrolu ---
where node >nul 2>nul
if errorlevel 1 (
  echo  [HATA] Node.js bulunamadi.
  echo         https://nodejs.org adresinden LTS surumunu kurun ve bu dosyayi tekrar calistirin.
  goto :son
)
for /f "tokens=*" %%v in ('node -v') do echo  Node.js surumu: %%v

REM --- pnpm kontrolu ---
where pnpm >nul 2>nul
if errorlevel 1 (
  echo  pnpm bulunamadi, corepack ile etkinlestiriliyor...
  call corepack enable >nul 2>nul
  call corepack prepare pnpm@10 --activate >nul 2>nul
  where pnpm >nul 2>nul
  if errorlevel 1 (
    echo  corepack basarisiz, npm ile kuruluyor...
    call npm install -g pnpm
  )
)
where pnpm >nul 2>nul
if errorlevel 1 (
  echo  [HATA] pnpm kurulamadi. Elle kurmayi deneyin:  npm install -g pnpm
  goto :son
)
for /f "tokens=*" %%v in ('pnpm -v') do echo  pnpm surumu: %%v
echo.

REM ==========================================================
REM  0/4  Dosya kilidi temizligi
REM  Prisma, Windows'ta motor DLL'ini yeniden adlandirarak kurar.
REM  Acik kalan bir node.exe bu dosyayi kilitlerse EPERM hatasi verir.
REM ==========================================================
echo  [0/4] Acik Node.js islemleri kontrol ediliyor...
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I "node.exe" >nul
if not errorlevel 1 (
  echo         Calisan node.exe bulundu - Prisma dosya kilidini onlemek icin kapatiliyor.
  echo         (Baska Node.js uygulamalariniz varsa onlar da kapanacaktir.^)
  taskkill /F /IM node.exe /T >nul 2>nul
  timeout /t 3 >nul
) else (
  echo         Acik Node.js islemi yok.
)

REM --- Onceki basarisiz generate'ten kalan gecici dosyalari sil ---
for /d %%D in ("node_modules\.pnpm\@prisma+client@*") do (
  if exist "%%D\node_modules\.prisma\client" (
    del /f /q "%%D\node_modules\.prisma\client\*.tmp*" >nul 2>nul
  )
)
echo  [0/4] Tamam.
echo.

REM --- 1/4 Bagimliliklar ---
echo  [1/4] Bagimliliklar kuruluyor...
call pnpm install
if errorlevel 1 (
  echo.
  echo  [HATA] pnpm install basarisiz oldu. Yukaridaki mesaji kontrol edin.
  goto :son
)
echo  [1/4] Tamam.
echo.

REM --- 2/4 Prisma istemcisi (3 denemeli) ---
echo  [2/4] Prisma istemcisi olusturuluyor...
set "GEN_OK=0"
for /L %%i in (1,1,3) do (
  if "!GEN_OK!"=="0" (
    echo         Deneme %%i/3...
    call pnpm --filter @kiralama/database exec prisma generate
    if "!errorlevel!"=="0" (
      set "GEN_OK=1"
    ) else (
      echo         Basarisiz - dosya kilidi temizlenip tekrar denenecek...
      taskkill /F /IM node.exe /T >nul 2>nul
      for /d %%D in ("node_modules\.pnpm\@prisma+client@*") do (
        if exist "%%D\node_modules\.prisma\client" rmdir /s /q "%%D\node_modules\.prisma\client" >nul 2>nul
      )
      timeout /t 4 >nul
    )
  )
)
if "!GEN_OK!"=="0" goto :genfail
echo  [2/4] Tamam.
echo.

REM --- 3/4 Veritabani semasi ---
echo  [3/4] Veritabani semasi guncelleniyor...
call pnpm --filter @kiralama/database exec prisma db push --skip-generate --accept-data-loss
if errorlevel 1 (
  echo.
  echo  [HATA] prisma db push basarisiz oldu.
  goto :son
)
echo  [3/4] Tamam.
echo.

REM --- 4/4 Demo veri ---
echo  [4/4] Ornek filo verisi yaziliyor...
call pnpm --filter @kiralama/database exec tsx prisma/seed.ts
if errorlevel 1 (
  echo.
  echo  [HATA] Seed islemi basarisiz oldu.
  goto :son
)
echo  [4/4] Tamam.
echo.

echo  ==========================================================
echo    Hazir. Sunucu baslatiliyor...
echo.
echo    Site        : http://localhost:3000
echo    Yonetim     : http://localhost:3000/admin/login
echo    Kullanici   : admin
echo    Sifre       : Millwal2026!
echo.
echo    Durdurmak icin bu pencerede Ctrl + C
echo  ==========================================================
echo.

REM --- Sunucu hazir olunca tarayiciyi ac (arka planda bekler) ---
start "" cmd /c "timeout /t 14 >nul & start "" http://localhost:3000"

call pnpm --filter @kiralama/web dev
goto :son

:genfail
echo.
echo  ==========================================================
echo   [HATA] prisma generate 3 denemede de basarisiz oldu.
echo.
echo   Bu hata (EPERM / rename ... query_engine-windows.dll.node)
echo   dosya kilidinden kaynaklanir. Sirasiyla deneyin:
echo.
echo    1. Acik VS Code / terminal / tarayici sekmelerini kapatin,
echo       bilgisayari yeniden baslatip bu dosyayi tekrar calistirin.
echo.
echo    2. Bu dosyaya sag tiklayip "Yonetici olarak calistir" secin.
echo.
echo    3. Antivirus / Windows Defender gercek zamanli korumasina
echo       "D:\kiralama sitesi" klasorunu haric tutma olarak ekleyin.
echo       (Ayarlar - Gizlilik ve guvenlik - Windows Guvenligi -
echo        Virus ve tehdit korumasi - Ayarlari yonet - Haric tutulanlar^)
echo.
echo    4. Son care: node_modules klasorunu silip tekrar calistirin.
echo       Komut:  rmdir /s /q node_modules
echo  ==========================================================

:son
echo.
echo  Pencereyi kapatmak icin bir tusa basin...
pause >nul
endlocal
