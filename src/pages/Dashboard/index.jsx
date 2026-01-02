import { 
  Briefcase, 
  Calendar, 
  Users, 
  CheckSquare, 
  TrendingUp,
  DollarSign
} from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
  const stats = [
    {
      title: 'Expedientes Activos',
      value: '142',
      change: '+12%',
      icon: Briefcase,
      color: '#3b82f6'
    },
    {
      title: 'Próximos a Vencer',
      value: '23',
      change: '+5',
      icon: Calendar,
      color: '#ef4444'
    },
    {
      title: 'Audiencias Próximas',
      value: '18',
      subtitle: 'Esta semana',
      icon: Calendar,
      color: '#a855f7'
    },
    {
      title: 'Nuevos Clientes',
      value: '34',
      subtitle: 'Este mes',
      icon: Users,
      color: '#22c55e'
    },
    {
      title: 'Tareas Pendientes',
      value: '67',
      change: '+8',
      icon: CheckSquare,
      color: '#f97316'
    },
    {
      title: 'Cobros del Mes',
      value: '$485,000',
      change: '+18%',
      icon: DollarSign,
      color: '#10b981'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Administrador</h1>
        <p>Vista general del despacho</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <h3>{stat.title}</h3>
                  <p className="stat-value">{stat.value}</p>
                  {stat.change && (
                    <span className="stat-change positive">{stat.change}</span>
                  )}
                  {stat.subtitle && (
                    <span className="stat-subtitle">{stat.subtitle}</span>
                  )}
                </div>
                <div className="stat-icon" style={{ background: stat.color }}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Expedientes por Tipo</h3>
          <div className="chart-placeholder">
            <div className="bar-chart">
              <div className="bar" style={{ height: '70%', background: '#e67e22' }}>
                <span className="bar-label">45</span>
              </div>
              <div className="bar" style={{ height: '50%', background: '#3b82f6' }}>
                <span className="bar-label">32</span>
              </div>
              <div className="bar" style={{ height: '40%', background: '#22c55e' }}>
                <span className="bar-label">25</span>
              </div>
              <div className="bar" style={{ height: '60%', background: '#a855f7' }}>
                <span className="bar-label">40</span>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Crecimiento de Clientes</h3>
          <div className="chart-placeholder">
            <div className="line-chart">
              <svg viewBox="0 0 400 150" className="line-svg">
                <polyline
                  points="0,120 50,110 100,90 150,80 200,70 250,60 300,45 350,30 400,20"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                />
                <circle cx="0" cy="120" r="4" fill="#10b981" />
                <circle cx="50" cy="110" r="4" fill="#10b981" />
                <circle cx="100" cy="90" r="4" fill="#10b981" />
                <circle cx="150" cy="80" r="4" fill="#10b981" />
                <circle cx="200" cy="70" r="4" fill="#10b981" />
                <circle cx="250" cy="60" r="4" fill="#10b981" />
                <circle cx="300" cy="45" r="4" fill="#10b981" />
                <circle cx="350" cy="30" r="4" fill="#10b981" />
                <circle cx="400" cy="20" r="4" fill="#10b981" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
