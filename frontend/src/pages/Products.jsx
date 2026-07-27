import React, { useEffect, useState } from 'react'
import client from '../api/client'

export default function Products() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('/products/recommendations').then((res) => setProducts(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load recommendations'))
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Recommended Products</h1>
      <p className="text-gray-500 mb-6">Ranked by suitability for your skin profile.</p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-semibold text-gray-800">{p.name}</h3>
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                {Math.round(p.suitability_score)}% match
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{p.brand} · {p.category}</p>
            <p className="text-sm text-gray-600 mb-2">{p.description}</p>
            <p className="text-sm font-medium text-gray-800">${p.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
