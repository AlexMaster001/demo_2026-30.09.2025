import { useNavigate } from "react-router";
import GoodsCard from "./components/GoodsCard";
import { useEffect, useState } from "react";

let byIncreasingCount = false;

function Store({ user, setUser }) {
  const [goods, setGoods] = useState([]);
  const sortGoodsByQuantity = () => {
    byIncreasingCount 
      ? setGoods(goods.toSorted((a, b) => a.quantity - b.quantity))
      : setGoods(goods.toSorted((a, b) => b.quantity - a.quantity))
    byIncreasingCount = !byIncreasingCount
  }
  const sortGoodsBySupplier = () => {

  }

  useEffect(() => {
    (async function getGoods() {
      const res = await window.api.getGoods();
      setGoods(res);
    })()
  }, [])
  const navigate = useNavigate();

  return (
    <>
      {user.role !== 'гость' ? <button onClick={() => { setUser({}); navigate('/') }}>Выйти</button> : <button onClick={() => { setUser({}); navigate('/') }}>На страницу Логина</button>}
      <h1>Магазин</h1>
      {user.role !== 'гость' ? <div>
        <button onClick={() => sortGoodsByQuantity()}>Сортировать товары по количеcтву на складе</button>
        <button onClick={() => sortGoodsBySupplier()}>Сортировать товары по поставщику</button>
      </div> : ''}
      <div className="goodsContainer">
        {goods.map((good) => <GoodsCard good={good} key={good.id} />)}
      </div>
    </>
  )
}

export default Store

