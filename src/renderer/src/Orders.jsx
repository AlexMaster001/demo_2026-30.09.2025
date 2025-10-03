// src/Orders.jsx
import { useEffect, useState, useMemo } from 'react';
import Dashboard from './Dashboard';

function Orders({ user, showNotification }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const result = await window.api.getOrders();
        setOrders(result);
      } catch (err) {
        showNotification('Ошибка загрузки заказов', 'error');
      }
    };
    loadOrders();
  }, [showNotification]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(orders.map(o => o.status).filter(Boolean)));
  }, [orders]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = useMemo(() => {
    let result = orders.filter(o =>
      o.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone?.includes(searchTerm)
    );

    if (filterStatus !== 'all') {
      result = result.filter(o => o.status === filterStatus);
    }

    return sortOrder === 'asc'
      ? result.toSorted((a, b) => a.created_at.localeCompare(b.created_at))
      : result.toSorted((a, b) => b.created_at.localeCompare(a.created_at));
  }, [orders, searchTerm, filterStatus, sortOrder]);

  return (
    <Dashboard user={user} setUser={() => {}}>
      <h2>Список заказов</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по клиенту, адресу, телефону..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Все статусы</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Дата ↑</option>
          <option value="desc">Дата ↓</option>
        </select>
      </div>

      <div className="orders-list">
        {filtered.length === 0 ? (
          <p>Заказы не найдены</p>
        ) : (
          filtered.map(order => (
            <div key={order.id} className="order-card">
              <h3>{order.client_name}</h3>
              <p><strong>Телефон:</strong> {order.phone}</p>
              <p><strong>Адрес:</strong> {order.address}</p>
              <p><strong>Товар:</strong> ID {order.good_id}, кол-во: {order.quantity}</p>
              <p><strong>Статус:</strong> {order.status}</p>
              <p><strong>Дата:</strong> {new Date(order.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </Dashboard>
  );
}

export default Orders;
