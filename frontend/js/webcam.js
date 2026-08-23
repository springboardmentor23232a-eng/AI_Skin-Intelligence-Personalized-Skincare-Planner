/* =========================================================================
   webcam.js — reusable webcam capture helper.
   Exposes window.WebcamCapture with start/capture/stop/getBlob.
   ========================================================================= */

const WebcamCapture = (function () {
  let stream = null;
  let videoEl = null;
  let canvasEl = null;
  let capturedBlob = null;

  async function start(containerEl) {
    containerEl.innerHTML = "";
    videoEl = document.createElement("video");
    videoEl.autoplay = true;
    videoEl.playsInline = true;
    containerEl.appendChild(videoEl);

    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    videoEl.srcObject = stream;
    capturedBlob = null;
    return stream;
  }

  function capture(containerEl) {
    if (!videoEl) return null;
    canvasEl = document.createElement("canvas");
    canvasEl.width = videoEl.videoWidth || 480;
    canvasEl.height = videoEl.videoHeight || 360;
    const ctx = canvasEl.getContext("2d");
    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

    return new Promise((resolve) => {
      canvasEl.toBlob((blob) => {
        capturedBlob = blob;
        const img = document.createElement("img");
        img.src = URL.createObjectURL(blob);
        containerEl.innerHTML = "";
        containerEl.appendChild(img);
        resolve(blob);
      }, "image/jpeg", 0.92);
    });
  }

  function stop() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
  }

  function getBlob() {
    return capturedBlob;
  }

  return { start, capture, stop, getBlob };
})();
