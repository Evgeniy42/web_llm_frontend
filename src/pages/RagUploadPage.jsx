import { useRef, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../hooks/useAuth'
import { ingestDocument } from '../services/ragService'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

export default function RagUploadPage() {
  const { isAuthenticated, isAdmin } = useAuth()
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] ?? null)
    setResult(null)
  }

  const handleUpload = async () => {
    if (!file || isUploading) return
    setIsUploading(true)
    setResult(null)
    try {
      const response = await ingestDocument(file)
      setResult({ ok: response.success, response })
    } catch (error) {
      setResult({
        ok: false,
        response: { message: error.message || 'Не удалось загрузить документ. Попробуйте позже.' },
      })
    } finally {
      setIsUploading(false)
    }
  }

  const renderBody = () => {
    if (!isAuthenticated) {
      return (
        <main className="auth-required">
          <p className="auth-required__text">
            Чтобы продолжить, нужно войти или зарегистрироваться
          </p>
        </main>
      )
    }

    if (!isAdmin) {
      return (
        <main className="auth-required">
          <p className="auth-required__text">
            Доступ к загрузке данных в базу есть только у администратора
          </p>
        </main>
      )
    }

    return (
      <main className="rag-upload">
        <div className="rag-upload__card">
          <h1 className="rag-upload__title">Загрузка данных в базу</h1>
          <p className="rag-upload__subtitle">
            Файл будет обработан и сохранён в векторную базу данных для RAG
          </p>

          <div className="rag-upload__field">
            <input
              ref={fileInputRef}
              id="rag-file-input"
              type="file"
              className="rag-upload__input"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <label htmlFor="rag-file-input" className="rag-upload__dropzone">
              <svg
                className="rag-upload__dropzone-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {file ? (
                <span className="rag-upload__file-name">
                  {file.name} ({formatSize(file.size)})
                </span>
              ) : (
                <span className="rag-upload__dropzone-text">Выберите файл</span>
              )}
            </label>
          </div>

          <button
            type="button"
            className="btn btn--primary rag-upload__submit"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? 'Загружаем…' : 'Загрузить в базу данных'}
          </button>

          {result && (
            <div
              className={`rag-upload__result ${result.ok ? 'rag-upload__result--success' : 'rag-upload__result--error'}`}
              role="status"
            >
              <p className="rag-upload__result-message">{result.response.message}</p>
              {result.ok && (
                <dl className="rag-upload__result-meta">
                  {result.response.doc_id && (
                    <>
                      <dt>Документ</dt>
                      <dd>{result.response.doc_id}</dd>
                    </>
                  )}
                  {result.response.point_id && (
                    <>
                      <dt>Точка в Qdrant</dt>
                      <dd>{result.response.point_id}</dd>
                    </>
                  )}
                  {result.response.format && (
                    <>
                      <dt>Формат</dt>
                      <dd>{result.response.format}</dd>
                    </>
                  )}
                </dl>
              )}
            </div>
          )}
        </div>
      </main>
    )
  }

  return (
    <div className="app">
      <Header />
      <div className="app__body">{renderBody()}</div>
      <Footer />
    </div>
  )
}
