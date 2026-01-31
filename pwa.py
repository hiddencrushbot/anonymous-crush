#!/usr/bin/env python3
"""
PWA Otomatik Ekleyici
Mevcut ask-secretly.html dosyasına PWA özelliklerini ekler
"""

import os
import sys

def add_pwa_to_html(input_file, output_file):
    print("🚀 PWA Ekleyici Başlatılıyor...")
    
    # Dosyayı oku
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            html = f.read()
    except FileNotFoundError:
        print(f"❌ Hata: {input_file} bulunamadı!")
        return False
    
    print(f"✅ Dosya okundu: {len(html)} karakter")
    
    # 1. PWA Meta Tags ekle (head içinde, title'dan önce)
    pwa_meta = '''    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#dc2626">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Ask Secretly">
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect width='192' height='192' fill='%23dc2626'/><text y='160' x='50%' text-anchor='middle' font-size='140'>💭</text></svg>">
    '''
    
    if '<title>Ask Secretly' in html:
        html = html.replace('<title>Ask Secretly', pwa_meta + '\n    <title>Ask Secretly')
        print("✅ PWA meta tags eklendi")
    
    # 2. PWA CSS ekle (.hidden'dan önce)
    pwa_css = '''
        /* PWA Install Banner */
        .install-banner {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-secondary);
            border: 2px solid var(--primary);
            border-radius: 16px;
            padding: 16px 20px;
            max-width: 90%;
            width: 400px;
            z-index: 1000;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease-out;
        }
        
        .install-banner-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .install-banner-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            flex-shrink: 0;
        }
        
        .install-banner-text {
            flex: 1;
        }
        
        .install-banner-title {
            font-weight: 700;
            font-size: 15px;
            margin-bottom: 4px;
        }
        
        .install-banner-desc {
            font-size: 13px;
            color: var(--text-secondary);
        }
        
        .install-banner-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }
        
        .install-btn {
            flex: 1;
            background: var(--primary);
            color: #fff;
            border: none;
            padding: 10px 16px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
        }
        
        .install-dismiss {
            background: var(--bg-tertiary);
            color: var(--text);
            border: none;
            padding: 10px 16px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
        }

'''
    
    if '.hidden { display: none !important; }' in html:
        html = html.replace('.hidden { display: none !important; }', 
                           pwa_css + '\n        .hidden { display: none !important; }')
        print("✅ PWA CSS eklendi")
    
    # 3. PWA Banner HTML ekle (notification div'inden sonra)
    pwa_banner_html = '''
    <!-- PWA Install Banner -->
    <div id="installBanner" class="install-banner hidden">
        <div class="install-banner-content">
            <div class="install-banner-icon">💭</div>
            <div class="install-banner-text">
                <div class="install-banner-title">Ask Secretly</div>
                <div class="install-banner-desc">Ana ekrana ekle, app gibi kullan!</div>
            </div>
        </div>
        <div class="install-banner-actions">
            <button class="install-btn" onclick="installPWA()">📲 Yükle</button>
            <button class="install-dismiss" onclick="dismissInstall()">Kapat</button>
        </div>
    </div>

'''
    
    if '<div id="notification" class="notification hidden"></div>' in html:
        html = html.replace('<div id="notification" class="notification hidden"></div>',
                           '<div id="notification" class="notification hidden"></div>\n' + pwa_banner_html)
        print("✅ PWA banner HTML eklendi")
    
    # 4. PWA JavaScript ekle (initFirebase(); sonrası)
    pwa_js = '''

// ============================================
// PWA INSTALLATION
// ============================================
let deferredPrompt;
const installBanner = document.getElementById('installBanner');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    setTimeout(() => {
        if (!localStorage.getItem('pwa_install_dismissed')) {
            installBanner.classList.remove('hidden');
        }
    }, 3000);
});

window.addEventListener('appinstalled', () => {
    console.log('PWA installed');
    deferredPrompt = null;
    installBanner.classList.add('hidden');
    showNotification('App yüklendi! 🎉');
});

async function installPWA() {
    if (!deferredPrompt) {
        showNotification('Tarayıcınız desteklemiyor veya zaten yüklenmiş');
        return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('User accepted install');
    }
    
    deferredPrompt = null;
    installBanner.classList.add('hidden');
}

function dismissInstall() {
    installBanner.classList.add('hidden');
    localStorage.setItem('pwa_install_dismissed', 'true');
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered:', reg))
        .catch(err => console.log('Service Worker registration failed:', err));
}
'''
    
    if 'initFirebase();' in html:
        html = html.replace('initFirebase();', 'initFirebase();' + pwa_js)
        print("✅ PWA JavaScript eklendi")
    
    # Dosyayı yaz
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"\n✅ BAŞARILI! PWA özellikleri eklendi:")
    print(f"   📄 Çıktı dosyası: {output_file}")
    print(f"   📊 Dosya boyutu: {len(html)} karakter")
    print(f"\n🎉 Artık GitHub'a yükleyebilirsin!")
    return True

if __name__ == "__main__":
    # Kullanım
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else 'ask-secretly-PWA.html'
    else:
        input_file = 'ask-secretly.html'
        output_file = 'ask-secretly-PWA.html'
    
    print("=" * 50)
    print("PWA OTOMATIK EKLEYİCİ")
    print("=" * 50)
    print(f"Girdi: {input_file}")
    print(f"Çıktı: {output_file}")
    print("=" * 50 + "\n")
    
    if add_pwa_to_html(input_file, output_file):
        print("\n✅ İŞLEM TAMAM! GitHub'a yükleyebilirsin! 🚀")
    else:
        print("\n❌ Hata oluştu!")
        sys.exit(1)
