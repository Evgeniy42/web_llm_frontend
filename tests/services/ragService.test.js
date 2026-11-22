import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ingestDocument } from '../../src/services/ragService'
import { postForm } from '../../src/services/api'

vi.mock('../../src/services/api', () => ({
  postForm: vi.fn(),
}))

describe('ragService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('отправляет файл multipart-формой на /rag/embed', async () => {
    postForm.mockResolvedValue({ success: true, message: 'Готово', doc_id: 'doc' })
    const file = new File(['содержимое'], 'doc.pdf', { type: 'application/pdf' })

    const result = await ingestDocument(file)

    expect(postForm).toHaveBeenCalledTimes(1)
    const [path, formData] = postForm.mock.calls[0]
    expect(path).toBe('/rag/embed')
    expect(formData).toBeInstanceOf(FormData)
    expect(formData.get('file')).toBe(file)
    expect(formData.get('doc_id')).toBeNull()
    expect(result.success).toBe(true)
  })

  it('добавляет doc_id в форму, если он передан', async () => {
    postForm.mockResolvedValue({ success: true, message: 'Готово', doc_id: 'custom-id' })
    const file = new File(['x'], 'doc.txt', { type: 'text/plain' })

    await ingestDocument(file, 'custom-id')

    const [, formData] = postForm.mock.calls[0]
    expect(formData.get('doc_id')).toBe('custom-id')
  })
})
