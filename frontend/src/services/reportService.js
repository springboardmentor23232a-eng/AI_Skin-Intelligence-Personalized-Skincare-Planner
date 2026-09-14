import api from './api';

/**
 * Trigger browser file download from Blob object.
 */
const downloadBlob = (blobData, filename) => {
  const blob = new Blob([blobData]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Fetch report preview data (JSON)
 */
export const getReportPreview = async (reportKey, userId = null) => {
  const url = `/api/reports/${reportKey}${userId ? `?user_id=${userId}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Export report as professional PDF
 */
export const exportReportPdf = async (reportKey, userId = null, defaultName = null) => {
  const url = `/api/reports/${reportKey}/export/pdf${userId ? `?user_id=${userId}` : ''}`;
  const response = await api.get(url, { responseType: 'blob' });
  
  // Extract filename from header if present
  let filename = defaultName || `${reportKey}_report_${new Date().toISOString().split('T')[0]}.pdf`;
  const disposition = response.headers['content-disposition'];
  if (disposition && disposition.indexOf('filename=') !== -1) {
    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }
  
  downloadBlob(response.data, filename);
  return true;
};

/**
 * Export report as structured Excel workbook
 */
export const exportReportExcel = async (reportKey, userId = null, defaultName = null) => {
  const url = `/api/reports/${reportKey}/export/excel${userId ? `?user_id=${userId}` : ''}`;
  const response = await api.get(url, { responseType: 'blob' });
  
  // Extract filename from header if present
  let filename = defaultName || `${reportKey}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
  const disposition = response.headers['content-disposition'];
  if (disposition && disposition.indexOf('filename=') !== -1) {
    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }
  
  downloadBlob(response.data, filename);
  return true;
};
