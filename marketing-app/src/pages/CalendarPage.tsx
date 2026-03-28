import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  NavBar,
  Tag,
  Card,
  Button,
  Badge,
  Popup,
  Form,
  Input,
  TextArea,
  Picker,
  DatePicker,
  Toast,
  Empty,
  SwipeAction,
  Dialog,
} from 'antd-mobile'
import {
  AddOutline,
  AppOutline,
  CloseCircleOutline,
} from 'antd-mobile-icons'
import dayjs from 'dayjs'
import { useStore } from '../store/useStore'
import type { Platform, PostStatus, ScheduledPost } from '../types'
import './CalendarPage.css'

const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: '#e1306c',
  facebook: '#1877f2',
  twitter: '#1da1f2',
  linkedin: '#0a66c2',
  tiktok: '#010101',
}

const STATUS_COLORS: Record<PostStatus, 'default' | 'primary' | 'success' | 'danger' | 'warning'> = {
  draft: 'default',
  scheduled: 'primary',
  published: 'success',
  failed: 'danger',
}

const PLATFORM_OPTIONS = [
  ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'].map((p) => ({
    label: p.charAt(0).toUpperCase() + p.slice(1),
    value: p,
  })),
]

function MiniCalendar({
  year,
  month,
  posts,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: {
  year: number
  month: number
  posts: ScheduledPost[]
  selectedDate: string
  onSelectDate: (date: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}) {
  const firstDay = dayjs(new Date(year, month, 1))
  const daysInMonth = firstDay.daysInMonth()
  const startWeekday = firstDay.day() // 0 = Sunday

  const postDates = useMemo(() => {
    const map: Record<string, Platform[]> = {}
    posts.forEach((p) => {
      const d = dayjs(p.scheduledAt).format('YYYY-MM-DD')
      if (!map[d]) map[d] = []
      p.platforms.forEach((pl) => {
        if (!map[d].includes(pl)) map[d].push(pl)
      })
    })
    return map
  }, [posts])

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="mini-calendar">
      <div className="cal-header">
        <button className="cal-nav" onClick={onPrevMonth}>‹</button>
        <span className="cal-month-label">
          {dayjs(new Date(year, month)).format('MMMM YYYY')}
        </span>
        <button className="cal-nav" onClick={onNextMonth}>›</button>
      </div>
      <div className="cal-weekdays">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="cal-weekday">{d}</span>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="cal-cell empty" />
          const dateStr = dayjs(new Date(year, month, day)).format('YYYY-MM-DD')
          const platforms = postDates[dateStr] ?? []
          const isToday = dateStr === dayjs().format('YYYY-MM-DD')
          const isSelected = dateStr === selectedDate
          return (
            <div
              key={dateStr}
              className={`cal-cell${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
              onClick={() => onSelectDate(dateStr)}
            >
              <span className="cal-day">{day}</span>
              {platforms.length > 0 && (
                <div className="cal-dots">
                  {platforms.slice(0, 3).map((p) => (
                    <span
                      key={p}
                      className="cal-dot"
                      style={{ background: PLATFORM_COLORS[p] }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const posts = useStore((s) => s.posts)
  const addPost = useStore((s) => s.addPost)
  const deletePost = useStore((s) => s.deletePost)

  const today = dayjs().format('YYYY-MM-DD')
  const [selectedDate, setSelectedDate] = useState(today)
  const [calYear, setCalYear] = useState(dayjs().year())
  const [calMonth, setCalMonth] = useState(dayjs().month())
  const [showAddPopup, setShowAddPopup] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    caption: '',
    platforms: [] as Platform[],
    scheduledAt: new Date(),
    hashtags: '',
    notes: '',
  })

  const selectedDayPosts = useMemo(() =>
    posts
      .filter((p) => dayjs(p.scheduledAt).format('YYYY-MM-DD') === selectedDate)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [posts, selectedDate]
  )

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1) }
    else setCalMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1) }
    else setCalMonth((m) => m + 1)
  }

  const handleAddPost = () => {
    if (!newPost.title.trim() || !newPost.caption.trim()) {
      Toast.show({ content: 'Title and caption are required', icon: 'fail' })
      return
    }
    if (newPost.platforms.length === 0) {
      Toast.show({ content: 'Select at least one platform', icon: 'fail' })
      return
    }
    addPost({
      title: newPost.title.trim(),
      caption: newPost.caption.trim(),
      platforms: newPost.platforms,
      scheduledAt: newPost.scheduledAt.toISOString(),
      status: 'scheduled',
      hashtags: newPost.hashtags.split(' ').filter(Boolean),
      notes: newPost.notes.trim(),
    })
    setShowAddPopup(false)
    setNewPost({ title: '', caption: '', platforms: [], scheduledAt: new Date(), hashtags: '', notes: '' })
    Toast.show({ content: 'Post scheduled!', icon: 'success' })
  }

  const handleDeletePost = async (id: string) => {
    const confirmed = await Dialog.confirm({
      content: 'Delete this scheduled post?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    })
    if (confirmed) {
      deletePost(id)
      Toast.show({ content: 'Post deleted', icon: 'success' })
    }
  }

  return (
    <div className="calendar-page">
      <NavBar
        back={null}
        right={
          <Button
            color="primary"
            fill="none"
            onClick={() => setShowAddPopup(true)}
          >
            <AddOutline /> New Post
          </Button>
        }
      >
        Social Calendar
      </NavBar>

      <div className="calendar-body">
        <MiniCalendar
          year={calYear}
          month={calMonth}
          posts={posts}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
        />

        <div className="day-posts-section">
          <h3 className="day-posts-heading">
            <AppOutline />
            {selectedDate === today
              ? 'Today'
              : dayjs(selectedDate).format('ddd, MMM D')}
            <span className="day-posts-count">{selectedDayPosts.length} post{selectedDayPosts.length !== 1 ? 's' : ''}</span>
          </h3>

          {selectedDayPosts.length === 0 ? (
            <Empty
              description={`Nothing scheduled for ${selectedDate === today ? 'today' : dayjs(selectedDate).format('MMM D')}`}
              imageStyle={{ width: 80 }}
            />
          ) : (
            <div className="post-list">
              {selectedDayPosts.map((post) => (
                <SwipeAction
                  key={post.id}
                  rightActions={[
                    {
                      key: 'delete',
                      text: <CloseCircleOutline />,
                      color: 'danger',
                      onClick: () => handleDeletePost(post.id),
                    },
                  ]}
                >
                  <Card className="post-card">
                    <div className="post-card-header">
                      <div className="post-title">{post.title}</div>
                      <Tag color={STATUS_COLORS[post.status]} fill="outline">
                        {post.status}
                      </Tag>
                    </div>
                    <p className="post-caption">{post.caption}</p>
                    <div className="post-meta">
                      <span className="post-time">
                        ⏰ {dayjs(post.scheduledAt).format('h:mm A')}
                      </span>
                      <div className="post-platforms">
                        {post.platforms.map((p) => (
                          <span
                            key={p}
                            className="platform-pill"
                            style={{ background: PLATFORM_COLORS[p] }}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="post-hashtags">
                        {post.hashtags.slice(0, 4).map((h) => (
                          <span key={h} className="hashtag">{h.startsWith('#') ? h : `#${h}`}</span>
                        ))}
                      </div>
                    )}
                  </Card>
                </SwipeAction>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Post Popup */}
      <Popup
        visible={showAddPopup}
        onMaskClick={() => setShowAddPopup(false)}
        bodyStyle={{ borderRadius: '20px 20px 0 0', padding: '16px 16px 32px' }}
        position="bottom"
      >
        <div className="popup-handle" />
        <h3 className="popup-title">Schedule New Post</h3>

        <Form layout="vertical">
          <Form.Item label="Title" required>
            <Input
              placeholder="Post title"
              value={newPost.title}
              onChange={(v) => setNewPost((s) => ({ ...s, title: v }))}
            />
          </Form.Item>

          <Form.Item label="Caption" required>
            <TextArea
              placeholder="Write your caption..."
              rows={3}
              value={newPost.caption}
              onChange={(v) => setNewPost((s) => ({ ...s, caption: v }))}
            />
          </Form.Item>

          <Form.Item label="Platforms" required>
            <Picker
              columns={PLATFORM_OPTIONS}
              onConfirm={(v) =>
                setNewPost((s) => ({
                  ...s,
                  platforms: v[0] ? [v[0] as Platform] : [],
                }))
              }
            >
              {(items) => (
                <div className="picker-trigger">
                  {newPost.platforms.length > 0
                    ? newPost.platforms.join(', ')
                    : items[0]?.label ?? 'Select platform'}
                </div>
              )}
            </Picker>
          </Form.Item>

          <Form.Item label="Hashtags">
            <Input
              placeholder="#hashtag1 #hashtag2"
              value={newPost.hashtags}
              onChange={(v) => setNewPost((s) => ({ ...s, hashtags: v }))}
            />
          </Form.Item>

          <Form.Item label="Notes">
            <Input
              placeholder="Internal notes..."
              value={newPost.notes}
              onChange={(v) => setNewPost((s) => ({ ...s, notes: v }))}
            />
          </Form.Item>
        </Form>

        <div className="popup-actions">
          <Button block color="default" onClick={() => setShowAddPopup(false)}>
            Cancel
          </Button>
          <Button block color="primary" onClick={handleAddPost}>
            Schedule Post
          </Button>
        </div>
      </Popup>
    </div>
  )
}
