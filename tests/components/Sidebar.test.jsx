import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from '../../src/components/Sidebar'

const chats = [
  { id: 1, title: 'Первый чат', messages: [], createdAt: '' },
  { id: 2, title: 'Второй чат', messages: [], createdAt: '' },
]

describe('Sidebar', () => {
  it('показывает заглушку при пустом списке чатов', () => {
    render(<Sidebar chats={[]} activeChatId={null} onSelectChat={() => {}} onCreateChat={() => {}} />)

    expect(screen.getByText('Нет созданных чатов')).toBeInTheDocument()
  })

  it('рендерит список чатов и подсвечивает активный', () => {
    render(<Sidebar chats={chats} activeChatId={2} onSelectChat={() => {}} onCreateChat={() => {}} />)

    expect(screen.getByText('Первый чат')).toBeInTheDocument()
    const activeItem = screen.getByText('Второй чат').closest('button')
    expect(activeItem).toHaveClass('sidebar__chat-item--active')
  })

  it('вызывает onCreateChat по кнопке «Новый чат»', async () => {
    const onCreateChat = vi.fn()
    render(<Sidebar chats={chats} activeChatId={1} onSelectChat={() => {}} onCreateChat={onCreateChat} />)

    await userEvent.click(screen.getByText('Новый чат'))

    expect(onCreateChat).toHaveBeenCalledTimes(1)
  })

  it('вызывает onSelectChat с id чата при клике', async () => {
    const onSelectChat = vi.fn()
    render(<Sidebar chats={chats} activeChatId={1} onSelectChat={onSelectChat} onCreateChat={() => {}} />)

    await userEvent.click(screen.getByText('Второй чат'))

    expect(onSelectChat).toHaveBeenCalledWith(2)
  })
})
