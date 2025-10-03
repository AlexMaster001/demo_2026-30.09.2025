// src/Store.jsx
import { useNavigate } from "react-router-dom";
import GoodsCard from "./components/GoodsCard";
import { useEffect, useState, useMemo } from "react";
import EditGoodForm from "./components/EditGoodForm";

function Store({ user, setUser, showNotification }) {
  const [goods, setGoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [editModal, setEditModal] = useState(null); // null или объект товара
  const navigate = useNavigate();

  // Загрузка товаров
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
        showNotification('Ошибка загрузки товаров', 'error');
      }
    };
    loadData();
  }, [showNotification]);

  const uniqueSuppliers = useMemo(() => {
    return Array.from(new Set(goods.map(g => g.supplier).filter(Boolean)));
  }, [goods]);

  const filtered = useMemo(() => {
    let result = goods.filter(g =>
      g.article?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterSupplier !== 'all') {
      result = result.filter(g => g.supplier === filterSupplier);
    }

    return sortOrder === 'asc'
      ? result.toSorted((a, b) => a.quantity - b.quantity)
      : result.toSorted((a, b) => b.quantity - a.quantity);
  }, [goods, searchTerm, filterSupplier, sortOrder]);

  const logout = () => {
    setUser({});
    navigate('/');
  };

  // --- CRUD операции ---

  const handleAdd = () => {
    if (editModal !== null) {
      showNotification('Нельзя открыть две формы одновременно', 'warning');
      return;
    }
    setEditModal({});
  };

  const handleEdit = (good) => {
    if (editModal !== null) {
      showNotification('Нельзя открыть две формы одновременно', 'warning');
      return;
    }
    setEditModal(good);
  };

  const handleDelete = async (good) => {
    if (!window.confirm(`Удалить товар "${good.article}"?`)) return;

    try {
      const result = await window.api.deleteGood(good.id);
      if (result.success) {
        setGoods(prev => prev.filter(g => g.id !== good.id));
        showNotification('Товар удалён', 'success');
      } else {
        showNotification(result.message || 'Нельзя удалить товар', 'error');
      }
    } catch (err) {
      showNotification('Ошибка удаления', 'error');
    }
  };

  const handleSave = async (formData) => {
    try {
      if (formData.id) {
        await window.api.updateGood(formData);
        setGoods(prev => prev.map(g => g.id === formData.id ? { ...g, ...formData } : g));
        showNotification('Товар обновлён', 'success');
      } else {
        await window.api.addGood(formData);
        const newGood = { ...formData, id: Date.now() }; // временный ID
        setGoods(prev => [...prev, newGood]);
        showNotification('Товар добавлен', 'success');
      }
      setEditModal(null);
    } catch (err) {
      showNotification(err.message || 'Ошибка сохранения', 'error');
    }
  };

  const closeModal = () => setEditModal(null);

  return (
    <div className="store">
      {/* Уведомление */}
      {editModal && <EditGoodForm good={editModal} onSave={handleSave} onCancel={closeModal} />}

      {/* Хедер */}
      <div className="header-controls">
        <button onClick={logout} className="btn-logout">Выход</button>
        {user.role === 'Администратор' && (
          <button onClick={handleAdd} className="btn-add">➕ Добавить товар</button>
        )}
      </div>

      {/* Поиск и фильтры */}
      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по артикулу, типу, поставщику..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)}>
          <option value="all">Все поставщики</option>
          {uniqueSuppliers.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
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
            <div key={g.id} className="card-wrapper">
              <GoodsCard good={g} />
              {user.role === 'Администратор' && (
                <div className="card-actions">
                  <button onClick={() => handleEdit(g)} className="btn-edit">✏️ Редактировать</button>
                  <button onClick={() => handleDelete(g)} className="btn-delete">🗑️ Удалить</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Store;
