import React, { useEffect, useState } from "react";
import {
  Search,
  ShoppingBag,
  ExternalLink,
  Star,
  Sparkles,
  SlidersHorizontal,
  Scale,
  X,
  Check,
} from "lucide-react";

import client from "../api/client";


export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("match");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Product comparison
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showComparison, setShowComparison] = useState(false);


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
    setSearch("");
  };


  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCategory("");
  };


  // ==========================================
  // SELECT / REMOVE PRODUCT FOR COMPARISON
  // ==========================================

  const toggleProductComparison = (product) => {
    const alreadySelected = selectedProducts.some(
      (item) => item.id === product.id
    );

    if (alreadySelected) {
      setSelectedProducts((previous) =>
        previous.filter((item) => item.id !== product.id)
      );
      return;
    }

    if (selectedProducts.length >= 3) {
      alert("You can compare a maximum of 3 products.");
      return;
    }

    setSelectedProducts((previous) => [
      ...previous,
      product,
    ]);
  };


  const removeComparisonProduct = (productId) => {
    setSelectedProducts((previous) =>
      previous.filter((product) => product.id !== productId)
    );
  };


  const clearComparison = () => {
    setSelectedProducts([]);
    setShowComparison(false);
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

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mb-8">

        <div className="flex items-center gap-3">
          <Sparkles
            className="text-violet-600"
            size={28}
          />

          <h1 className="text-3xl font-bold text-gray-900">
            Recommended Products
          </h1>
        </div>

        <p className="text-gray-500 mt-2">
          Products ranked according to your skin profile and assessment.
        </p>

      </div>


      {/* ==========================================
          SEARCH + SORT
      ========================================== */}

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


      {/* ==========================================
          PERSONALIZED MESSAGE
      ========================================== */}

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


      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (

        <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-4 mb-6">
          {error}
        </div>

      )}


      {/* ==========================================
          LOADING
      ========================================== */}

      {loading && (

        <div className="text-center py-12 text-gray-500">
          Finding the best products for your skin...
        </div>

      )}


      {/* ==========================================
          EMPTY
      ========================================== */}

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


      {/* ==========================================
          PRODUCTS
      ========================================== */}

      {!loading && products.length > 0 && (

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {products.map((product) => {

            const match = Math.round(
              Number(product.suitability_score ?? 0)
            );

            const isSelected = selectedProducts.some(
              (item) => item.id === product.id
            );


            return (

              <div
                key={product.id}
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-lg transition overflow-hidden ${
                  isSelected
                    ? "border-violet-500 ring-2 ring-violet-100"
                    : "border-gray-100"
                }`}
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

                  {/* Compare Button */}

                  <button
                    onClick={() =>
                      toggleProductComparison(product)
                    }
                    className={`mb-4 w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
                      isSelected
                        ? "bg-violet-100 text-violet-700 border border-violet-300"
                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-violet-50 hover:text-violet-700"
                    }`}
                  >

                    {isSelected ? (
                      <>
                        <Check size={17} />
                        Selected for Comparison
                      </>
                    ) : (
                      <>
                        <Scale size={17} />
                        Compare Product
                      </>
                    )}

                  </button>


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
                      (
                      {Number(
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
                        {product.retailer || product.brand}
                      </p>

                    </div>


                      <p className="text-xl font-bold text-gray-900">
                        {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(Number(product.price || 0))}
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


      {/* ==========================================
          FLOATING COMPARE BUTTON
      ========================================== */}

      {selectedProducts.length >= 2 && (

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">

          <button
            onClick={() => setShowComparison(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-4 rounded-2xl shadow-xl font-semibold flex items-center gap-3 transition"
          >

            <Scale size={20} />

            Compare {selectedProducts.length} Products

          </button>

        </div>

      )}


      {/* ==========================================
          COMPARISON MODAL
      ========================================== */}

      {showComparison && (

        <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto p-4">

          <div className="max-w-6xl mx-auto my-8 bg-white rounded-3xl shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between p-6 border-b">

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Product Comparison
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Compare products based on your skin profile.
                </p>

              </div>


              <button
                onClick={() => setShowComparison(false)}
                className="p-2 rounded-xl hover:bg-gray-100"
              >
                <X size={24} />
              </button>

            </div>


            {/* Comparison Table */}

            <div className="overflow-x-auto p-6">

              <table className="w-full min-w-[800px] border-collapse">

                <thead>

                  <tr>

                    <th className="text-left p-4 bg-gray-50 border-b font-semibold text-gray-600">
                      Feature
                    </th>


                    {selectedProducts.map((product) => (

                      <th
                        key={product.id}
                        className="p-4 bg-violet-50 border-b text-left min-w-[220px]"
                      >

                        <div className="flex items-start justify-between gap-2">

                          <div>

                            <p className="font-bold text-gray-900">
                              {product.name}
                            </p>

                            <p className="text-sm font-normal text-gray-500 mt-1">
                              {product.brand}
                            </p>

                          </div>


                          <button
                            onClick={() =>
                              removeComparisonProduct(product.id)
                            }
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X size={18} />
                          </button>

                        </div>

                      </th>

                    ))}

                  </tr>

                </thead>


                <tbody>

                  {/* Category */}

                  <tr>

                    <td className="p-4 border-b font-semibold text-gray-700">
                      Category
                    </td>

                    {selectedProducts.map((product) => (

                      <td
                        key={product.id}
                        className="p-4 border-b text-gray-600 capitalize"
                      >
                        {product.category?.replace("_", " ")}
                      </td>

                    ))}

                  </tr>


                  {/* Personalized Match */}

                  <tr className="bg-violet-50/40">

                    <td className="p-4 border-b font-semibold text-violet-800">
                      Personalized Match
                    </td>

                    {selectedProducts.map((product) => (

                      <td
                        key={product.id}
                        className="p-4 border-b"
                      >

                        <span className="inline-block bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-bold">
                          {Math.round(
                            Number(product.suitability_score ?? 0)
                          )}% Match
                        </span>

                      </td>

                    ))}

                  </tr>


                  {/* Price */}

                  <tr>

                    <td className="p-4 border-b font-semibold text-gray-700">
                      Price
                    </td>

                    {selectedProducts.map((product) => (

                    <td
                        key={product.id}
                        className="p-4 border-b font-bold text-gray-900"
                      >
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(Number(product.price || 0))}
                      </td>

                    ))}

                  </tr>


                  {/* Rating */}

                  <tr>

                    <td className="p-4 border-b font-semibold text-gray-700">
                      Rating
                    </td>

                    {selectedProducts.map((product) => (

                      <td
                        key={product.id}
                        className="p-4 border-b"
                      >

                        <div className="flex items-center gap-2">

                          <Star
                            size={17}
                            fill="currentColor"
                            className="text-yellow-400"
                          />

                          <span className="font-semibold">
                            {Number(product.rating || 0).toFixed(1)}
                          </span>

                        </div>

                      </td>

                    ))}

                  </tr>


                  {/* Reviews */}

                  <tr>

                    <td className="p-4 border-b font-semibold text-gray-700">
                      Reviews
                    </td>

                    {selectedProducts.map((product) => (

                      <td
                        key={product.id}
                        className="p-4 border-b text-gray-600"
                      >
                        {Number(
                          product.review_count || 0
                        ).toLocaleString()}
                      </td>

                    ))}

                  </tr>


                  {/* Ingredients */}

                  <tr>

                    <td className="p-4 border-b font-semibold text-gray-700 align-top">
                      Key Ingredients
                    </td>

                    {selectedProducts.map((product) => (

                      <td
                        key={product.id}
                        className="p-4 border-b"
                      >

                        <div className="flex flex-wrap gap-2">

                          {product.key_ingredients?.map(
                            (ingredient) => (

                              <span
                                key={ingredient}
                                className="text-xs bg-gray-100 px-2 py-1 rounded-lg"
                              >
                                {ingredient}
                              </span>

                            )
                          )}

                        </div>

                      </td>

                    ))}

                  </tr>


                  {/* Skin Types */}

                  <tr>

                    <td className="p-4 border-b font-semibold text-gray-700 align-top">
                      Suitable Skin Types
                    </td>

                    {selectedProducts.map((product) => (

                      <td
                        key={product.id}
                        className="p-4 border-b"
                      >

                        <div className="flex flex-wrap gap-2">

                          {product.suitable_skin_types?.map(
                            (skinType) => (

                              <span
                                key={skinType}
                                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg"
                              >
                                {skinType}
                              </span>

                            )
                          )}

                        </div>

                      </td>

                    ))}

                  </tr>


                  {/* Target Concerns */}

                  <tr>

                    <td className="p-4 border-b font-semibold text-gray-700 align-top">
                      Targets Concerns
                    </td>

                    {selectedProducts.map((product) => (

                      <td
                        key={product.id}
                        className="p-4 border-b"
                      >

                        <div className="flex flex-wrap gap-2">

                          {product.targets_concerns?.map(
                            (concern) => (

                              <span
                                key={concern}
                                className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-lg"
                              >
                                {concern}
                              </span>

                            )
                          )}

                        </div>

                      </td>

                    ))}

                  </tr>


                  {/* Retailer */}

                  <tr>

                    <td className="p-4 font-semibold text-gray-700">
                      Available At
                    </td>

                    {selectedProducts.map((product) => (

                      <td
                        key={product.id}
                        className="p-4 text-gray-600"
                      >
                        {product.retailer || product.brand}
                      </td>

                    ))}

                  </tr>

                </tbody>

              </table>

            </div>


            {/* Modal Footer */}

            <div className="flex flex-col sm:flex-row justify-between gap-3 p-6 border-t bg-gray-50 rounded-b-3xl">

              <button
                onClick={clearComparison}
                className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
              >
                Clear Comparison
              </button>


              <button
                onClick={() => setShowComparison(false)}
                className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold"
              >
                Done
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}