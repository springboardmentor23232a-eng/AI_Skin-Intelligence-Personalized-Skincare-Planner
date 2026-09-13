import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { AssessmentReport } from '@/components/reports/AssessmentReport';
import { RoutineReport } from '@/components/reports/RoutineReport';
import { ProductReport } from '@/components/reports/ProductReport';
import { ProgressReport } from '@/components/reports/ProgressReport';
import { SkinHealthReport } from '@/components/reports/SkinHealthReport';
import { FileText, ListTodo, ShoppingBag, TrendingUp, HeartPulse, ChevronRight, Loader2, Download, FileSpreadsheet } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const REPORT_TYPES = [
  {
    id: 'assessment',
    title: 'Skin Assessment Report',
    description: 'View your detailed skin analysis results',
    icon: FileText,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
  },
  {
    id: 'routine',
    title: 'Routine Report',
    description: 'Your AM/PM skincare routine breakdown',
    icon: ListTodo,
    color: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/30',
  },
  {
    id: 'products',
    title: 'Product Recommendation Report',
    description: 'Personalized product recommendations',
    icon: ShoppingBag,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'progress',
    title: 'Progress Report',
    description: 'Track your skin progress over time',
    icon: TrendingUp,
    color: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-500/30',
  },
  {
    id: 'skin-health',
    title: 'Skin Health Report',
    description: 'Comprehensive health score and insights',
    icon: HeartPulse,
    color: 'from-rose-500/20 to-pink-500/20',
    borderColor: 'border-rose-500/30',
  },
];

export default function ReportsPage() {
  const { token } = useAuth();
  const [selectedReport, setSelectedReport] = useState('assessment');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const fetchReportData = async (reportType) => {
    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load ${reportType} report`);
      }

      const responseData = await response.json();
      setReportData(responseData?.data ?? responseData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reports/pdf/${selectedReport}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      
      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${selectedReport.replace('-', '_')}_report.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/"/g, '');
        }
      }

      downloadFile(blob, filename);
    } catch (err) {
      alert(`PDF export failed: ${err.message}`);
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reports/excel/${selectedReport}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate Excel');
      }

      const blob = await response.blob();
      
      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${selectedReport.replace('-', '_')}_report.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/"/g, '');
        }
      }

      downloadFile(blob, filename);
    } catch (err) {
      alert(`Excel export failed: ${err.message}`);
    } finally {
      setExportingExcel(false);
    }
  };

  useEffect(() => {
    fetchReportData(selectedReport);
  }, [selectedReport, token]);

  const handleRetry = () => {
    fetchReportData(selectedReport);
  };

  const renderReport = () => {
    if (loading) {
      return (
        <GlassCard className="p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        </GlassCard>
      );
    }

    if (error) {
      return (
        <GlassCard className="p-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <p className="text-sm text-rose-300 mb-3">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-medium hover:bg-rose-500/30"
            >
              Retry
            </button>
          </div>
        </GlassCard>
      );
    }

    const exportProps = {
      onExportPDF: handleExportPDF,
      onExportExcel: handleExportExcel,
      exportingPDF,
      exportingExcel,
    };

    switch (selectedReport) {
      case 'assessment':
        return <AssessmentReport data={reportData} loading={loading} error={error} onRetry={handleRetry} {...exportProps} />;
      case 'routine':
        return <RoutineReport data={reportData} loading={loading} error={error} onRetry={handleRetry} {...exportProps} />;
      case 'products':
        return <ProductReport data={reportData} loading={loading} error={error} onRetry={handleRetry} {...exportProps} />;
      case 'progress':
        return <ProgressReport data={reportData} loading={loading} error={error} onRetry={handleRetry} {...exportProps} />;
      case 'skin-health':
        return <SkinHealthReport data={reportData} loading={loading} error={error} onRetry={handleRetry} {...exportProps} />;
      default:
        return null;
    }
  };

  const selectedReportInfo = REPORT_TYPES.find((r) => r.id === selectedReport);
  const SelectedIcon = selectedReportInfo?.icon || FileText;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reports Hub</h1>
          <p className="text-slate-400">
            View and analyze your skincare journey data
          </p>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {REPORT_TYPES.map((report) => {
            const Icon = report.icon;
            const isSelected = selectedReport === report.id;

            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`relative p-4 rounded-2xl border transition-all duration-200 text-left group ${
                  isSelected
                    ? `bg-gradient-to-br ${report.color} ${report.borderColor} shadow-lg shadow-white/5`
                    : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${
                    isSelected
                      ? 'bg-white/10'
                      : 'bg-slate-800'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isSelected ? 'text-white' : 'text-slate-400'
                    }`} />
                  </div>
                  {isSelected && (
                    <ChevronRight className="w-4 h-4 text-white/60" />
                  )}
                </div>

                <h3 className={`text-sm font-bold mb-1 ${
                  isSelected ? 'text-white' : 'text-slate-300'
                }`}>
                  {report.title}
                </h3>
                <p className={`text-xs ${
                  isSelected ? 'text-white/70' : 'text-slate-500'
                }`}>
                  {report.description}
                </p>

                {/* Selection indicator */}
                {isSelected && (
                  <div className={`absolute inset-0 rounded-2xl border-2 pointer-events-none ${
                    report.borderColor
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Report Display */}
        <GlassCard className="p-6">
          {/* Report Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className={`p-3 rounded-xl ${
              REPORT_TYPES.find(r => r.id === selectedReport)?.color || 'bg-slate-800'
            }`}>
              <SelectedIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{selectedReportInfo?.title}</h2>
              <p className="text-sm text-slate-400">{selectedReportInfo?.description}</p>
            </div>
          </div>

          {/* Report Content */}
          {renderReport()}
        </GlassCard>
      </div>
    </div>
  );
}
