import { useState, useEffect, useRef } from 'react'
import { Command } from 'cmdk'
import { useSupabase } from './SupabaseProvider'

interface User {
  id: string
  name: string
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  onMention?: (userId: string) => void
  placeholder?: string
  className?: string
}

interface MentionedUser {
  name: string;
  position: number;
}

export function MentionInput({
  value,
  onChange,
  onMention,
  placeholder,
  className
}: MentionInputProps) {
  const [users, setUsers] = useState<User[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [mentionedUsers, setMentionedUsers] = useState<MentionedUser[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { supabase } = useSupabase()

  // 사용자 목록 가져오기
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name')
      .ilike('name', `%${searchTerm}%`)
      .limit(5)

    if (error) {
      console.error('Error fetching users:', error)
      return
    }

    setUsers(data || [])
  }

  // @ 입력 감지 및 사용자 검색
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart || 0
    setCursorPosition(cursorPos)

    // 현재 커서 위치 이전의 텍스트에서 마지막 @ 위치 찾기
    const textBeforeCursor = newValue.slice(0, cursorPos)
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@')

    if (lastAtSymbol !== -1 && cursorPos - lastAtSymbol <= 20) {
      // @ 다음의 검색어 추출
      const searchText = textBeforeCursor.slice(lastAtSymbol + 1)
      
      // 띄어쓰기가 있으면 멘션 검색 중단
      if (searchText.includes(' ')) {
        setShowSuggestions(false)
      } else {
        setSearchTerm(searchText)
        setShowSuggestions(true)
      }
    } else {
      setShowSuggestions(false)
    }

    onChange(newValue)
  }

  // 멘션 선택 처리
  const handleSelectMention = (user: User) => {
    if (!inputRef.current) return

    const textBeforeCursor = value.slice(0, cursorPosition)
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@')
    const textAfterCursor = value.slice(cursorPosition)

    // @검색어를 @사용자이름으로 교체
    const newValue = textBeforeCursor.slice(0, lastAtSymbol) +
      `@${user.name} ` +
      textAfterCursor

    // 새로운 멘션 추가
    setMentionedUsers(prev => [
      ...prev,
      { name: user.name, position: lastAtSymbol }
    ])

    onChange(newValue)
    setShowSuggestions(false)
    onMention?.(user.id)
  }

  // 검색어가 변경될 때마다 사용자 목록 업데이트
  useEffect(() => {
    if (showSuggestions) {
      fetchUsers()
    }
  }, [searchTerm, showSuggestions])

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          ref={inputRef}
          value={value}
          onChange={handleInput}
          placeholder={placeholder}
          className={className}
        />
        <div 
          className={`${className} absolute top-0 left-0 pointer-events-none whitespace-pre-wrap break-words`}
          style={{
            padding: '0.5rem 0.75rem', // py-2 px-3 in pixels
            color: 'transparent',
            backgroundColor: 'transparent',
            border: '1px solid transparent'
          }}
        >
          {value.split(/(@\S+)/).map((part, index) => {
            // 멘션된 사용자 찾기
            const isMentioned = part.startsWith('@') && 
              mentionedUsers.some(user => `@${user.name}` === part.trim());

            if (isMentioned) {
              return <span key={index} className="text-blue-500 bg-white hover:underline">{part}</span>;
            }
            return <span key={index}>{part}</span>;
          })}
        </div>
      </div>
      {showSuggestions && (
        <div className="absolute bottom-full left-0 w-full bg-white border rounded-lg shadow-lg mb-1 max-h-48 overflow-y-auto">
          <Command>
            <Command.List>
              {users.map(user => (
                <Command.Item
                  key={user.id}
                  onSelect={() => handleSelectMention(user)}
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                >
                  {user.name}
                </Command.Item>
              ))}
              {users.length === 0 && (
                <div className="px-2 py-1 text-gray-500">
                  검색 결과가 없습니다
                </div>
              )}
            </Command.List>
          </Command>
        </div>
      )}
    </div>
  )
}
