// src/Store.jsx
import { useNavigate } from "react-router-dom";
import GoodsCard from "./components/GoodsCard";
import { useEffect, useState, useMemo } from "react";

function Store({ user, setUser }) {
  const [goods, setGoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  // Загрузка товаров (один раз)
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.api.getGoods();
        
        const processed = result.map(g => ({
          ...g,
          price: parseFloat(g.price) || 0,
          quantity: parseInt(g.quantity) || 0,
          discount: parseFloat(g.discount) || 0
        }));
        
        setGoods(processed);
      } catch (err) {
        showMessage('Ошибка загрузки товаров', 'error');
      }
    };
    loadData();
  }, []);

  // Получаем уникальных поставщиков
  const uniqueSuppliers = useMemo(() => {
    return Array.from(new Set(goods.map(g => g.supplier).filter(Boolean)));
  }, [goods]);

  // Фильтрация и сортировка — через useMemo для оптимизации
  const filtered = useMemo(() => {
    let result = goods.filter(g =>
      g.article?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterSupplier !== 'all') {
      result = result.filter(g => g.supplier === filterSupplier);
    }

    // Сортировка — без мутации! используем toSorted()
    return sortOrder === 'asc'
      ? result.toSorted((a, b) => a.quantity - b.quantity)
      : result.toSorted((a, b) => b.quantity - a.quantity);

  }, [goods, searchTerm, filterSupplier, sortOrder]);

  // Уведомления
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const logout = () => {
    setUser({});
    navigate('/');
  };

  return (
    <div className="store">
      {/* Уведомление */}
      {message && (
        <div className={`notification ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Хедер */}
      <div className="header-controls">
        <button onClick={logout} className="btn-logout">Выход</button>
        {user.role === 'Администратор' && (
          <button onClick={() => alert('Форма добавления пока не готова')} className="btn-add">
            ➕ Добавить товар
          </button>
        )}
      </div>

      {/* Поиск, фильтры, сортировка */}
      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по артикулу, типу, поставщику..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterSupplier}
          onChange={(e) => setFilterSupplier(e.target.value)}
        >
          <option value="all">Все поставщики</option>
          {uniqueSuppliers.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">Кол-во ↑</option>
          <option value="desc">Кол-во ↓</option>
        </select>
      </div>

      {/* Список товаров */}
      <div className="goodsContainer">
        {filtered.length === 0 ? (
          <p>Товары не найдены</p>
        ) : (
          filtered.map(g => (
            <GoodsCard key={g.id} good={g} />
          ))
        )}
      </div>
    </div>
  );
}

export default Store;
