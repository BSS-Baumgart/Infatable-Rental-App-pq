"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { documents as initialDocuments } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Download, File, FileText, Filter, Grid, ImageIcon, List, Plus, Search, Trash, Upload, X } from "lucide-react"
import type { Document, DocumentRelationType } from "@/lib/types"
import DocumentModal from "@/components/modals/document-modal"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const documentTypeIcons: Record<string, any> = {
  "application/pdf": FileText,
  "image/jpeg": ImageIcon,
  "image/png": ImageIcon,
  default: File,
}

const relatedTypeLabels: Record<DocumentRelationType, string> = {
  attraction: "Attraction",
  reservation: "Reservation",
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const { toast } = useToast()

  // Get all unique document types
  const documentTypes = Array.from(new Set(documents.map((doc) => doc.type.split("/")[1])))

  // Filter documents based on search term and type filter
  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = document.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType ? document.type.includes(filterType) : true
    return matchesSearch && matchesType
  })

  // Get icon for document type
  const getDocumentIcon = (type: string) => {
    const IconComponent = documentTypeIcons[type] || documentTypeIcons.default
    return <IconComponent className="h-4 w-4" />
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  // Handle document save
  const handleSaveDocument = (data: Partial<Document>) => {
    if (currentDocument) {
      // Update existing document
      const updatedDocuments = documents.map((doc) => (doc.id === currentDocument.id ? { ...doc, ...data } : doc))
      setDocuments(updatedDocuments)
      toast({
        title: "Document updated",
        description: `${data.name} has been updated successfully.`,
      })
    } else {
      // Add new document
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        name: data.name || "Untitled Document",
        type: data.type || "application/pdf",
        size: data.size || 0,
        url: data.url || "",
        uploadedAt: new Date(),
        relatedTo: data.relatedTo,
      }
      setDocuments([newDocument, ...documents])
      toast({
        title: "Document uploaded",
        description: `${newDocument.name} has been uploaded successfully.`,
      })
    }
    setIsModalOpen(false)
    setCurrentDocument(null)
  }

  // Handle document delete
  const handleDeleteDocument = () => {
    if (documentToDelete) {
      const updatedDocuments = documents.filter((doc) => doc.id !== documentToDelete.id)
      setDocuments(updatedDocuments)
      toast({
        title: "Document deleted",
        description: `${documentToDelete.name} has been deleted successfully.`,
      })
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
    }
  }

  // Handle document download
  const handleDownloadDocument = (document: Document) => {
    // In a real app, this would trigger a download from the server
    // For this mock, we'll just show a toast
    toast({
      title: "Download started",
      description: `${document.name} is being downloaded.`,
    })
  }

  // Open delete confirmation dialog
  const confirmDelete = (document: Document) => {
    setDocumentToDelete(document)
    setDeleteDialogOpen(true)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Documents</h1>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                className="pl-8 h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-[#0F0F12] dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  {filterType ? `Filter: ${filterType}` : "Filter"}
                  {filterType && (
                    <X
                      className="h-3 w-3 ml-1 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFilterType(null)
                      }}
                    />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {documentTypes.map((type) => (
                  <DropdownMenuItem key={type} onClick={() => setFilterType(type)}>
                    {type.toUpperCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border border-gray-200 dark:border-gray-800 rounded-md">
              <Button
                variant="ghost"
                size="sm"
                className={viewMode === "grid" ? "bg-gray-100 dark:bg-gray-800" : ""}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={viewMode === "list" ? "bg-gray-100 dark:bg-gray-800" : ""}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={() => {
                setCurrentDocument(null)
                setIsModalOpen(true)
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Documents ({filteredDocuments.length})</span>
              {filterType && (
                <Badge variant="outline" className="ml-2">
                  Filtered by: {filterType}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setFilterType(null)} />
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <File className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium">No documents found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {searchTerm || filterType
                    ? "Try adjusting your search or filters"
                    : "Upload your first document to get started"}
                </p>
                {!searchTerm && !filterType && (
                  <Button
                    className="mt-4"
                    onClick={() => {
                      setCurrentDocument(null)
                      setIsModalOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-center h-24 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
                      {getDocumentIcon(document.type)}
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium truncate" title={document.name}>
                        {document.name}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatFileSize(document.size)}</span>
                        <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      {document.relatedTo && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {relatedTypeLabels[document.relatedTo.type]}: {document.relatedTo.id}
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDownloadDocument(document)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 dark:text-red-400"
                          onClick={() => confirmDelete(document)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left font-medium p-2">Name</th>
                      <th className="text-left font-medium p-2">Type</th>
                      <th className="text-left font-medium p-2">Size</th>
                      <th className="text-left font-medium p-2">Uploaded</th>
                      <th className="text-left font-medium p-2">Related To</th>
                      <th className="text-right font-medium p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((document) => (
                      <tr
                        key={document.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                      >
                        <td className="p-2">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              {getDocumentIcon(document.type)}
                            </div>
                            <div className="font-medium">{document.name}</div>
                          </div>
                        </td>
                        <td className="p-2">{document.type.split("/")[1]}</td>
                        <td className="p-2">{formatFileSize(document.size)}</td>
                        <td className="p-2">{new Date(document.uploadedAt).toLocaleDateString()}</td>
                        <td className="p-2">
                          {document.relatedTo ? (
                            <span>
                              {relatedTypeLabels[document.relatedTo.type]}: {document.relatedTo.id}
                            </span>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">None</span>
                          )}
                        </td>
                        <td className="p-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleDownloadDocument(document)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentDocument(document)
                                setIsModalOpen(true)
                              }}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => confirmDelete(document)}
                              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Upload/Edit Modal */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setCurrentDocument(null)
        }}
        document={currentDocument}
        relatedType="attraction"
        relatedId="none"
        onSave={handleSaveDocument}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the document "{documentToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
