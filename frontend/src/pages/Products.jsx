import React, { useEffect, useState } from "react";
import {
  Search,
  ShoppingBag,
  ExternalLink,
  Star,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import client from "../api/client";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("match");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { label: "All", value: "" },
    { label: "Face Wash", value: "face_wash" },
    { label: "Serum", value: "serum" },
    { label: "Moisturizer", value: "moisturizer" },
    { label: "Sunscreen", value: "sunscreen" },
    { label: "Toner", value: "toner" },
    { label: "Treatment", value: "treatment" },
  ];

  useEffect(() => {
    loadProducts();
  }, [search, category, sort]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (category) {
        params.append("category", category);
      }

      if (sort) {
        params.append("sort", sort);
      }

      const query = params.toString();

      const response = await client.get(
        `/products/recommendations${query ? `?${query}` : ""}`
      );

      setProducts(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load recommended products."
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategory = (value) => {
    setCategory(value);

    if (value === "face_wash") {
      setSearch("");
    } else if (value === "serum") {
      setSearch("");
    } else if (value === "moisturizer") {
      setSearch("");
    } else if (value === "sunscreen") {
      setSearch("");
    } else if (value === "toner") {
      setSearch("");
    } else if (value === "treatment") {
      setSearch("");
    } else {
      setSearch("");
    }
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCategory("");
  };

  const sortOptions = [
    { label: "Best Match", value: "match" },
    { label: "Bestsellers", value: "bestseller" },
    { label: "Highest Rated", value: "rating" },
    { label: "Price: Low to High", value: "price_low" },
    { label: "Price: High to Low", value: "price_high" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Sparkles className="text-violet-600" size={28} />

          <h1 className="text-3xl font-bold text-gray-900">
            Recommended Products
          </h1>
        </div>

        <p className="text-gray-500 mt-2">
          Products ranked according to your skin profile and assessment.
        </p>
      </div>

      {/* Search + Sort */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search face wash, serum, moisturizer..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              size={18}
              className="text-gray-500"
            />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {categories.map((item) => (
            <button
              key={item.value}
              onClick={() => handleCategory(item.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                category === item.value
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Personalized message */}
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Sparkles
            size={20}
            className="text-violet-600 mt-0.5"
          />

          <div>
            <p className="font-semibold text-violet-900">
              Personalized for you
            </p>

            <p className="text-sm text-violet-700 mt-1">
              Your skin assessment is used to rank products by
              suitability. Higher match means better alignment
              with your skin profile and concerns.
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-4 mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-gray-500">
          Finding the best products for your skin...
        </div>
      )}

      {/* Empty */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Search
            size={40}
            className="mx-auto text-gray-300 mb-4"
          />

          <h2 className="text-lg font-semibold text-gray-800">
            No matching products found
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Try another search or choose a different category.
          </p>
        </div>
      )}

      {/* Products */}
      {!loading && products.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const match = Math.round(
              Number(product.suitability_score ?? 0)
            );

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition overflow-hidden"
              >
                {/* Image */}
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-52 object-cover"
                  />
                ) : (
                  <div className="w-full h-52 bg-gradient-to-br from-violet-50 to-orange-50 flex items-center justify-center">
                    <ShoppingBag
                      size={48}
                      className="text-violet-300"
                    />
                  </div>
                )}

                <div className="p-5">
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex gap-2">
                      {product.is_bestseller && (
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                          BESTSELLER
                        </span>
                      )}

                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                        {product.category?.replace("_", " ")}
                      </span>
                    </div>

                    <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-bold">
                      {match}% Match
                    </span>
                  </div>

                  {/* Product */}
                  <h2 className="text-lg font-bold text-gray-900">
                    {product.name}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {product.brand}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-3">
                    <Star
                      size={17}
                      fill="currentColor"
                      className="text-yellow-400"
                    />

                    <span className="font-semibold text-gray-800">
                      {Number(product.rating || 0).toFixed(1)}
                    </span>

                    <span className="text-sm text-gray-500">
                      ({Number(
                        product.review_count || 0
                      ).toLocaleString()}{" "}
                      reviews)
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Ingredients */}
                  {product.key_ingredients?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Key Ingredients
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {product.key_ingredients.map(
                          (ingredient) => (
                            <span
                              key={ingredient}
                              className="text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg text-gray-600"
                            >
                              {ingredient}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-end justify-between mt-6">
                    <div>
                      <p className="text-xs text-gray-400">
                        Available at
                      </p>

                      <p className="font-semibold text-gray-800">
                        {product.retailer ||
                          product.brand}
                      </p>
                    </div>

                    <p className="text-xl font-bold text-gray-900">
                      ${Number(product.price || 0).toFixed(2)}
                    </p>
                  </div>

                  {/* Buy */}
                  {product.purchase_url ? (
                    <a
                      href={product.purchase_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <ShoppingBag size={18} />
                      Buy Now
                      <ExternalLink size={16} />
                    </a>
                  ) : (
                    <button
                      disabled
                      className="mt-5 w-full bg-gray-200 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed"
                    >
                      Purchase link unavailable
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}