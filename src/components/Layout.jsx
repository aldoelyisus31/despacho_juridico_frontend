import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Calendar,
  CheckSquare,
  DollarSign,
  BarChart3,
  Menu,
  X,
  Bell,
  LogOut,
  Scale,
  FolderTree
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, getNombreCompleto, getIniciales, getRolFormateado } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/areas-subareas', icon: FolderTree, label: 'Áreas de Derecho' },
    { path: '/expedientes', icon: Briefcase, label: 'Expedientes' },
    { path: '/documentos', icon: FileText, label: 'Documentos' },
    { path: '/agenda', icon: Calendar, label: 'Agenda / Audiencias' },
    { path: '/tareas', icon: CheckSquare, label: 'Tareas' },
    { path: '/finanzas', icon: DollarSign, label: 'Finanzas / Pagos' },
    { path: '/reportes', icon: BarChart3, label: 'Reportes' },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button className="menu-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="header-greeting">Bienvenido, {getNombreCompleto()}</h2>
        </div>
        <div className="header-right">
          <button className="notification-button">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={20} />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Scale className="sidebar-logo" size={32} strokeWidth={1.5} />
          <div className="sidebar-title">
            <h1>Sistema Jurídico</h1>
            <p>Gestión Legal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => window.innerWidth <= 1024 && setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{getIniciales()}</div>
            <div className="user-info">
              <p className="user-name">{getNombreCompleto()}</p>
              <p className="user-role">{getRolFormateado()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
