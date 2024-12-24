'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadFile } from './actions'
import type { FileTableItem } from '@/types/database'

export default function FileUploadForm() {
  const [inputText, setInputText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadId, setUploadId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed'>('idle')
  const [result, setResult] = useState<FileTableItem | null>(null)

  useEffect(() => {
    if (uploadId && status === 'processing') {
      const checkStatus = async () => {
        try {
          const response = await fetch(`/api/status/${uploadId}`)
          const data = await response.json()
          
          if (data.status === 'completed') {
            setStatus('completed')
            setResult(data.data)
          } else {
            // Check again in 5 seconds
            setTimeout(checkStatus, 5000)
          }
        } catch (error) {
          console.error('Error checking status:', error)
        }
      }

      checkStatus()
    }
  }, [uploadId, status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsSubmitting(true)
    setStatus('uploading')
    
    try {
      const formData = new FormData()
      formData.append('inputText', inputText)
      formData.append('file', selectedFile)
      
      const { id } = await uploadFile(formData)
      setUploadId(id)
      setStatus('processing')
    } catch (error) {
      console.error('Error uploading:', error)
      setStatus('idle')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="text-input">Text input:</Label>
            <Input
              id="text-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              required
              disabled={status !== 'idle'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-input">File input:</Label>
            <Input
              id="file-input"
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              required
              disabled={status !== 'idle'}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !selectedFile || status !== 'idle'}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>

        {status !== 'idle' && (
          <div className="mt-4 p-4 rounded bg-gray-50">
            <h3 className="font-semibold mb-2">Status: {status}</h3>
            {status === 'processing' && (
              <p className="text-sm text-gray-600">
                Your file is being processed. This may take a few minutes...
              </p>
            )}
            {status === 'completed' && result && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Processing completed!</p>
                <p className="text-sm">
                  Output file: {result.output_file_path}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

