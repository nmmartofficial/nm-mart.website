import React, { useEffect, useState } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRp0eoVJhdbJUOEYETTbNJYWeK3U1b_V1NKQORwpPgSZBwY60P8kmxNEblHxjslaBujpChwynkJ9zfg/pub?output=csv";

  useEffect(() => {
    fetch(CSV_URL)
      .then(res => res.text())
      .then(text => {
        const rows = text.split("\n").slice(1);
        const data = rows.map(r => {
          const [name, mrp, saleRate, category] = r.split(",");
          return {
            name,
            mrp: Number(mrp),
            saleRate: Number(saleRate),
            category
          };
        });

        const filtered = data.filter(p => ((p.mrp - p.saleRate) / p.mrp) * 100 >= 50);
        setProducts(filtered);
      });
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const exist = prev.find(p => p.name === product.name);
      if (exist) {
        return prev.map(p => p.name === product.name ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const total = cart.reduce((sum, p) => sum + p.saleRate * p.qty, 0);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">NM MART</h1>

      <input
        placeholder="Search..."
        className="border p-2 my-3 w-full"
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        {products
          .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
          .map((p, i) => (
            <div key={i} className="border p-2">
              <h2>{p.name}</h2>
              <p className="line-through">₹{p.mrp}</p>
              <p className="text-green-600">₹{p.saleRate}</p>
              <button
                onClick={() => addToCart(p)}
                className="bg-blue-500 text-white px-2 py-1 mt-2"
              >
                Add to Cart
              </button>
            </div>
          ))}
      </div>

      <div className="mt-5 border-t pt-3">
        <h2 className="text-xl">Cart</h2>
        {cart.map((c, i) => (
          <div key={i}>
            {c.name} x {c.qty} = ₹{c.saleRate * c.qty}
          </div>
        ))}
        <h3 className="font-bold">Total: ₹{total}</h3>

        <button
          disabled={total < 500}
          className="bg-green-600 text-white px-4 py-2 mt-2 disabled:bg-gray-400"
          onClick={() => {
            const msg = cart.map(c => `${c.name} x${c.qty}`).join("%0A");
            window.open(`https://wa.me/917081154604?text=Order:%0A${msg}%0ATotal: ₹${total}`);
          }}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
