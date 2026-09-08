/**
 * Client for the Python ML inference microservice (ml/inference/serve.py).
 *
 * If ML_SERVICE_URL is unset, unreachable, or errors, this falls back to
 * the lightweight simulated analysis in aiAnalysis.js instead of failing
 * the request outright — uploading a report should never break just
 * because the ML service isn't running (e.g. in local dev without Python
 * set up). `source` on the returned object tells the caller which path
 * was actually used, so this is never silently misrepresented.
 */

const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { analyzeSkin } = require('./aiAnalysis');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL; // e.g. http://localhost:5001
const ML_TIMEOUT_MS = Number(process.env.ML_SERVICE_TIMEOUT_MS) || 8000;

function normalizeMlResult(mlResult) {
  // Shapes the Flask service's response into exactly the fields the
  // skin_reports table / frontend already expect (matches aiAnalysis.js).
  return {
    skin_type: mlResult.skin_type,
    skin_health_score: mlResult.skin_health_score,
    overall_condition: mlResult.overall_condition,
    concerns: (mlResult.concerns || []).map((c) => ({
      name: c.name,
      severity: c.severity,
      priority: c.priority,
    })),
    risk_factors: [], // demo CNN/RF track doesn't produce risk factors yet
    recommendations: (mlResult.concerns || []).map((c) => ({
      title: c.name,
      description: c.advice,
      category: c.category,
    })),
    source: 'ml-service',
    model: mlResult.model,
    confidence: mlResult.skin_type_confidence,
    disclaimer: mlResult.disclaimer,
  };
}

/**
 * Runs skin analysis on an uploaded image file.
 * @param {string} imagePath absolute path to the uploaded file on disk
 * @returns {Promise<object>} analysis result, always in the shape the
 *   skin_reports table expects, regardless of which path produced it.
 */
async function runSkinAnalysis(imagePath) {
  if (!ML_SERVICE_URL) {
    return { ...analyzeSkin(), source: 'simulated', disclaimer: 'Simulated result — ML_SERVICE_URL not configured.' };
  }

  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    const { data } = await axios.post(`${ML_SERVICE_URL}/predict`, form, {
      headers: form.getHeaders(),
      timeout: ML_TIMEOUT_MS,
    });

    if (data && data.error) {
      throw new Error(data.error);
    }

    return normalizeMlResult(data);
  } catch (err) {
    console.warn(`[mlClient] ML service call failed (${err.message}) — falling back to simulated analysis.`);
    return { ...analyzeSkin(), source: 'simulated-fallback', disclaimer: 'Simulated result — ML service was unreachable.' };
  }
}

module.exports = { runSkinAnalysis };
