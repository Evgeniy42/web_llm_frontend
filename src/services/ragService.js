import { postForm } from './api'

// Загрузка документа в векторную БД для RAG (POST /rag/embed).
// multipart-форма: поле file — сам файл, doc_id — необязательный идентификатор
// (по умолчанию сервер берёт имя файла без расширения).
// Ответ всегда IngestResponseDTO: { success, message, doc_id, point_id, format } —
// даже при ошибке обработки на сервере success=false, а не HTTP-ошибка.
export async function ingestDocument(file, docId) {
  const formData = new FormData()
  formData.append('file', file)
  if (docId) {
    formData.append('doc_id', docId)
  }
  return postForm('/rag/embed', formData)
}
