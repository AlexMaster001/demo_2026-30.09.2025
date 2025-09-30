export default function goodCard({ good }) {

  return <>
    <div className="goodsCard">
      <div className="goodsPhoto"><img src={`src/assets/${good.photo ? good.photo : 'picture.png'}`} alt="" /></div>
      <div className="goodsInfo">
        <div className="goodsHeading">{`${good.category} | ${good.type}`}</div>
        <p>{good.name}</p>
        <p>{good.description}</p>
        <p>{good.supplier}</p>
        <p>{good.manufacturer}</p>
        <p>{good.quantity}</p></div>
      <div className="goodsDiscount"><h3>{good.discount}%</h3></div>
    </div>
  </>
}