import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RagUploadPage from '../../src/pages/RagUploadPage'
import { saveSession, clearSession } from '../../src/services/session'
import { ingestDocument } from '../../src/services/ragService'

vi.mock('../../src/services/ragService', () => ({
  ingestDocument: vi.fn(),
}))

function saveAuthSession(roles = []) {
  saveSession({
    id: 1,
    username: 'Ivan',
    email: 'ivan@mail.ru',
    roles,
  })
}

function renderPage() {
  return render(
    <MemoryRouter>
      <RagUploadPage />
    </MemoryRouter>,
  )
}

function pickFile(name = 'doc.pdf') {
  const input = screen.getByLabelText(/Выберите файл|doc/i, { selector: 'input' })
  const file = new File(['содержимое'], name, { type: 'application/pdf' })
  return userEvent.upload(input, file)
}

describe('RagUploadPage', () => {
  afterEach(() => {
    clearSession()
    vi.clearAllMocks()
  })

  it('без авторизации просит войти', () => {
    renderPage()

    expect(screen.getByText(/нужно войти или зарегистрироваться/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Загрузить в базу данных' })).not.toBeInTheDocument()
  })

  it('обычному пользователю показывает отказ в доступе', () => {
    saveAuthSession(['user', 'vip_user'])
    renderPage()

    expect(screen.getByText(/только у администратора/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Загрузить в базу данных' })).not.toBeInTheDocument()
  })

  it('админу показывает форму с неактивной кнопкой, пока файл не выбран', () => {
    saveAuthSession(['user', 'admin'])
    renderPage()

    expect(screen.getByText('Загрузка данных в базу')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Загрузить в базу данных' })).toBeDisabled()
  })

  it('после выбора файла отправляет его и показывает результат', async () => {
    saveAuthSession(['user', 'admin'])
    ingestDocument.mockResolvedValue({
      success: true,
      message: 'Документ загружен в базу',
      doc_id: 'doc',
      point_id: 'point-1',
      format: 'pdf',
    })
    renderPage()

    await pickFile()

    const button = screen.getByRole('button', { name: 'Загрузить в базу данных' })
    expect(button).toBeEnabled()
    await userEvent.click(button)

    expect(ingestDocument).toHaveBeenCalledTimes(1)
    expect(ingestDocument.mock.calls[0][0].name).toBe('doc.pdf')
    expect(await screen.findByText('Документ загружен в базу')).toBeInTheDocument()
    expect(screen.getByText('point-1')).toBeInTheDocument()
    expect(screen.getByText('pdf')).toBeInTheDocument()
  })

  it('показывает сообщение сервера при success=false', async () => {
    saveAuthSession(['user', 'admin'])
    ingestDocument.mockResolvedValue({
      success: false,
      message: 'Не удалось обработать документ',
      doc_id: null,
      point_id: null,
      format: null,
    })
    renderPage()

    await pickFile()
    await userEvent.click(screen.getByRole('button', { name: 'Загрузить в базу данных' }))

    expect(await screen.findByText('Не удалось обработать документ')).toBeInTheDocument()
  })

  it('показывает ошибку при сбое сети', async () => {
    saveAuthSession(['user', 'admin'])
    ingestDocument.mockRejectedValue(new Error('HTTP 500'))
    renderPage()

    await pickFile()
    await userEvent.click(screen.getByRole('button', { name: 'Загрузить в базу данных' }))

    expect(await screen.findByText('HTTP 500')).toBeInTheDocument()
  })
})
