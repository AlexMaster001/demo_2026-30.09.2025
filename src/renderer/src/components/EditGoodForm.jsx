// src/components/EditGoodForm.jsx
import { useState, useRef } from 'react';

export default function EditGoodForm({ good, onSave, onCancel }) {
  const [form, setForm] = useState({
    id: good?.id || null,
    article: good?.article || '',
    type: good?.type || '',
    category: good?.category || '',
    manufacturer: good?.manufacturer || '',
    supplier: good?.supplier || '',
    description: good?.description || '',
    price: good?.price || '',
    measure: good?.measure || '',
    quantity: good?.quantity || '',
    discount: good?.discount || '',
    image_path: good?.image_path || 'picture.png'
  });

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      // Эмулируем сохранение файла в public/assets/
      const filename = `upload_${Date.now()}_${file.name}`;
      setForm(prev => ({ ...prev, image_path: filename }));

      // Здесь можно отправить файл через IPC, если нужно сохранить физически
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация
    if (!form.article || !form.type || isNaN(form.price) || form.price < 0 || isNaN(form.quantity) || form.quantity < 0) {
      alert('Проверьте корректность данных!');
      return;
    }

    try {
      await onSave(form);
    } catch (err) {
      alert(err.message || 'Ошибка сохранения');
    }
  };

  const photoSrc = form.image_path ? `/assets/${form.image_path}` : '/assets/picture.png';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{good ? 'Редактировать товар' : 'Добавить товар'}</h2>
        <form onSubmit={handleSubmit}>
          <label>Артикул *</label>
          <input name="article" value={form.article} onChange={handleChange} required />

          <label>Тип *</label>
          <input name="type" value={form.type} onChange={handleChange} required />

          <label>Категория</label>
          <input name="category" value={form.category} onChange={handleChange} />

          <label>Производитель</label>
          <input name="manufacturer" value={form.manufacturer} onChange={handleChange} />

          <label>Поставщик</label>
          <input name="supplier" value={form.supplier} onChange={handleChange} />

          <label>Описание</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows="2" />

          <label>Цена (₽) *</label>
          <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />

          <label>Единица измерения</label>
          <input name="measure" value={form.measure} onChange={handleChange} />

          <label>Количество на складе *</label>
          <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} required />

          <label>Скидка (%)</label>
          <input name="discount" type="number" min="0" max="100" value={form.discount} onChange={handleChange} placeholder="0–100" />

          <label>Фото товара</label>
          <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
          <img
            src={photoSrc}
            alt="Preview"
            onError={(e) => { e.target.src = '/assets/picture.png'; }}
            style={{ width: '100px', marginTop: '10px', borderRadius: '8px' }}
          />

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">Отмена</button>
            <button type="submit" className="btn-save">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
}
