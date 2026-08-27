import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';

import {
  FlaskConical,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
} from 'lucide-react';


const INGREDIENTS = [
  'Retinoids',
  'Niacinamide',
  'Vitamin C',
  'Hyaluronic Acid',
  'Salicylic Acid',
  'Ceramides',
  'Peptides',
  'AHAs/BHAs',
];


export default function IngredientsPage() {
  const { user, fetchWithAuth } = useAuth();

  const [selectedIngredient, setSelectedIngredient] =
    useState('Retinoids');

  const [selectedInteractions, setSelectedInteractions] =
    useState(['Retinoids']);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');


  const toggleInteractionIngredient = (ingredient) => {
    setSelectedInteractions((prev) => {
      if (prev.includes(ingredient)) {
        // Keep at least one ingredient selected
        if (prev.length === 1) {
          return prev;
        }

        return prev.filter((item) => item !== ingredient);
      }

      return [...prev, ingredient];
    });
  };


  const analyzeIngredient = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetchWithAuth(
        'http://localhost:8000/ingredient/intelligence',
        {
          method: 'POST',
          body: JSON.stringify({
            ingredient: selectedIngredient,
            skin_type: user?.skinType || '',
            concerns: user?.concerns || [],
            sensitivity: 'Medium',
            allergies: user?.allergies || [],
            ingredients: selectedInteractions,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || 'Unable to analyze ingredient.'
        );
      }

      setResult(data.ingredient_intelligence);

    } catch (err) {
      console.error(err);
      setError(
        err.message ||
        'Something went wrong while analyzing the ingredient.'
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Ingredient Intelligence
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Analyze ingredient suitability, interactions,
          allergy conflicts and skincare benefits.
        </p>
      </div>


      {/* INGREDIENT SELECTION */}
      <GlassCard className="space-y-5">

        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-cyan-400" />

          <h2 className="text-lg font-bold text-white">
            Select an Ingredient
          </h2>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

          {INGREDIENTS.map((ingredient) => (

            <button
              key={ingredient}
              onClick={() =>
                setSelectedIngredient(ingredient)
              }
              className={`p-3 rounded-xl border text-sm font-semibold transition
                ${
                  selectedIngredient === ingredient
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500'
                }
              `}
            >
              {ingredient}
            </button>

          ))}

        </div>

      </GlassCard>


      {/* INTERACTION INGREDIENTS */}
      <GlassCard className="space-y-5">

        <div className="flex items-center gap-2">

          <ShieldAlert className="w-5 h-5 text-amber-400" />

          <h2 className="text-lg font-bold text-white">
            Check Ingredient Interactions
          </h2>

        </div>

        <p className="text-sm text-slate-400">
          Select ingredients you want to analyze together.
        </p>


        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

          {INGREDIENTS.map((ingredient) => (

            <button
              key={ingredient}
              onClick={() =>
                toggleInteractionIngredient(ingredient)
              }
              className={`p-3 rounded-xl border text-xs font-semibold transition
                ${
                  selectedInteractions.includes(ingredient)
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-amber-500'
                }
              `}
            >
              {ingredient}
            </button>

          ))}

        </div>


        <button
          onClick={analyzeIngredient}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 rounded-xl
          bg-cyan-500 hover:bg-cyan-400
          text-slate-950 font-bold
          transition disabled:opacity-60
          flex items-center justify-center gap-2"
        >

          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FlaskConical className="w-4 h-4" />
              Analyze Ingredient
            </>
          )}

        </button>

      </GlassCard>


      {/* ERROR */}
      {error && (

        <GlassCard className="border-rose-500/40">

          <div className="flex items-center gap-3 text-rose-400">

            <AlertTriangle className="w-5 h-5" />

            <p className="text-sm">
              {error}
            </p>

          </div>

        </GlassCard>

      )}


      {/* RESULTS */}
      {result && (

        <div className="space-y-6">


          {/* INGREDIENT OVERVIEW */}
          <GlassCard className="space-y-4">

            <div className="flex items-center gap-2">

              <Info className="w-5 h-5 text-cyan-400" />

              <h2 className="text-lg font-bold text-white">
                {result.ingredient.ingredient}
              </h2>

            </div>


            <p className="text-sm text-slate-300">
              {result.ingredient.description}
            </p>


            <div className="grid md:grid-cols-2 gap-6">


              {/* BENEFITS */}
              <div>

                <h3 className="font-semibold text-emerald-400 mb-3">
                  Benefits
                </h3>

                <ul className="space-y-2 text-sm text-slate-300">

                  {result.ingredient.benefits.map(
                    (item, index) => (

                      <li
                        key={index}
                        className="flex gap-2"
                      >

                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />

                        {item}

                      </li>

                    )
                  )}

                </ul>

              </div>


              {/* CAUTIONS */}
              <div>

                <h3 className="font-semibold text-amber-400 mb-3">
                  Cautions
                </h3>

                {result.ingredient.cautions.length > 0 ? (

                  <ul className="space-y-2 text-sm text-slate-300">

                    {result.ingredient.cautions.map(
                      (item, index) => (

                        <li
                          key={index}
                          className="flex gap-2"
                        >

                          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />

                          {item}

                        </li>

                      )
                    )}

                  </ul>

                ) : (

                  <p className="text-sm text-slate-400">
                    No major cautions identified.
                  </p>

                )}

              </div>

            </div>

          </GlassCard>


          {/* SUITABILITY */}
          <GlassCard className="space-y-4">

            <h2 className="text-lg font-bold text-white">
              Suitability Assessment
            </h2>


            <div className="flex items-center gap-3">

              <Badge
                variant={
                  result.suitability.suitability === 'Suitable'
                    ? 'emerald'
                    : 'amber'
                }
              >
                {result.suitability.suitability}
              </Badge>

            </div>


            <div className="space-y-2 text-sm text-slate-300">

              {result.suitability.reasons.map(
                (reason, index) => (

                  <p key={index}>
                    • {reason}
                  </p>

                )
              )}

            </div>

          </GlassCard>


          {/* INTERACTIONS */}
          <GlassCard className="space-y-4">

            <div className="flex items-center gap-2">

              <ShieldAlert className="w-5 h-5 text-rose-400" />

              <h2 className="text-lg font-bold text-white">
                Ingredient Interaction Analysis
              </h2>

            </div>


            {result.interactions.interactions_found.length > 0 ? (

              <div className="space-y-3">

                {result.interactions.interactions_found.map(
                  (interaction, index) => (

                    <div
                      key={index}
                      className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30"
                    >

                      <p className="font-semibold text-rose-300">

                        {interaction.ingredients.join(' + ')}

                      </p>

                      <p className="text-sm text-slate-300 mt-1">

                        {interaction.message}

                      </p>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="text-sm text-emerald-400">

                No known interaction conflicts detected.

              </div>

            )}

          </GlassCard>


          {/* ALLERGY CHECK */}
          <GlassCard className="space-y-3">

            <h2 className="text-lg font-bold text-white">
              Allergy Detection
            </h2>


            {result.allergy_check.allergy_conflict ? (

              <div className="flex gap-3 text-rose-400">

                <AlertTriangle className="w-5 h-5 flex-shrink-0" />

                <p className="text-sm">

                  {result.allergy_check.message}

                </p>

              </div>

            ) : (

              <div className="flex gap-3 text-emerald-400">

                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />

                <p className="text-sm">

                  {result.allergy_check.message}

                </p>

              </div>

            )}

          </GlassCard>


          {/* EDUCATION */}
          <GlassCard className="space-y-4">

            <div className="flex items-center gap-2">

              <Info className="w-5 h-5 text-cyan-400" />

              <h2 className="text-lg font-bold text-white">
                Ingredient Education
              </h2>

            </div>


            <p className="text-sm text-slate-300">

              {result.education.what_it_is}

            </p>


            <div>

              <h3 className="font-semibold text-cyan-400 mb-2">
                How to Use
              </h3>

              <p className="text-sm text-slate-300">

                {result.education.how_to_use}

              </p>

            </div>

          </GlassCard>

        </div>

      )}

    </div>
  );
}