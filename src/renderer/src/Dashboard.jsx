// src/Dashboard.jsx
import { useNavigate } from "react-router-dom";

function Dashboard({ user, setUser, children }) {
  const navigate = useNavigate();

  const logout = () => {
    setUser({});
    navigate('/');
  };

  return (
    <div className="dashboard">
      <div className="header-controls">
        <button onClick={logout} className="btn-logout">Выход</button>

        {/* Только админ видит "Добавить товар" */}
        {user.role === 'Администратор' && (
          <button onClick={() => navigate('/main')} className="btn-add">➕ Просмотр товаров</button>
        )}

        {/* Менеджер и админ видят "Заказы" */}
        {(user.role === 'Менеджер' || user.role === 'Администратор') && (
          <button onClick={() => navigate('/orders')} className="btn-orders">📦 Заказы</button>
        )}
      </div>

      <div className="content">
        {children}
      </div>
    </div>
  );
}

export default Dashboard;
