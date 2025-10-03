// src/LoginForm.jsx
import { useNavigate } from "react-router-dom";

function LoginForm({ setUser, showNotification }) {
  const navigate = useNavigate();

  async function submitHandler(e) {
    e.preventDefault();
    const user = {
      login: e.target.login.value,
      password: e.target.password.value,
    };
    try {
      const { role, name } = await window.api.authorizeUser(user);
      setUser({ role, name });
      
      // ВСЕГДА переходим на /main после входа
      navigate('/main');
      
      document.querySelector('form').reset();
    } catch (err) {
      showNotification('Ошибка авторизации', 'error');
    }
  }

  return (
    <>
      <h1>Приветствие!</h1>
      <h4>Введите логин и пароль, чтобы войти</h4>
      <form onSubmit={submitHandler}>
        <label htmlFor="login">Логин:</label>
        <input id="login" type="text" required />
        <label htmlFor="password">Пароль:</label>
        <input id="password" type="password" required /> {/* ← Исправлено: type="password" */}
        <button type="submit">Войти</button>
      </form>
      <h5>Перейти на экран просмотра товаров в виде гостя</h5>
      <button onClick={() => {
        setUser({ role: 'гость' });
        navigate('/main');
      }}>Посмотреть товары</button>
    </>
  );
}

export default LoginForm;
