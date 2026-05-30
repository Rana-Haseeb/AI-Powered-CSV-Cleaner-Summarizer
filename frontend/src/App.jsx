import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import axios from 'axios'
import {
  UploadCloud,
  FileSpreadsheet,
  Loader2,
  Sparkles,
  RotateCcw,
  AlertCircle,
} from 'lucide-react'

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analyze`

function App() {
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    multiple: false,
  })

  const handleAnalyze = async () => {
    if (!file) return

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setReport(data.report)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Something went wrong while analyzing your dataset.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setReport(null)
    setError(null)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-16">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300">
            <Sparkles className="h-4 w-4" />
            Powered by Gemini
          </div>
          <h1 className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            AI Data Dashboard
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
            Upload your CSV dataset and get an instant, intelligent breakdown of
            trends, anomalies, and actionable insights.
          </p>
        </header>

        {/* States: Loading > Report > Upload */}
        {isLoading ? (
          <LoadingState />
        ) : report ? (
          <ReportView report={report} onReset={handleReset} />
        ) : (
          <UploadView
            file={file}
            error={error}
            isDragActive={isDragActive}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            onAnalyze={handleAnalyze}
            onClear={() => setFile(null)}
          />
        )}
      </div>
    </div>
  )
}

function UploadView({
  file,
  error,
  isDragActive,
  getRootProps,
  getInputProps,
  onAnalyze,
  onClear,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur sm:p-8">
      <div
        {...getRootProps()}
        className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors duration-200 ${
          isDragActive
            ? 'border-violet-400 bg-violet-500/10'
            : 'border-slate-700 hover:border-violet-500/60 hover:bg-slate-800/40'
        }`}
      >
        <input {...getInputProps()} />
        <div className="mb-4 rounded-full bg-slate-800 p-4 transition-transform duration-200 group-hover:scale-110">
          <UploadCloud className="h-9 w-9 text-violet-400" />
        </div>
        {isDragActive ? (
          <p className="text-lg font-medium text-violet-300">
            Drop your dataset here…
          </p>
        ) : (
          <>
            <p className="text-lg font-medium text-slate-200">
              Drag &amp; drop your CSV dataset here
            </p>
            <p className="mt-1 text-sm text-slate-500">
              or <span className="text-violet-400">browse</span> to choose a file
              · .csv only
            </p>
          </>
        )}
      </div>

      {/* Selected file chip */}
      {file && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 px-4 py-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <FileSpreadsheet className="h-6 w-6 shrink-0 text-emerald-400" />
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium text-slate-200">
                {file.name}
              </p>
              <p className="text-xs text-slate-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="ml-3 shrink-0 text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            Remove
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action */}
      <button
        onClick={onAnalyze}
        disabled={!file}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
      >
        <Sparkles className="h-5 w-5" />
        Analyze Dataset
      </button>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-20 text-center shadow-2xl backdrop-blur">
      <div className="relative mb-6">
        <Loader2 className="h-14 w-14 animate-spin text-violet-400" />
        <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-violet-300" />
      </div>
      <h2 className="text-xl font-semibold text-slate-100">
        Analyzing dataset with Gemini…
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Crunching your data for trends, anomalies, and insights. This usually
        takes a few seconds.
      </p>
    </div>
  )
}

function ReportView({ report, onReset }) {
  return (
    <div className="space-y-6">
      {/* Meta bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2.5">
            <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">
              {report.filename}
            </p>
            <p className="text-xs text-slate-500">
              Analysis complete · {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-violet-500/60 hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4" />
          Analyze a new file
        </button>
      </div>

      {/* AI summary card */}
      <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="mb-6 flex items-center gap-2 text-violet-300">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-lg font-semibold">AI Analysis</h2>
        </div>
        <div className="prose prose-invert max-w-none prose-headings:text-slate-100 prose-a:text-violet-400 prose-strong:text-white prose-table:text-sm prose-th:bg-slate-800 prose-td:border-slate-700 prose-th:border-slate-700">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {report.aiSummary}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  )
}

export default App
