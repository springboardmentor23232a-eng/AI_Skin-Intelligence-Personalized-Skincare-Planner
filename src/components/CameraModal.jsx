import React, { useState, useEffect, useRef } from "react";
import { Camera, RefreshCw, Check, X, AlertCircle, Sparkles } from "lucide-react";

const CameraModal = ({ isOpen, onClose, onCapture, title = "Facial Scan & Photo Capture" }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState("user");

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setIsInitializing(true);
    setError(null);

    // Stop any existing stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam access is not supported by your browser or secure context.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera access permission was denied. Please allow camera permissions in your browser settings to click photo.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No camera device was detected on your device.");
      } else {
        setError(err.message || "Failed to initialize camera.");
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (facingMode === "user") {
      // Mirror the image horizontally for selfie view
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
  };

  const handleConfirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "560px",
          backgroundColor: "var(--card-bg, #ffffff)",
          borderRadius: "var(--radius-lg, 16px)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          border: "1px solid var(--border-color, #e2e8f0)",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border-color, #e2e8f0)",
            background: "var(--input-bg, #f8fafc)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={20} style={{ color: "var(--primary, #4f46e5)" }} />
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>{title}</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary, #64748b)"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Camera / Captured Image Container */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "360px",
            backgroundColor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}
        >
          {error ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#ef4444",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.75rem"
              }}
            >
              <AlertCircle size={40} />
              <p style={{ margin: 0, fontSize: "0.95rem" }}>{error}</p>
              <button
                type="button"
                onClick={startCamera}
                className="btn btn-outline"
                style={{ marginTop: "0.5rem" }}
              >
                <RefreshCw size={16} /> Try Again
              </button>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured scan"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: facingMode === "user" ? "scaleX(-1)" : "none"
                }}
              />

              {/* Viewfinder Target Graphic */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "220px",
                  height: "280px",
                  border: "2px dashed rgba(255, 255, 255, 0.7)",
                  borderRadius: "50%",
                  pointerEvents: "none",
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <span
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "0.8rem",
                    background: "rgba(0,0,0,0.5)",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    marginTop: "-180px"
                  }}
                >
                  Position Face Here
                </span>
              </div>

              {/* Facing Mode Switcher */}
              <button
                type="button"
                onClick={toggleFacingMode}
                title="Switch Camera"
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "rgba(15, 23, 42, 0.6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(4px)"
                }}
              >
                <RefreshCw size={18} />
              </button>
            </>
          )}

          {/* Hidden Canvas for rasterizing frames */}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        {/* Actions Footer */}
        <div
          style={{
            padding: "1rem 1.25rem",
            display: "flex",
            gap: "0.75rem",
            justifyContent: "flex-end",
            background: "var(--input-bg, #f8fafc)",
            borderTop: "1px solid var(--border-color, #e2e8f0)"
          }}
        >
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="btn btn-outline"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <RefreshCw size={16} /> Retake
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="btn btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Check size={16} /> Use Photo
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTakeSnapshot}
                disabled={!stream || isInitializing || error}
                className="btn btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  opacity: !stream || error ? 0.6 : 1
                }}
              >
                <Camera size={18} /> Click Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
