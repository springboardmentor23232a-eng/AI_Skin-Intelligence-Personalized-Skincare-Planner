import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductCard({ products = [] }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-sm text-orange-500 font-semibold">
            AI MATCHED
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-1">
            Recommended Products
          </h2>
        </div>

        <Sparkles className="text-orange-400" />
      </div>

      {products.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-gray-500 text-sm">
            Complete your skin profile to receive personalized products.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.slice(0, 4).map((product) => {
            const match = Math.round(
              Number(product.suitability_score ?? 0)
            );

            return (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-orange-50 transition"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {product.name}
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Personalized for your skin
                  </p>
                </div>

                <div className="shrink-0 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold">
                  {match}% match
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Link
        to="/products"
        className="mt-5 flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700"
      >
        Explore all products
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}