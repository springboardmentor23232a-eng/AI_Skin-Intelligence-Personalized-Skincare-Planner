import React, { useEffect, useRef, useState } from 'react'
import client from '../api/client'

export default function Assessment() {
  const [assessment, setAssessment] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ML states
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [mlResult, setMlResult] = useState(null)
  const [mlError, setMlError] = useState('')
  const [mlLoading, setMlLoading] = useState(false)

  // Camera states
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  // --------------------------------------------------
  // Run normal skin assessment
  // --------------------------------------------------

  const runAssessment = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await client.post('/assessment/run')
      setAssessment(res.data)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Failed to run assessment'
      )
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------
  // Select image from device
  // --------------------------------------------------

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setMlError('Please select a valid image file.')
      setSelectedImage(null)
      setImagePreview('')
      return
    }

    setSelectedImage(file)
    setMlResult(null)
    setMlError('')

    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  // --------------------------------------------------
  // Open camera
  // --------------------------------------------------

  const openCamera = async () => {
    setCameraError('')

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          'Camera is not supported by this browser.'
        )
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user'
        },
        audio: false
      })

      streamRef.current = stream
      setCameraOpen(true)

      // Wait until camera modal is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch (err) {
      console.error(err)

      setCameraError(
        'Unable to access camera. Please allow camera permission and try again.'
      )
    }
  }

  // --------------------------------------------------
  // Close camera
  // --------------------------------------------------

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })

      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setCameraOpen(false)
    setCameraError('')
  }

  // --------------------------------------------------
  // Capture photo from camera
  // --------------------------------------------------

  const capturePhoto = () => {
    const video = videoRef.current

    if (!video) {
      return
    }

    if (!video.videoWidth || !video.videoHeight) {
      setCameraError(
        'Camera is not ready yet. Please wait a moment and try again.'
      )
      return
    }

    const canvas = document.createElement('canvas')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    )

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError('Failed to capture image.')
          return
        }

        const file = new File(
          [blob],
          `skin-camera-${Date.now()}.jpg`,
          {
            type: 'image/jpeg'
          }
        )

        const previewUrl = URL.createObjectURL(file)

        setSelectedImage(file)
        setImagePreview(previewUrl)
        setMlResult(null)
        setMlError('')

        closeCamera()
      },
      'image/jpeg',
      0.9
    )
  }

  // --------------------------------------------------
  // Stop camera when page is closed/unmounted
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop()
        })
      }

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  // --------------------------------------------------
  // Send image to ML API
  // --------------------------------------------------

  const analyzeSkinImage = async () => {
    if (!selectedImage) {
      setMlError('Please take a photo or upload a skin image first.')
      return
    }

    setMlLoading(true)
    setMlError('')
    setMlResult(null)

    try {
      const formData = new FormData()

      formData.append('file', selectedImage)

      const res = await client.post(
        '/ml/predict',
        formData
      )

      setMlResult(res.data)
    } catch (err) {
      setMlError(
        err.response?.data?.detail ||
          'Failed to analyze skin image.'
      )
    } finally {
      setMlLoading(false)
    }
  }

  // --------------------------------------------------
  // Remove selected image
  // --------------------------------------------------

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview('')
    setMlResult(null)
    setMlError('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // --------------------------------------------------
  // Helper for severity styling
  // --------------------------------------------------

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'mild':
        return 'bg-green-100 text-green-700'

      case 'moderate':
        return 'bg-yellow-100 text-yellow-700'

      case 'severe':
        return 'bg-orange-100 text-orange-700'

      case 'very severe':
        return 'bg-red-100 text-red-700'

      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-8">

      {/* ------------------------------------------------ */}
      {/* PAGE HEADER */}
      {/* ------------------------------------------------ */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Skin Assessment
        </h1>

        <p className="text-gray-600 mt-1">
          Analyze your skin profile and use AI to estimate
          acne severity from a skin image.
        </p>
      </div>

      {/* ------------------------------------------------ */}
      {/* AI SKIN IMAGE ANALYSIS */}
      {/* ------------------------------------------------ */}

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">

        <div className="mb-5">
          <h2 className="text-xl font-semibold text-gray-900">
            AI Skin Image Analysis
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Take a photo using your camera or upload a clear
            skin image to estimate acne severity.
          </p>
        </div>

        {/* Image upload area */}

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">

          {/* Hidden file input */}

          <input
            ref={fileInputRef}
            id="skin-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Camera + Upload buttons */}

          {!selectedImage && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">

              {/* Camera button */}

              <button
                type="button"
                onClick={openCamera}
                className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                📷
                <span>Take Photo</span>
              </button>

              {/* Upload button */}

              <label
                htmlFor="skin-image"
                className="flex items-center justify-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium transition"
              >
                🖼️
                <span>Upload Image</span>
              </label>

            </div>
          )}

          {/* Selected image */}

          {selectedImage && (
            <div>

              <p className="text-sm text-gray-600 mb-4">
                Selected: {selectedImage.name}
              </p>

              {/* Image preview */}

              {imagePreview && (
                <div className="flex justify-center">
                  <img
                    src={imagePreview}
                    alt="Selected skin"
                    className="max-w-sm max-h-72 rounded-xl object-cover border shadow-sm"
                  />
                </div>
              )}

              {/* Image actions */}

              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-5">

                <button
                  type="button"
                  onClick={openCamera}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-medium"
                >
                  📷 Retake Photo
                </button>

                <label
                  htmlFor="skin-image"
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-medium"
                >
                  🖼️ Choose Another
                </label>

                <button
                  type="button"
                  onClick={removeImage}
                  className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2 rounded-lg font-medium"
                >
                  ✕ Remove
                </button>

              </div>

              {/* Analyze button */}

              <button
                onClick={analyzeSkinImage}
                disabled={mlLoading}
                className="mt-5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-7 py-3 rounded-lg font-semibold"
              >
                {mlLoading
                  ? 'Analyzing Image...'
                  : '🤖 Analyze Skin'}
              </button>

            </div>
          )}

          {/* Small instruction */}

          {!selectedImage && (
            <p className="text-xs text-gray-400 mt-5">
              For better results, use a clear, well-lit face/skin image.
            </p>
          )}

        </div>

        {/* Camera error */}

        {cameraError && (
          <p className="text-red-500 text-sm mt-4 text-center">
            {cameraError}
          </p>
        )}

        {/* ML error */}

        {mlError && (
          <p className="text-red-500 text-sm mt-4 text-center">
            {mlError}
          </p>
        )}

        {/* ------------------------------------------------ */}
        {/* ML RESULT */}
        {/* ------------------------------------------------ */}

        {mlResult && (
          <div className="mt-6 border border-gray-200 rounded-xl p-6">

            <h3 className="text-lg font-semibold text-gray-900 mb-5">
              AI Analysis Result
            </h3>

            {/* Prediction + confidence */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">
                  Predicted Severity
                </p>

                <p className="text-2xl font-bold text-primary-600 mt-1">
                  {mlResult.prediction}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">
                  Confidence
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {mlResult.confidence}%
                </p>
              </div>

            </div>

            {/* Probability breakdown */}

            <div className="mt-6">

              <p className="text-sm font-medium text-gray-700 mb-4">
                Class Probabilities
              </p>

              <div className="space-y-4">

                {Object.entries(
                  mlResult.probabilities || {}
                ).map(([className, probability]) => (

                  <div key={className}>

                    <div className="flex justify-between text-sm mb-1">

                      <span className="text-gray-700">
                        {className}
                      </span>

                      <span className="font-medium text-gray-900">
                        {probability}%
                      </span>

                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5">

                      <div
                        className="bg-primary-500 h-2.5 rounded-full"
                        style={{
                          width: `${probability}%`
                        }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>
        )}

      </div>

      {/* ------------------------------------------------ */}
      {/* RULE-BASED SKIN ASSESSMENT */}
      {/* ------------------------------------------------ */}

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">

        <h2 className="text-xl font-semibold text-gray-900">
          Skin Profile Assessment
        </h2>

        <p className="text-sm text-gray-500 mt-1 mb-5">
          Analyze your saved skin profile and identify
          prioritized concerns and risk factors.
        </p>

        <button
          onClick={runAssessment}
          disabled={loading}
          className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md mb-6"
        >
          {loading
            ? 'Analyzing...'
            : 'Run Assessment'}
        </button>

        {error && (
          <p className="text-red-500 text-sm mb-4">
            {error}
          </p>
        )}

        {assessment && (
          <div className="space-y-5">

            {/* Condition score */}

            <div>
              <p className="text-sm text-gray-500">
                Condition Score
              </p>

              <p className="text-3xl font-bold text-primary-600">
                {assessment.condition_score ?? 0}/100
              </p>
            </div>

            {/* Concerns */}

            {assessment.concerns?.length > 0 && (
              <div>

                <p className="text-sm text-gray-500 mb-2">
                  Prioritized Concerns
                </p>

                <div className="space-y-2">

                  {assessment.concerns
                    .sort(
                      (a, b) =>
                        a.priority - b.priority
                    )
                    .map((concern) => (

                      <div
                        key={concern.id}
                        className="flex items-center justify-between border rounded-lg p-3"
                      >

                        <div>
                          <p className="font-medium text-gray-800">
                            {concern.concern_name.replace(
                              /_/g,
                              ' '
                            )}
                          </p>

                          <p className="text-xs text-gray-500">
                            Priority #{concern.priority}
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityClass(
                            concern.severity
                          )}`}
                        >
                          {concern.severity}
                        </span>

                      </div>

                    ))}

                </div>

              </div>
            )}

            {/* Risk factors */}

            {assessment.risk_factors?.length > 0 && (
              <div>

                <p className="text-sm text-gray-500 mb-2">
                  Risk Factors
                </p>

                <div className="space-y-2">

                  {assessment.risk_factors.map((risk) => (

                    <div
                      key={risk.id}
                      className="border rounded-lg p-3"
                    >

                      <div className="flex items-center justify-between">

                        <p className="font-medium text-gray-800">
                          {risk.risk_name}
                        </p>

                        {risk.risk_level && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityClass(
                              risk.risk_level
                            )}`}
                          >
                            {risk.risk_level}
                          </span>
                        )}

                      </div>

                      {risk.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {risk.description}
                        </p>
                      )}

                    </div>

                  ))}

                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* ------------------------------------------------ */}
      {/* CAMERA MODAL */}
      {/* ------------------------------------------------ */}

      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">

            {/* Modal header */}

            <div className="flex items-center justify-between p-4 border-b">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Take Skin Photo
                </h2>

                <p className="text-sm text-gray-500">
                  Position your face clearly inside the camera.
                </p>
              </div>

              <button
                onClick={closeCamera}
                className="text-gray-500 hover:text-gray-900 text-2xl"
              >
                ×
              </button>

            </div>

            {/* Camera */}

            <div className="bg-black p-4">

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />

            </div>

            {/* Camera controls */}

            <div className="flex justify-center gap-4 p-5">

              <button
                onClick={capturePhoto}
                className="bg-primary-500 hover:bg-primary-600 text-white px-7 py-3 rounded-lg font-semibold"
              >
                📸 Capture
              </button>

              <button
                onClick={closeCamera}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-7 py-3 rounded-lg font-medium"
              >
                Cancel
              </button>

            </div>

            {cameraError && (
              <p className="text-red-500 text-sm text-center pb-5 px-4">
                {cameraError}
              </p>
            )}

          </div>

        </div>
      )}

    </div>
  )
}