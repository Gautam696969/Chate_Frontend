import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, AtSign, Bell, Check, CheckCheck, ChevronDown, LogOut, MoreHorizontal,
  Paperclip, Phone, Plus, Search, Send, Settings, Smile, Sparkles, Video, X,
} from 'lucide-react'
import {
  createConversation, getConversations, getMessages, searchUsers, sendMessage,
} from '../services/authApi'
import { createChatSocket } from '../services/chatSocket'

const avatarColors = ['bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500']

function getId(value) {
  return value?._id || value?.id || value
}

function getAvatarColor(id = '') {
  const hash = String(id).split('').reduce((total, character) => total + character.charCodeAt(0), 0)
  return avatarColors[hash % avatarColors.length]
}

function normalizeUser(user) {
  const id = getId(user)
  const name = user?.name || user?.email || 'Unknown user'
  return { id, name, email: user?.email || '', profileImage: user?.profileImage || null, initials: name.charAt(0).toUpperCase(), color: getAvatarColor(id), online: Boolean(user?.online) }
}

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function normalizeConversation(conversation, currentUserId) {
  const participants = (conversation.participants || []).map(normalizeUser)
  const otherUser = participants.find((participant) => participant.id !== currentUserId) || participants[0] || normalizeUser(null)
  return { id: getId(conversation), user: otherUser, lastMessage: typeof conversation.lastMessage === 'string' ? conversation.lastMessage : 'No messages yet', time: formatTime(conversation.lastMessageAt), unread: 0, messages: [], messagesLoaded: false }
}

function normalizeMessage(message, currentUserId) {
  const senderId = getId(message.sender)
  return { id: getId(message) || `${senderId}-${message.createdAt}`, text: message.text || '', time: formatTime(message.createdAt), sender: senderId === currentUserId ? 'sent' : 'received', read: senderId === currentUserId }
}

function Avatar({ user, size = 'md' }) {
  const sizes = { sm: 'h-10 w-10 text-sm', md: 'h-11 w-11 text-sm' }
  return <div className="relative shrink-0">{user.profileImage ? <img src={user.profileImage} alt="" className={`object-cover ${sizes[size]} rounded-2xl`} /> : <div className={`flex ${sizes[size]} items-center justify-center rounded-2xl ${user.color} font-semibold text-white shadow-sm`}>{user.initials}</div>}{user.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-bg-card bg-emerald-400" />}</div>
}

function Logo() {
  return <div className="flex items-center gap-2.5"><div className="relative flex h-9 w-9 items-center justify-center rounded-[13px] bg-accent shadow-lg shadow-indigo-950/30"><span className="text-lg font-bold text-white">C</span><Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-amber-300 text-amber-300" strokeWidth={2.5} /></div><span className="text-xl font-bold tracking-tight text-text-primary">Chate</span></div>
}

function ProfileMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  return <div className="relative"><button type="button" aria-label="Open profile menu" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-bg-input"><Avatar user={user} size="sm" /><ChevronDown className={`hidden h-4 w-4 text-text-muted transition sm:block ${isOpen ? 'rotate-180' : ''}`} /></button>{isOpen && <div className="absolute right-0 top-14 z-20 w-44 origin-top-right animate-in rounded-xl border border-border-input bg-bg-card p-1.5 shadow-xl"><button type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-input hover:text-text-primary"><AtSign className="h-4 w-4" /> Profile</button><button type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-input hover:text-text-primary"><Settings className="h-4 w-4" /> Settings</button><div className="my-1 border-t border-border-input" /><button type="button" onClick={() => setIsConfirmOpen(true)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"><LogOut className="h-4 w-4" /> Logout</button></div>}{isConfirmOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={() => setIsConfirmOpen(false)}><div className="w-full max-w-sm animate-in rounded-xl border border-border-input bg-bg-card p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><h2 className="text-lg font-semibold text-text-primary">Log out of Chate?</h2><p className="mt-2 text-sm leading-6 text-text-secondary">You will need to sign in again to access your conversations.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setIsConfirmOpen(false)} className="rounded-lg border border-border-input px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-input">Cancel</button><button type="button" onClick={onLogout} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">Log out</button></div></div></div>}</div>
}

function NewChatModal({ token, currentUserId, onClose, onSelect, onError }) {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) return undefined
    let active = true
    const timer = window.setTimeout(async () => {
      setIsLoading(true)
      try {
        const data = await searchUsers(token, query.trim())
        if (active) setUsers((data.users || []).filter((user) => getId(user) !== currentUserId).map(normalizeUser))
      } catch (error) { if (active) onError(error) } finally { if (active) setIsLoading(false) }
    }, 250)
    return () => { active = false; window.clearTimeout(timer) }
  }, [currentUserId, onError, query, token])

  return <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onMouseDown={onClose}><div className="w-full max-w-sm animate-in rounded-2xl border border-border-input bg-bg-card p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-text-primary">New Chat</h2><p className="mt-1 text-sm text-text-muted">Search registered users</p></div><button type="button" onClick={onClose} aria-label="Close new chat" className="rounded-lg p-2 text-text-muted hover:bg-bg-input hover:text-text-primary"><X className="h-5 w-5" /></button></div><div className="relative mb-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search user..." className="w-full rounded-xl border border-border-input bg-bg-input py-2.5 pl-9 pr-3 text-sm text-text-primary outline-none focus:border-accent" /></div><div className="space-y-1">{isLoading && <p className="py-5 text-center text-sm text-text-muted">Searching...</p>}{!isLoading && query.trim() && users.map((user) => <button key={user.id} type="button" onClick={() => onSelect(user)} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-bg-input"><Avatar user={user} size="sm" /><div><p className="text-sm font-medium text-text-primary">{user.name}</p><p className="text-xs text-text-muted">{user.email}</p></div></button>)}{!isLoading && query.trim() && !users.length && <p className="py-5 text-center text-sm text-text-muted">No users found.</p>}{!query.trim() && <p className="py-5 text-center text-sm text-text-muted">Type a name or email to search.</p>}</div></div></div>
}

function ChatSidebar({ currentUser, conversations, selectedId, search, onSearch, onSelect, onNewChat, onLogout, isLoading }) {
  const filtered = conversations.filter((conversation) => conversation.user.name.toLowerCase().includes(search.toLowerCase()))
  return <aside className="flex h-full w-full flex-col border-r border-border-input bg-bg-card md:w-[340px] md:shrink-0"><div className="border-b border-border-input p-5 pb-4"><div className="mb-6 flex items-center justify-between"><Logo /><ProfileMenu user={currentUser} onLogout={onLogout} /></div><div className="mb-1 flex items-center justify-between"><div><p className="text-sm font-semibold text-text-primary">Messages</p><p className="mt-0.5 text-xs text-text-muted">Stay connected, stay close</p></div><button type="button" onClick={onNewChat} className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-950/20 transition hover:bg-accent-hover" title="Start a new chat"><Plus className="h-4 w-4" /> New chat</button></div></div><div className="px-5 py-4"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search chats" className="w-full rounded-xl border border-border-input bg-bg-input py-2.5 pl-9 pr-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent" /></div></div><div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">{isLoading && <p className="px-3 py-8 text-center text-sm text-text-muted">Loading conversations...</p>}{!isLoading && filtered.map((conversation) => <button key={conversation.id} type="button" onClick={() => onSelect(conversation.id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-bg-input ${selectedId === conversation.id ? 'bg-accent/15 ring-1 ring-accent/30' : ''}`}><Avatar user={conversation.user} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-text-primary">{conversation.user.name}</span><span className="shrink-0 text-[11px] text-text-muted">{conversation.time}</span></span><span className="mt-1 flex items-center justify-between gap-2"><span className="truncate text-xs text-text-muted">{conversation.lastMessage}</span>{conversation.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">{conversation.unread}</span>}</span></span></button>)}{!isLoading && !filtered.length && <p className="px-3 py-8 text-center text-sm text-text-muted">No chats found.</p>}</div><div className="flex items-center gap-3 border-t border-border-input p-4"><Avatar user={currentUser} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-text-primary">{currentUser.name}</p><p className="flex items-center gap-1 text-xs text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online</p></div><Bell className="h-4 w-4 text-text-muted" /></div></aside>
}

function EmptyChat() { return <div className="flex h-full flex-col items-center justify-center px-6 text-center"><div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/15 text-accent shadow-lg shadow-indigo-950/10"><span className="text-4xl">💬</span></div><h1 className="text-2xl font-bold text-text-primary">Welcome to Chate</h1><p className="mt-2 max-w-xs text-sm leading-6 text-text-secondary">Select a conversation to start messaging.</p><div className="mt-7 flex items-center gap-2 rounded-full border border-border-input bg-bg-card px-4 py-2 text-xs text-text-muted"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Your conversations are waiting</div></div> }
function ChatHeader({ conversation, onBack }) { return <header className="flex items-center gap-3 border-b border-border-input bg-bg-card px-4 py-3 sm:px-6"><button type="button" onClick={onBack} aria-label="Back to conversations" className="rounded-lg p-2 text-text-muted hover:bg-bg-input hover:text-text-primary md:hidden"><ArrowLeft className="h-5 w-5" /></button><Avatar user={conversation.user} size="sm" /><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold text-text-primary sm:text-base">{conversation.user.name}</h2><p className={`text-xs ${conversation.user.online ? 'text-emerald-400' : 'text-text-muted'}`}>{conversation.user.online ? 'Online' : 'Offline'}</p></div><div className="flex items-center gap-0.5 text-text-muted sm:gap-1"><button type="button" aria-label="Search messages" className="rounded-lg p-2 hover:bg-bg-input hover:text-text-primary"><Search className="h-4 w-4 sm:h-5 sm:w-5" /></button><button type="button" aria-label="Voice call" className="hidden rounded-lg p-2 hover:bg-bg-input hover:text-text-primary sm:block"><Phone className="h-4 w-4 sm:h-5 sm:w-5" /></button><button type="button" aria-label="Video call" className="rounded-lg p-2 hover:bg-bg-input hover:text-text-primary"><Video className="h-4 w-4 sm:h-5 sm:w-5" /></button><button type="button" aria-label="More options" className="rounded-lg p-2 hover:bg-bg-input hover:text-text-primary"><MoreHorizontal className="h-5 w-5" /></button></div></header> }

function MessageList({ conversation }) { const endRef = useRef(null); useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [conversation.messages.length, conversation.id]); return <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8"><div className="mx-auto flex max-w-3xl flex-col gap-4"><div className="flex items-center gap-3 py-2"><div className="h-px flex-1 bg-border-input" /><span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Today</span><div className="h-px flex-1 bg-border-input" /></div>{conversation.messages.map((message) => <div key={message.id} className={`flex animate-in ${message.sender === 'sent' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-[65%] ${message.sender === 'sent' ? 'rounded-br-md bg-accent text-white' : 'rounded-bl-md border border-border-input bg-bg-card text-text-primary'}`}><p className="whitespace-pre-wrap leading-6">{message.text}</p><div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${message.sender === 'sent' ? 'text-indigo-100' : 'text-text-muted'}`}>{message.time}{message.sender === 'sent' && (message.read ? <CheckCheck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />)}</div></div></div>)}<div ref={endRef} /></div></div> }

function MessageInput({ onSend, isSending }) { const [value, setValue] = useState(''); const submit = () => { if (!value.trim() || isSending) return; onSend(value.trim()); setValue('') }; const handleKeyDown = (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }; return <div className="border-t border-border-input bg-bg-card p-3 sm:p-4"><div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border-input bg-bg-input p-2 shadow-inner"><button type="button" aria-label="Add emoji" className="rounded-xl p-2 text-text-muted hover:bg-bg-card hover:text-text-primary"><Smile className="h-5 w-5" /></button><button type="button" aria-label="Attach file" className="hidden rounded-xl p-2 text-text-muted hover:bg-bg-card hover:text-text-primary sm:block"><Paperclip className="h-5 w-5" /></button><textarea value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={handleKeyDown} rows={1} placeholder="Type a message..." disabled={isSending} className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-text-primary outline-none placeholder:text-text-muted" /><button type="button" onClick={submit} aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50" disabled={!value.trim() || isSending}><Send className="h-4 w-4" /></button></div><p className="mx-auto mt-2 hidden max-w-3xl text-[10px] text-text-muted sm:block">Press Enter to send · Shift + Enter for a new line</p></div> }

function ChatWindow({ conversation, onBack, onSend, isLoading, isSending }) { return <section className="flex min-h-0 flex-1 flex-col bg-bg-primary"><ChatHeader conversation={conversation} onBack={onBack} />{isLoading ? <div className="flex flex-1 items-center justify-center text-sm text-text-muted">Loading messages...</div> : <MessageList conversation={conversation} />}<MessageInput onSend={onSend} isSending={isSending} /></section> }

function ChatDashboard({ user, token, onLogout }) {
  const currentUser = normalizeUser({ ...user, online: true })
  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const socketRef = useRef(null)
  const selectedConversation = useMemo(() => conversations.find(({ id }) => id === selectedId), [conversations, selectedId])

  useEffect(() => {
    const socket = createChatSocket(token)
    socketRef.current = socket

    const handleIncomingMessage = (payload) => {
      const incomingMessage = payload.message || payload
      const conversationId = payload.conversationId || incomingMessage.conversation
      if (!conversationId || !incomingMessage?.id) return

      setConversations((items) => items.map((item) => {
        if (item.id !== conversationId || item.messages.some((message) => message.id === incomingMessage.id)) return item
        const message = normalizeMessage(incomingMessage, currentUser.id)
        return { ...item, lastMessage: message.text, time: message.time, messages: [...item.messages, message], messagesLoaded: true }
      }))
    }

    socket.on('receive_message', handleIncomingMessage)
    socket.on('connect_error', () => setError('Live messaging is unavailable. REST messaging is still available.'))

    return () => {
      socket.off('receive_message', handleIncomingMessage)
      socket.disconnect()
      socketRef.current = null
    }
  }, [currentUser.id, token])

  useEffect(() => {
    if (selectedId && socketRef.current) socketRef.current.emit('join_room', selectedId)
  }, [selectedId])

  const loadConversations = useCallback(async () => { setIsLoading(true); try { const data = await getConversations(token); setConversations((data.conversations || []).map((conversation) => normalizeConversation(conversation, currentUser.id))); setError('') } catch (loadError) { setError(loadError.message) } finally { setIsLoading(false) } }, [currentUser.id, token])
  useEffect(() => { loadConversations() }, [loadConversations])

  const selectConversation = async (id) => { setSelectedId(id); const conversation = conversations.find((item) => item.id === id); if (!conversation || conversation.messagesLoaded) return; setIsMessagesLoading(true); try { const data = await getMessages(token, id); setConversations((items) => items.map((item) => item.id === id ? { ...item, messages: (data.messages || []).map((message) => normalizeMessage(message, currentUser.id)), messagesLoaded: true } : item)); setError('') } catch (loadError) { setError(loadError.message) } finally { setIsMessagesLoading(false) } }
  const startConversation = async (selectedUser) => { setIsNewChatOpen(false); try { const data = await createConversation(token, selectedUser.id); const conversation = normalizeConversation(data.conversation, currentUser.id); setConversations((items) => items.some((item) => item.id === conversation.id) ? items : [conversation, ...items]); setSelectedId(conversation.id); setIsMessagesLoading(true); const messagesData = await getMessages(token, conversation.id); setConversations((items) => items.map((item) => item.id === conversation.id ? { ...item, messages: (messagesData.messages || []).map((message) => normalizeMessage(message, currentUser.id)), messagesLoaded: true } : item)); setError('') } catch (conversationError) { setError(conversationError.message) } finally { setIsMessagesLoading(false) } }
  const handleSend = async (text) => { if (!selectedId || isSending) return; setIsSending(true); try { const data = await sendMessage(token, selectedId, text); const message = normalizeMessage(data.message, currentUser.id); setConversations((items) => items.map((item) => item.id === selectedId ? { ...item, lastMessage: message.text, time: message.time, messages: [...item.messages, message], messagesLoaded: true } : item)); socketRef.current?.emit('send_message', { conversationId: selectedId, message: data.message }); setError('') } catch (sendError) { setError(sendError.message) } finally { setIsSending(false) } }
  const handleModalError = useCallback((modalError) => setError(modalError.message), [])

  return <main className="chat-dashboard h-screen overflow-hidden bg-bg-primary text-text-primary"><div className="flex h-full w-full"><div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} h-full w-full md:w-auto`}><ChatSidebar currentUser={currentUser} conversations={conversations} selectedId={selectedId} search={search} onSearch={setSearch} onSelect={selectConversation} onNewChat={() => setIsNewChatOpen(true)} onLogout={onLogout} isLoading={isLoading} /></div><div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} min-w-0 flex-1`}>{selectedConversation ? <ChatWindow conversation={selectedConversation} onBack={() => setSelectedId(null)} onSend={handleSend} isLoading={isMessagesLoading} isSending={isSending} /> : <EmptyChat />}</div></div>{error && <div role="alert" className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-red-400/30 bg-bg-card px-4 py-3 text-sm text-red-300 shadow-xl"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error"><X className="h-4 w-4" /></button></div>}{isNewChatOpen && <NewChatModal token={token} currentUserId={currentUser.id} onClose={() => setIsNewChatOpen(false)} onSelect={startConversation} onError={handleModalError} />}</main>
}

export default ChatDashboard
