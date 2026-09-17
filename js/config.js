/**
 * Central Environment Configuration for AI Skin Care Platform
 * Dynamically resolves API endpoints for Local Development and Production deployments.
 */
(function () {
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "";

    window.APP_CONFIG = {
        // Python FastAPI Assessment Engine URL
        API_BASE_URL: window.ENV_API_BASE_URL || (isLocal ? "http://127.0.0.1:8000" : window.location.origin),
        
        // Node.js Express Auth & User Backend URL
        NODE_API_URL: window.ENV_NODE_API_URL || (isLocal ? "http://127.0.0.1:5000" : window.location.origin + "/api")
    };
    
    // Legacy support for scripts expecting global API_BASE_URL
    if (typeof window.API_BASE_URL === "undefined") {
        window.API_BASE_URL = window.APP_CONFIG.API_BASE_URL;
    }
})();
