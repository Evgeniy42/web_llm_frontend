import { useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'
import MessageNavigator from '../components/MessageNavigator'
import Footer from '../components/Footer'
import { useAuth } from '../hooks/useAuth'
import { useChat } from '../hooks/useChat'

export default function ChatPage() {
  const { isAuthenticated } = useAuth()
  const { chats, activeChat, activeChatId, isLoading, sendMessage, createNewChat, selectChat } = useChat()
  const [scrollToMessageId, setScrollToMessageId] = useState(null)

  const handleNavigate = (messageId) => {
    setScrollToMessageId(null)
    requestAnimationFrame(() => setScrollToMessageId(messageId))
  }

  if (!isAuthenticated) {
    return (
      <div className="app">
        <Header />
        <div className="app__body">
          <main className="auth-required">
            <p className="auth-required__text">
              Чтобы продолжить, нужно войти или зарегистрироваться
            </p>
          </main>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="app">
      <Header />
      <div className="app__body">
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={selectChat}
          onCreateChat={createNewChat}
        />
        <Chat chat={activeChat} onSendMessage={sendMessage} scrollToMessageId={scrollToMessageId} isLoading={isLoading} />
        <MessageNavigator messages={activeChat.messages} onNavigate={handleNavigate} />
      </div>
      <Footer />
    </div>
  )
}
