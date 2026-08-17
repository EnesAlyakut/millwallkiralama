'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const MENU: Array<[string, string, string, string]> = [
  ['GENEL', '▦', 'Dashboard', '/admin/dashboard'],
  ['FİLO', '▣', 'Tüm Araçlar', '/admin/vehicles'],
  ['FİLO', '＋', 'Yeni Araç Ekle', '/admin/vehicles/new'],
  ['FİLO', '◇', 'Kategoriler', '/admin/categories'],
  ['MÜŞTERİ', '☏', 'Kiralama Talepleri', '/admin/requests'],
  ['AYARLAR', '⚙', 'Site Ayarları', '/admin/settings'],
  ['AYARLAR', '●', 'Profil', '/admin/profile'],
];

export default function AdminShell({ children, name }: { children: React.ReactNode; name: string }) {
  const path = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [path]);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  let lastGroup = '';

  return (
    <div className={`admin-shell ${isMobileMenuOpen ? 'is-menu-open' : ''}`}>
      <div 
        className="admin-sidebar-overlay" 
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />
      <aside className="admin-sidebar">
        <Link href="/" className="brand">
          <span className="brand-mark">M</span>
          <span className="brand-text">
            <b>MILLWAL</b>
            <small>YÖNETİM PANELİ</small>
          </span>
        </Link>

        <nav>
          {MENU.map(([group, icon, label, href]) => {
            const header = group !== lastGroup ? group : null;
            lastGroup = group;
            return (
              <div key={href} style={{ display: 'contents' }}>
                {header && <span>{header}</span>}
                <Link className={path === href ? 'is-active' : ''} href={href}>
                  <i>{icon}</i>
                  {label}
                </Link>
              </div>
            );
          })}
        </nav>

        <button className="admin-logout" onClick={logout}>
          <span aria-hidden="true">↪</span> Çıkış Yap
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button 
              className="admin-menu-toggle" 
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Menüyü aç"
            >
              ☰
            </button>
            <div>
              <small>YÖNETİM PANELİ</small>
              <strong>{name}</strong>
            </div>
          </div>
          <div>
            <Link className="btn btn-outline btn-sm" href="/" target="_blank">
              Siteyi Görüntüle ↗
            </Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
