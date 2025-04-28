"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileUp, X, File, FileText, ImageIcon } from "lucide-react"
import type { Document } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  document?: Document | null
  relatedType: "attraction" | "reservation"
  relatedId: string
  onSave: (data: Partial<Document>) => void
}

const documentTypeIcons: Record<string, any> = {
  "application/pdf": FileText,
  "image/jpeg": ImageIcon,
  "image/png": ImageIcon,
  default: File,
}

export default function DocumentModal({
  isOpen,
  onClose,
  document,
  relatedType,
  relatedId,
  onSave,
}: DocumentModalProps) {
  const [name, setName] = useState(document?.name || "")
  const [description, setDescription] = useState(document?.description || "")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [documentType, setDocumentType] = useState<string>(document?.type || "application/pdf")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    // Simulate file upload with progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5
      if (progress > 100) progress = 100
      setUploadProgress(progress)

      if (progress === 100) {
        clearInterval(interval)
        setTimeout(() => {
          const documentData: Partial<Document> = {
            name,
            description,
            type: file?.type || documentType,
            size: file?.size || document?.size || 1024 * 1024, // Default 1MB if no file
            url: document?.url || "/documents/new-document.pdf", // Mock URL
            uploadedAt: new Date(),
            relatedTo: {
              type: relatedType,
              id: relatedId,
            },
          }

          onSave(documentData)
          setIsUploading(false)
          resetForm()
        }, 500)
      }
    }, 200)
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setFile(null)
    setUploadProgress(0)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Auto-fill name if empty
      if (!name) {
        setName(selectedFile.name.split(".").slice(0, -1).join("."))
      }
      // Set document type based on file
      setDocumentType(selectedFile.type)
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Get icon for document type
  const getDocumentIcon = (type: string) => {
    const IconComponent = documentTypeIcons[type] || documentTypeIcons.default
    return <IconComponent className="h-5 w-5" />
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{document ? "Edit Document" : "Add New Document"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Document Title</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter document title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter document description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType} disabled={!!file}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="application/pdf">PDF Document</SelectItem>
                <SelectItem value="image/jpeg">JPEG Image</SelectItem>
                <SelectItem value="image/png">PNG Image</SelectItem>
                <SelectItem value="application/msword">Word Document</SelectItem>
                <SelectItem value="application/vnd.ms-excel">Excel Spreadsheet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload File</Label>
            {file ? (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getDocumentIcon(file.type)}
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={removeFile} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                <input type="file" id="file" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
                <label htmlFor="file" className="flex flex-col items-center justify-center cursor-pointer space-y-2">
                  <FileUp className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload or drag and drop</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">PDF, DOC, XLS, JPG, PNG (max. 10MB)</span>
                </label>
              </div>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !name}>
              {isUploading ? "Uploading..." : document ? "Update Document" : "Upload Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
