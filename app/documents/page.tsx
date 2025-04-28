"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { documents } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Download, File, FileText, ImageIcon, Search, Trash, Upload } from "lucide-react"
import type { DocumentRelationType } from "@/lib/types"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filter documents based on search term
  const filteredDocuments = documents.filter((document) =>
    document.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Documents</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                className="pl-8 h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-[#0F0F12] dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex border border-gray-200 dark:border-gray-800 rounded-md">
              <Button
                variant="ghost"
                size="sm"
                className={viewMode === "grid" ? "bg-gray-100 dark:bg-gray-800" : ""}
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={viewMode === "list" ? "bg-gray-100 dark:bg-gray-800" : ""}
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </div>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredDocuments.map((document) => (
                  <div key={document.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
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
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 dark:text-red-400">
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
                      <tr key={document.id} className="border-b border-gray-100 dark:border-gray-800">
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
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
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
    </AppLayout>
  )
}
