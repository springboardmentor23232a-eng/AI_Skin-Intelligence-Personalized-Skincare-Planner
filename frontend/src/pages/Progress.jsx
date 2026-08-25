import React, { useEffect, useMemo, useState } from 'react'
import client from '../api/client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'

import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
)


export default function Progress() {
  const [history, setHistory] = useState([])
  const [photos, setPhotos] = useState([])

  const [form, setForm] = useState({
    routine_followed_morning: false,
    routine_followed_evening: false,
    skin_condition_note: '',
  })

  const [uploadingBefore, setUploadingBefore] = useState(false)
  const [uploadingCurrent, setUploadingCurrent] = useState(false)

  const [savingLog, setSavingLog] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')


  // =========================================================
  // LOAD DATA
  // =========================================================

  const load = async () => {
    try {
      setError('')

      const [historyRes, photosRes] = await Promise.all([
        client.get('/progress/history'),
        client.get('/progress/photos'),
      ])

      setHistory(historyRes.data || [])
      setPhotos(photosRes.data || [])
    } catch (err) {
      console.error('Progress loading error:', err)

      setError(
        err.response?.data?.detail ||
        'Failed to load progress data.'
      )
    }
  }


  useEffect(() => {
  load()
}, [])

// =========================================================
// DOWNLOAD PROFESSIONAL REPORT
// =========================================================

const downloadReport = async (type) => {
  try {
    setError('')
    setSuccess('')

    const response = await client.get(
      `/reports/${type}/pdf`,
      {
        responseType: 'blob',
      }
    )

    const blob = new Blob(
      [response.data],
      {
        type: 'application/pdf',
      }
    )

    const url =
      window.URL.createObjectURL(blob)

    const link =
      document.createElement('a')

    link.href = url

    link.download =
      type === 'weekly'
        ? 'skiniq_weekly_skin_health_report.pdf'
        : 'skiniq_monthly_skin_health_report.pdf'

    document.body.appendChild(link)

    link.click()

    link.remove()

    window.URL.revokeObjectURL(url)

    setSuccess(
      `${type === 'weekly' ? 'Weekly' : 'Monthly'} professional report downloaded successfully.`
    )

  } catch (err) {

    console.error(
      'Report download error:',
      err
    )

    setError(
      err.response?.data?.detail ||
      'Failed to download the report.'
    )
  }
}



  // =========================================================
  // PHOTO ARRAYS
  // =========================================================

  const beforePhotos = useMemo(
    () =>
      photos
        .filter(
          (photo) =>
            photo.photo_type === 'before'
        )
        .sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        ),
    [photos]
  )

  const currentPhotos = useMemo(
    () =>
      photos
        .filter(
          (photo) =>
            photo.photo_type === 'current'
        )
        .sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        ),
    [photos]
  )


  const beforePhoto = beforePhotos[0]
  const currentPhoto = currentPhotos[0]


  // =========================================================
  // IMAGE URL
  // =========================================================

  const getImageUrl = (photoUrl) => {
    if (!photoUrl) {
      return ''
    }

    if (photoUrl.startsWith('http')) {
      return photoUrl
    }

    const apiBase =
      client.defaults.baseURL || ''

    const serverBase =
      apiBase.replace(/\/api\/?$/, '')

    return `${serverBase}${photoUrl}`
  }


  // =========================================================
  // PHOTO UPLOAD
  // =========================================================

  const uploadPhoto = async (file, type) => {
    if (!file) {
      return
    }

    setError('')
    setSuccess('')

    if (!file.type.startsWith('image/')) {
      setError(
        'Please select a JPG, PNG or WEBP image.'
      )
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        'Image size must be less than 5 MB.'
      )
      return
    }

    const formData = new FormData()

    formData.append(
      'file',
      file
    )

    try {
      if (type === 'before') {
        setUploadingBefore(true)
      } else {
        setUploadingCurrent(true)
      }

      const response = await client.post(
        `/progress/photos?photo_type=${type}`,
        formData
      )

      console.log(
        'AI photo analysis:',
        response.data
      )

      await load()

      setSuccess(
        `${type === 'before' ? 'Before' : 'Current'} photo analyzed successfully.`
      )

    } catch (err) {
      console.error(
        'Photo upload error:',
        err
      )

      const message =
        err.response?.data?.detail ||
        `Failed to analyze ${type} photo.`

      setError(message)

    } finally {
      setUploadingBefore(false)
      setUploadingCurrent(false)
    }
  }


  const handlePhotoSelect = (
    event,
    type
  ) => {
    const file =
      event.target.files?.[0]

    if (file) {
      uploadPhoto(
        file,
        type
      )
    }

    event.target.value = ''
  }


  // =========================================================
  // BEFORE / CURRENT SCORE
  // =========================================================

  const beforeScore =
    beforePhoto?.skin_health_score != null
      ? Number(
          beforePhoto.skin_health_score
        )
      : null


  const currentScore =
    currentPhoto?.skin_health_score != null
      ? Number(
          currentPhoto.skin_health_score
        )
      : null


  const photoImprovement =
    beforeScore != null &&
    currentScore != null
      ? currentScore - beforeScore
      : null


  // =========================================================
  // CURRENT DAILY SCORE
  // =========================================================

  const latestHistoryScore =
    history.length > 0 &&
    history[0]?.skin_health_score != null
      ? Number(
          history[0].skin_health_score
        )
      : null


  // =========================================================
  // DAILY PROGRESS LOG
  // =========================================================

  const submit = async (event) => {
    event.preventDefault()

    if (savingLog) {
      return
    }

    setError('')
    setSuccess('')

    try {
      setSavingLog(true)

      const response =
        await client.post(
          '/progress/log',
          form
        )

      console.log(
        'Progress log saved:',
        response.data
      )

      setForm({
        routine_followed_morning: false,
        routine_followed_evening: false,
        skin_condition_note: '',
      })

      await load()

      setSuccess(
        'Today’s progress was saved successfully.'
      )

    } catch (err) {
      console.error(
        'Progress log error:',
        err
      )

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to save progress log. Please try again.'
      )

    } finally {
      setSavingLog(false)
    }
  }


  // =========================================================
  // CHRONOLOGICAL HISTORY
  // =========================================================

  const chronological =
    [...history].reverse()


  // =========================================================
  // CHART
  // =========================================================

  const chartData = {
    labels:
      chronological.map(
        (item) =>
          new Date(
            item.log_date
          ).toLocaleDateString(
            undefined,
            {
              month: 'short',
              day: 'numeric',
            }
          )
      ),

    datasets: [
      {
        label:
          'Skin Health Score',

        data:
          chronological.map(
            (item) =>
              item.skin_health_score
        ),

        borderColor:
          '#d97757',

        backgroundColor:
          'rgba(217, 119, 87, 0.12)',

        fill: true,

        tension: 0.3,

        pointRadius: 5,

        pointHoverRadius: 7,
      },
    ],
  }


  const chartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (context) => {
            const value =
              context.raw

            return value != null
              ? ` Skin Health: ${Number(
                  value
                ).toFixed(1)}/100`
              : ' No score'
          },
        },
      },
    },

    scales: {
      y: {
        min: 0,
        max: 100,

        ticks: {
          stepSize: 10,
        },
      },
    },
  }


  // =========================================================
  // OVERVIEW SCORE
  // =========================================================

  const overviewScore =
    currentScore ??
    latestHistoryScore ??
    null


  const previousHistoryScore =
    history.length > 1 &&
    history[1]?.skin_health_score != null
      ? Number(
          history[1].skin_health_score
        )
      : null


  const scoreChange =
    overviewScore != null &&
    previousHistoryScore != null
      ? overviewScore -
        previousHistoryScore
      : photoImprovement


  // =========================================================
  // ROUTINE ADHERENCE
  // =========================================================

  const routineLogs =
    history.filter(
      (item) =>
        item.routine_followed_morning ||
        item.routine_followed_evening
    )


  const routineAdherence =
    history.length > 0
      ? Math.round(
          (
            routineLogs.length /
            history.length
          ) * 100
        )
      : 0


  // =========================================================
  // AI INSIGHT
  // =========================================================

  let progressInsight =
    'Keep recording your progress to receive personalized AI insights.'


  if (photoImprovement !== null) {
    if (photoImprovement > 5) {
      progressInsight =
        'Your AI skin-health score has improved significantly between the Before and Current photos. Continue following your skincare routine consistently.'
    } else if (photoImprovement > 0) {
      progressInsight =
        'Your AI skin-health score shows improvement. Continue your skincare routine and keep tracking your progress.'
    } else if (photoImprovement < 0) {
      progressInsight =
        'Your Current photo has a lower AI skin-health score than your Before photo. Review your recent skincare routine and continue monitoring changes.'
    } else {
      progressInsight =
        'Your AI skin-health score is currently stable. Continue your routine and keep tracking your progress.'
    }
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* HEADER */}

      <div className="mb-6">

        <h1 className="text-2xl font-bold text-gray-800">
          Progress Tracking
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Track your skin health, improvement
          and skincare consistency over time.
        </p>

      </div>


      {/* SUCCESS */}

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}


      {/* ERROR */}

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}


      {/* =====================================================
          BEFORE & AFTER
      ====================================================== */}

      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">

          <div>

            <h2 className="font-semibold text-lg text-gray-800">
              Before & After
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Compare your skin progress using
              AI-analyzed skin images.
            </p>

          </div>


          {photoImprovement !== null && (
            <div
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                photoImprovement >= 0
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {photoImprovement >= 0
                ? '+'
                : ''}
              {photoImprovement.toFixed(1)}
              {' '}points
            </div>
          )}

        </div>


        <div className="grid md:grid-cols-2 gap-5">

          <PhotoCard
            title="Before"
            photo={beforePhoto}
            uploading={uploadingBefore}
            onSelect={(event) =>
              handlePhotoSelect(
                event,
                'before'
              )
            }
            getImageUrl={getImageUrl}
          />


          <PhotoCard
            title="Current"
            photo={currentPhoto}
            uploading={uploadingCurrent}
            onSelect={(event) =>
              handlePhotoSelect(
                event,
                'current'
              )
            }
            getImageUrl={getImageUrl}
          />

        </div>


        {photoImprovement !== null && (
          <div className="mt-5 p-5 rounded-xl bg-gray-50 text-center">

            <p className="text-sm text-gray-500">
              AI Skin Health Improvement
            </p>

            <p
              className={`text-3xl font-bold mt-1 ${
                photoImprovement >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {photoImprovement >= 0
                ? '+'
                : ''}
              {photoImprovement.toFixed(1)}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Difference between the AI-analyzed
              Before and Current image scores.
            </p>

          </div>
        )}

      </div>


      {/* =====================================================
          SKIN HEALTH OVERVIEW
      ====================================================== */}

      <div className="mb-8">

        <h2 className="font-semibold text-lg text-gray-800 mb-4">
          Skin Health Overview
        </h2>


        <div className="grid md:grid-cols-3 gap-4">

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

            <p className="text-sm text-gray-500">
              Current Skin Health
            </p>

            <p className="text-3xl font-bold text-gray-800 mt-2">
              {overviewScore != null
                ? overviewScore.toFixed(1)
                : '—'}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Out of 100
            </p>

          </div>


          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

            <p className="text-sm text-gray-500">
              Score Change
            </p>

            <p
              className={`text-3xl font-bold mt-2 ${
                scoreChange === null
                  ? 'text-gray-400'
                  : scoreChange >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
              }`}
            >
              {scoreChange !== null
                ? `${
                    scoreChange >= 0
                      ? '+'
                      : ''
                  }${scoreChange.toFixed(1)}`
                : '—'}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Compared with previous recorded score
            </p>

          </div>


          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

            <p className="text-sm text-gray-500">
              Routine Tracking
            </p>

            <p className="text-3xl font-bold text-gray-800 mt-2">
              {routineAdherence}%
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Based on recorded routine logs
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          AI PROGRESS INSIGHT
      ====================================================== */}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8">

        <div className="flex items-start gap-3">

          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-lg shrink-0">
            ✨
          </div>

          <div>

            <h2 className="font-semibold text-gray-800">
              AI Progress Insight
            </h2>

            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {progressInsight}
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          SKIN HEALTH TREND
      ====================================================== */}

      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-8">

        <div className="mb-4">

          <h2 className="font-semibold text-lg text-gray-800">
            Skin Health Trend
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Monitor how your recorded skin-health
            score changes over time.
          </p>

        </div>


        {chronological.length > 1 ? (

          <div className="h-[320px]">

            <Line
              data={chartData}
              options={chartOptions}
            />

          </div>

        ) : (

          <div className="h-[180px] flex items-center justify-center text-sm text-gray-500">
            Continue recording your progress to see
            your skin-health trend here.
          </div>

        )}

      </div>


      {/* =====================================================
          DAILY ROUTINE
      ====================================================== */}

      <form
        onSubmit={submit}
        className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-8"
      >

        <div className="mb-4">

          <h2 className="font-semibold text-lg text-gray-800">
            Daily Routine Tracking
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Record whether you followed your skincare
            routine today.
          </p>

        </div>


        <div className="grid md:grid-cols-2 gap-4 mb-4">

          <label className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100 cursor-pointer">

            <input
              type="checkbox"
              checked={
                form.routine_followed_morning
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  routine_followed_morning:
                    event.target.checked,
                })
              }
              className="w-4 h-4"
            />

            <div>

              <p className="font-medium text-gray-800">
                Morning Routine
              </p>

              <p className="text-xs text-gray-500">
                Cleansing, treatment,
                moisturizer and sun protection.
              </p>

            </div>

          </label>


          <label className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100 cursor-pointer">

            <input
              type="checkbox"
              checked={
                form.routine_followed_evening
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  routine_followed_evening:
                    event.target.checked,
                })
              }
              className="w-4 h-4"
            />

            <div>

              <p className="font-medium text-gray-800">
                Evening Routine
              </p>

              <p className="text-xs text-gray-500">
                Cleansing, treatment,
                moisturizer and night care.
              </p>

            </div>

          </label>

        </div>


        <textarea
          placeholder="Notes on how your skin feels today..."
          value={form.skin_condition_note}
          onChange={(event) =>
            setForm({
              ...form,
              skin_condition_note:
                event.target.value,
            })
          }
          className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
          rows={3}
        />


        <button
          type="submit"
          disabled={savingLog}
          className="mt-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium"
        >
          {savingLog
            ? 'Saving...'
            : "Save Today's Progress"}
        </button>

      </form>


      {/* =====================================================
          PROGRESS HISTORY
      ====================================================== */}

      <div className="mb-8">

        <div className="mb-4">

          <h2 className="font-semibold text-lg text-gray-800">
            Progress History
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Your previous daily progress records.
          </p>

        </div>


        {history.length === 0 ? (

          <div className="bg-white rounded-xl p-5 border border-gray-100 text-sm text-gray-500">
            No progress records yet.
          </div>

        ) : (

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

            {history.map(
              (item, index) => {

                const previous =
                  history[index + 1]
                    ?.skin_health_score


                const change =
                  item.skin_health_score != null &&
                  previous != null
                    ? Number(
                        item.skin_health_score
                      ) -
                      Number(previous)
                    : null


                return (
                  <div
                    key={item.id}
                    className="p-4 border-b border-gray-100 last:border-b-0"
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="font-medium text-gray-800">

                          {new Date(
                            item.log_date
                          ).toLocaleDateString(
                            undefined,
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}

                        </p>


                        <p className="text-sm text-gray-500 mt-1">

                          {item.skin_condition_note ||
                            'No note added.'}

                        </p>


                        <div className="flex flex-wrap gap-3 mt-2 text-xs">

                          {item.routine_followed_morning && (
                            <span className="text-green-600">
                              ✓ Morning
                            </span>
                          )}

                          {item.routine_followed_evening && (
                            <span className="text-green-600">
                              ✓ Evening
                            </span>
                          )}

                          {!item.routine_followed_morning &&
                            !item.routine_followed_evening && (
                              <span className="text-gray-400">
                                No routine recorded
                              </span>
                            )}

                        </div>

                      </div>


                      <div className="text-right shrink-0">

                        <p className="font-semibold text-gray-800">

                          {item.skin_health_score != null
                            ? `${Number(
                                item.skin_health_score
                              ).toFixed(1)}/100`
                            : '—'}

                        </p>


                        {change !== null && (
                          <p
                            className={`text-xs mt-1 ${
                              change >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {change >= 0
                              ? '+'
                              : ''}
                            {change.toFixed(1)}
                          </p>
                        )}

                      </div>

                    </div>

                  </div>
                )
              }
            )}

          </div>

        )}

      </div>


     {/* =====================================================
          REPORTS & INSIGHTS
      ====================================================== */}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8">

        <h2 className="font-semibold text-lg text-gray-800">
          Reports & Insights
        </h2>

        <p className="text-sm text-gray-500 mt-1 mb-5">
          Download professional summaries of your skincare progress.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">

          {/* WEEKLY */}

          <div className="border border-gray-200 rounded-xl p-5">

            <h3 className="font-semibold text-gray-800">
              Weekly Professional Report
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Summary of your last 7 days of progress,
              routine consistency and skin-health score.
            </p>

            <div className="mt-4 text-sm text-gray-600 space-y-2">

              <div className="flex justify-between">
                <span>Current score</span>

                <span className="font-semibold">
                  {overviewScore != null
                    ? `${overviewScore.toFixed(1)}/100`
                    : 'Not available'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Routine adherence</span>

                <span className="font-semibold">
                  {routineAdherence}%
                </span>
              </div>

            </div>

            <button
              type="button"
              onClick={() => downloadReport('weekly')}
              className="mt-5 w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-semibold"
            >
              Download Weekly PDF
            </button>

          </div>


          {/* MONTHLY */}

          <div className="border border-gray-200 rounded-xl p-5">

            <h3 className="font-semibold text-gray-800">
              Monthly Professional Report
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Detailed summary of your last 30 days,
              including progress and photo comparison.
            </p>

            <div className="mt-4 text-sm text-gray-600 space-y-2">

              <div className="flex justify-between">
                <span>Current score</span>

                <span className="font-semibold">
                  {overviewScore != null
                    ? `${overviewScore.toFixed(1)}/100`
                    : 'Not available'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Photo comparison</span>

                <span className="font-semibold">
                  {beforeScore != null && currentScore != null
                    ? `${beforeScore.toFixed(1)} → ${currentScore.toFixed(1)}`
                    : 'Upload both'}
                </span>
              </div>

            </div>

            <button
              type="button"
              onClick={() => downloadReport('monthly')}
              className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold"
            >
              Download Monthly PDF
            </button>

          </div>

        </div>

        <div className="mt-5 p-4 rounded-lg bg-gray-50 border border-gray-100">

          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">
              Note:
            </span>{' '}
            Reports are generated from your recorded skincare
            information and AI-assisted analysis. They are for
            personal progress tracking and informational purposes,
            not medical diagnosis.
          </p>

        </div>

      </div>

    </div>
  )
}
// =========================================================
// PHOTO CARD
// =========================================================

function PhotoCard({
  title,
  photo,
  uploading,
  onSelect,
  getImageUrl,
}) {

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">

      {/* IMAGE */}

      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">

        {photo?.photo_url ? (

          <img
            src={getImageUrl(
              photo.photo_url
            )}
            alt={`${title} skin progress`}
            className="w-full h-full object-cover"
          />

        ) : (

          <div className="text-center px-5">

            <div className="text-4xl mb-2">
              📷
            </div>

            <p className="text-sm text-gray-500">
              No {title.toLowerCase()} photo
            </p>

          </div>

        )}

      </div>


      {/* DETAILS */}

      <div className="p-4">

        <div className="flex items-center justify-between mb-2">

          <h3 className="font-semibold text-gray-800">
            {title}
          </h3>


          {photo?.skin_health_score != null && (
            <span className="text-sm font-semibold text-primary-600">
              {Number(
                photo.skin_health_score
              ).toFixed(1)}
              /100
            </span>
          )}

        </div>


        {photo?.skin_health_score != null && (
          <p className="text-xs text-gray-500 mb-2">
            AI skin-health score
          </p>
        )}


        {photo?.created_at && (
          <p className="text-xs text-gray-400 mb-3">
            Analyzed on{' '}
            {new Date(
              photo.created_at
            ).toLocaleDateString()}
          </p>
        )}


        <label className="block">

          <span className="inline-flex items-center justify-center w-full px-4 py-2 rounded-lg bg-black text-white text-sm font-medium cursor-pointer hover:bg-gray-800">

            {uploading
              ? 'Analyzing with AI...'
              : photo
                ? `Replace ${title} Photo`
                : `Upload ${title} Photo`}

          </span>


          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onSelect}
            disabled={uploading}
          />

        </label>

      </div>

    </div>
  )
}