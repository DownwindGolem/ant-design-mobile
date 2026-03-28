import { useState, useRef } from 'react'
import {
  NavBar,
  Button,
  Form,
  Input,
  TextArea,
  Tag,
  Card,
  Toast,
  Dialog,
  Empty,
  SwipeAction,
  Image,
  Grid,
  Popup,
} from 'antd-mobile'
import {
  CloseCircleOutline,
  FileWrongOutline,
  PictureOutline,
  SoundOutline,
} from 'antd-mobile-icons'
import dayjs from 'dayjs'
import { useStore } from '../store/useStore'
import type { ContentType } from '../types'
import './UploadPage.css'

const ACCEPT_MAP: Record<string, string> = {
  image: 'image/*',
  video: 'video/*',
  document: '.pdf,.doc,.docx,.ppt,.pptx,.txt',
}

function FileIcon({ type }: { type: ContentType }) {
  if (type === 'image') return <PictureOutline />
  if (type === 'video') return <SoundOutline />
  return <FileWrongOutline />
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadPage() {
  const content = useStore((s) => s.content)
  const addContent = useStore((s) => s.addContent)
  const deleteContent = useStore((s) => s.deleteContent)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showUploadPopup, setShowUploadPopup] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadType, setUploadType] = useState<ContentType>('image')
  const [form, setForm] = useState({ name: '', description: '', tags: '' })
  const [uploading, setUploading] = useState(false)
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setForm((f) => ({ ...f, name: file.name.replace(/\.[^.]+$/, '') }))

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviewUrl(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
    setShowUploadPopup(true)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    if (!form.name.trim()) {
      Toast.show({ content: 'Please enter a name', icon: 'fail' })
      return
    }

    setUploading(true)
    try {
      // Simulate upload delay
      await new Promise((r) => setTimeout(r, 800))

      // In a real app, upload to cloud storage and get URL back
      // For MVP, use object URL or base64 for images
      const url = previewUrl ?? URL.createObjectURL(selectedFile)

      addContent({
        name: form.name.trim(),
        type: uploadType,
        url,
        thumbnailUrl: previewUrl ?? undefined,
        size: selectedFile.size,
        mimeType: selectedFile.type,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        description: form.description.trim(),
      })

      setShowUploadPopup(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      setForm({ name: '', description: '', tags: '' })
      Toast.show({ content: 'Uploaded successfully!', icon: 'success' })
    } catch {
      Toast.show({ content: 'Upload failed. Try again.', icon: 'fail' })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteContent = async (id: string) => {
    const confirmed = await Dialog.confirm({
      content: 'Remove this file from your library?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
    })
    if (confirmed) {
      deleteContent(id)
      Toast.show({ content: 'File removed', icon: 'success' })
    }
  }

  const filtered = content.filter(
    (c) => filterType === 'all' || c.type === filterType
  )

  const counts = {
    all: content.length,
    image: content.filter((c) => c.type === 'image').length,
    video: content.filter((c) => c.type === 'video').length,
    document: content.filter((c) => c.type === 'document').length,
  }

  return (
    <div className="upload-page">
      <NavBar back={null}>Content Library</NavBar>

      {/* Upload Type Selector */}
      <div className="upload-type-row">
        {(['image', 'video', 'document'] as ContentType[]).map((type) => (
          <button
            key={type}
            className="upload-type-btn"
            onClick={() => {
              setUploadType(type)
              setSelectedFile(null)
              setPreviewUrl(null)
              setTimeout(() => fileInputRef.current?.click(), 50)
            }}
          >
            <div className={`upload-type-icon upload-type-icon--${type}`}>
              <FileIcon type={type} />
            </div>
            <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
          </button>
        ))}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_MAP[uploadType]}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {(['all', 'image', 'video', 'document'] as const).map((t) => (
          <button
            key={t}
            className={`filter-tab${filterType === t ? ' active' : ''}`}
            onClick={() => setFilterType(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span className="filter-count">{counts[t]}</span>
          </button>
        ))}
      </div>

      {/* Content Grid / List */}
      <div className="content-body">
        {filtered.length === 0 ? (
          <Empty
            description={`No ${filterType === 'all' ? '' : filterType + ' '}files uploaded yet`}
            imageStyle={{ width: 80 }}
          />
        ) : (
          <div className="content-list">
            {filtered.map((item) => (
              <SwipeAction
                key={item.id}
                rightActions={[
                  {
                    key: 'delete',
                    text: <CloseCircleOutline />,
                    color: 'danger',
                    onClick: () => handleDeleteContent(item.id),
                  },
                ]}
              >
                <Card className="content-card">
                  <div className="content-card-inner">
                    {item.type === 'image' && item.thumbnailUrl ? (
                      <div className="content-thumb">
                        <Image src={item.thumbnailUrl} fit="cover" width={60} height={60} />
                      </div>
                    ) : (
                      <div className={`content-icon-thumb content-icon-thumb--${item.type}`}>
                        <FileIcon type={item.type} />
                      </div>
                    )}
                    <div className="content-info">
                      <div className="content-name">{item.name}</div>
                      <div className="content-meta-row">
                        <span className="content-size">{formatBytes(item.size)}</span>
                        <span className="content-date">{dayjs(item.uploadedAt).format('MMM D, YYYY')}</span>
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="content-tags">
                          {item.tags.map((tag) => (
                            <Tag key={tag} color="primary" fill="outline" style={{ fontSize: 10 }}>
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                    <Tag color="default" fill="outline" style={{ flexShrink: 0 }}>
                      {item.type}
                    </Tag>
                  </div>
                </Card>
              </SwipeAction>
            ))}
          </div>
        )}
      </div>

      {/* Upload Detail Popup */}
      <Popup
        visible={showUploadPopup}
        onMaskClick={() => setShowUploadPopup(false)}
        bodyStyle={{ borderRadius: '20px 20px 0 0', padding: '16px 16px 40px' }}
        position="bottom"
      >
        <div className="popup-handle" />
        <h3 className="popup-title">Add to Library</h3>

        {previewUrl && (
          <div className="upload-preview">
            <Image src={previewUrl} fit="contain" height={160} />
          </div>
        )}

        {!previewUrl && selectedFile && (
          <div className="upload-file-info">
            <FileWrongOutline />
            <span>{selectedFile.name}</span>
            <span className="upload-file-size">{formatBytes(selectedFile.size)}</span>
          </div>
        )}

        <Form layout="vertical">
          <Form.Item label="Name" required>
            <Input
              placeholder="Descriptive file name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />
          </Form.Item>

          <Form.Item label="Description">
            <TextArea
              placeholder="What is this file for?"
              rows={2}
              value={form.description}
              onChange={(v) => setForm((f) => ({ ...f, description: v }))}
            />
          </Form.Item>

          <Form.Item label="Tags (comma-separated)">
            <Input
              placeholder="product, launch, Q2"
              value={form.tags}
              onChange={(v) => setForm((f) => ({ ...f, tags: v }))}
            />
          </Form.Item>
        </Form>

        <div className="popup-actions">
          <Button block color="default" onClick={() => setShowUploadPopup(false)}>
            Cancel
          </Button>
          <Button block color="primary" loading={uploading} onClick={handleUpload}>
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </div>
      </Popup>
    </div>
  )
}
