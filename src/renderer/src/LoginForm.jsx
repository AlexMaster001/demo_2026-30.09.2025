import { useNavigate } from "react-router";

function LoginForm({ setUser }) {
  const navigate = useNavigate();

  async function submitHandler(e) {
    e.preventDefault()
    const user = {
      login: e.target.login.value,
      password: e.target.password.value,
    }
    const { role, name } = await window.api.autorizeUser(user);
    console.log(role, name)
    setUser({ role, name })
    if (role === 'Администратор') {
      navigate('/main');
    }
    document.querySelector('form').reset()
  }

  return (
    <>
      <h1>Приветствие!</h1>
      <h4>Введите логин и пароль, чтобы войти</h4>
      <form onSubmit={(e) => submitHandler(e)}>
        <label htmlFor="login">Логин:</label>
        <input id="login" type="text" required />
        <label htmlFor="password">Пароль:</label>
        <input id="password" type="text" required />
        <button type="submit">Войти</button>
      </form>
      <h5>Перейти на экран просмотра товаров в виде гостя</h5>
      <button onClick={() => {
        setUser({ role: 'гость' });
        navigate('/main');
      }}>Посмотреть товары</button>
    </>
  )
}

export default LoginForm

