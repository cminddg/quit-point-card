import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "首頁" },
  { to: "/add", label: "新增紀錄" },
  { to: "/records", label: "紀錄列表" },
  { to: "/stats", label: "統計圖表" }
];

export default function AppShell() {
  return (
    <div className="app-shell">
      <header className="topbar page-card topbar-card">
        <div className="topbar-copy">
          <p className="eyebrow">Quit Point Card</p>
          <h1>離職集點卡2.0</h1>
          <p className="topbar-description">
            把每天想離職的瞬間留下來，先用最簡單的方式看見自己的情緒、原因和累積趨勢。
          </p>
        </div>
      </header>

      <nav className="nav-tabs" aria-label="主要頁面">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <main className="page-frame">
        <Outlet />
      </main>

      <footer className="footer-note">
        目前功能：新增紀錄、列表篩選、統計圖表。
      </footer>
    </div>
  );
}
