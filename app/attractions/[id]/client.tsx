"use client";

import { useState, useEffect, use } from "react";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  attractions as allAttractions,
  reservations as allReservations,
  maintenanceRecords as allMaintenanceRecords,
  documents as allDocuments,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Edit,
  FileText,
  Package,
  Ruler,
  Weight,
  Plus,
  Wrench,
  DollarSign,
  File,
  Download,
  Trash,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Attraction,
  Reservation,
  MaintenanceRecord,
  Document,
} from "@/app/types/types";
import AttractionModal from "@/components/modals/attraction-modal";
import MaintenanceModal from "@/components/modals/maintenance-modal";
import DocumentModal from "@/components/modals/document-modal";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/i18n/translation-context";

export default function AttractionDetailPageClient({ id }: { id: string }) {
  const router = useRouter();
  const { t, formatT } = useTranslation();

  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [relatedReservations, setRelatedReservations] = useState<Reservation[]>(
    []
  );
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecord[]
  >([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  const [isAttractionModalOpen, setIsAttractionModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  const [currentMaintenanceRecord, setCurrentMaintenanceRecord] =
    useState<MaintenanceRecord | null>(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Find the attraction by ID
    const foundAttraction = allAttractions.find((a) => a.id === id);
    if (foundAttraction) {
      setAttraction(foundAttraction);

      // Find reservations that include this attraction
      const reservations = allReservations.filter((r) =>
        r.attractions.some((a) => a.attractionId === id)
      );
      setRelatedReservations(reservations);

      // Find maintenance records for this attraction
      const records = allMaintenanceRecords.filter(
        (r) => r.attractionId === id
      );
      setMaintenanceRecords(records);

      // Find documents for this attraction
      const docs = allDocuments.filter(
        (d) => d.relatedTo?.type === "attraction" && d.relatedTo.id === id
      );
      setDocuments(docs);
    }
  }, [id]);

  const handleOpenAttractionModal = () => {
    setIsAttractionModalOpen(true);
  };

  const handleCloseAttractionModal = () => {
    setIsAttractionModalOpen(false);
  };

  const handleOpenMaintenanceModal = (record?: MaintenanceRecord) => {
    setCurrentMaintenanceRecord(record || null);
    setIsMaintenanceModalOpen(true);
  };

  const handleCloseMaintenanceModal = () => {
    setIsMaintenanceModalOpen(false);
    setCurrentMaintenanceRecord(null);
  };

  const handleOpenDocumentModal = (document?: Document) => {
    setCurrentDocument(document || null);
    setIsDocumentModalOpen(true);
  };

  const handleCloseDocumentModal = () => {
    setIsDocumentModalOpen(false);
    setCurrentDocument(null);
  };

  const handleSaveAttraction = (data: Partial<Attraction>) => {
    // Update the attraction
    setAttraction((prev) =>
      prev ? ({ ...prev, ...data } as Attraction) : null
    );
    toast({
      title: t("attractions.updated"),
      description: formatT("attractions.updateSuccess", { name: data.name }),
    });
    handleCloseAttractionModal();
  };

  const handleSaveMaintenanceRecord = (data: Partial<MaintenanceRecord>) => {
    if (currentMaintenanceRecord) {
      // Update existing maintenance record
      setMaintenanceRecords((prev) =>
        prev.map((record) =>
          record.id === currentMaintenanceRecord.id
            ? ({ ...record, ...data } as MaintenanceRecord)
            : record
        )
      );
      toast({
        title: t("common.updated"),
        description: formatT("common.updateSuccess", {
          item: t("attractionDetails.maintenanceRecord"),
        }),
      });
    } else {
      // Create new maintenance record
      const newRecord: MaintenanceRecord = {
        ...data,
        id: `maint-${Math.floor(Math.random() * 10000)}`,
        attractionId: id,
        createdAt: new Date(),
      } as MaintenanceRecord;

      setMaintenanceRecords((prev) => [...prev, newRecord]);
      toast({
        title: t("common.added"),
        description: formatT("common.addSuccess", {
          item: t("attractionDetails.maintenanceRecord"),
        }),
      });
    }
    handleCloseMaintenanceModal();
  };

  const handleSaveDocument = (data: Partial<Document>) => {
    if (currentDocument) {
      // Update existing document
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === currentDocument.id
            ? ({ ...doc, ...data } as Document)
            : doc
        )
      );
      toast({
        title: t("common.updated"),
        description: formatT("common.updateSuccess", {
          item: t("common.document"),
        }),
      });
    } else {
      // Create new document
      const newDocument: Document = {
        ...data,
        id: `doc-${Math.floor(Math.random() * 10000)}`,
        uploadedAt: new Date(),
        relatedTo: {
          type: "attraction",
          id: id,
        },
      } as Document;

      setDocuments((prev) => [...prev, newDocument]);
      toast({
        title: t("common.added"),
        description: formatT("common.addSuccess", {
          item: t("common.document"),
        }),
      });
    }
    handleCloseDocumentModal();
  };

  const handleDeleteDocument = (id: string) => {
    if (
      confirm(formatT("common.confirmDelete", { item: t("common.document") }))
    ) {
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      toast({
        title: t("common.deleted"),
        description: formatT("common.deleteSuccess", {
          item: t("common.document"),
        }),
      });
    }
  };

  if (!attraction) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">
            {formatT("common.notFound", { item: t("common.attraction") })}
          </h1>
          <Button onClick={() => router.push("/attractions")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("attractionDetails.back")}
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/attractions")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.back")}
            </Button>
            <h1 className="text-2xl font-bold">{attraction.name}</h1>
          </div>
          <Button onClick={handleOpenAttractionModal}>
            <Edit className="mr-2 h-4 w-4" />
            {t("attractionDetails.editAttraction")}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <div className="aspect-square relative">
                <Image
                  src={
                    attraction.image ||
                    "/placeholder.svg?height=500&width=500&query=bouncy%20castle"
                  }
                  alt={attraction.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">
                      {t("attractionDetails.id")}:
                    </span>
                    <span>{attraction.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">
                      {t("attractionDetails.setupTime")}:
                    </span>
                    <span>
                      {attraction.setupTime} {t("calendar.minutes")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">
                      {t("attractionDetails.dimensions")}:
                    </span>
                    <span>
                      {attraction.width}cm × {attraction.length}cm ×{" "}
                      {attraction.height}cm
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Weight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">
                      {t("attractionDetails.weight")}:
                    </span>
                    <span>{attraction.weight} kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">
                      {t("attractionDetails.price")}:
                    </span>
                    <span className="text-lg font-bold">
                      ${attraction.price}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="reservations" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="reservations">
                  {t("reservations.title")}
                </TabsTrigger>
                <TabsTrigger value="documents">
                  {t("common.documents")}
                </TabsTrigger>
                <TabsTrigger value="maintenance">
                  {t("attractionDetails.maintenance")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reservations">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("attractionDetails.relatedReservations")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {relatedReservations.length > 0 ? (
                      <div className="space-y-4">
                        {relatedReservations.map((reservation) => (
                          <div
                            key={reservation.id}
                            className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-md cursor-pointer transition-colors"
                            onClick={() =>
                              router.push(`/reservations/${reservation.id}`)
                            }
                          >
                            <div>
                              <div className="font-medium">
                                {reservation.client?.firstName}{" "}
                                {reservation.client?.lastName ||
                                  t("reservations.unknownClient")}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(
                                  reservation.startDate
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {new Date(
                                  reservation.endDate
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {reservation.attractions.length}{" "}
                                {t("common.attractions")}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-medium">
                                  ${reservation.totalPrice}
                                </div>
                                <Badge
                                  className={
                                    reservation.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                      : reservation.status === "in-progress"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                      : reservation.status === "completed"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                  }
                                >
                                  {t(
                                    `reservations.status.${reservation.status}`
                                  )}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        {t("attractionDetails.noReservations")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t("common.documents")}</CardTitle>
                    <Button onClick={() => handleOpenDocumentModal()}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("attractionDetails.addDocument")}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {documents.length > 0 ? (
                      <div className="space-y-4">
                        {documents.map((document) => (
                          <div
                            key={document.id}
                            className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                  <File className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {document.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(
                                      document.uploadedAt
                                    ).toLocaleDateString()}{" "}
                                    • {(document.size / 1024 / 1024).toFixed(2)}{" "}
                                    MB
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() =>
                                    handleOpenDocumentModal(document)
                                  }
                                >
                                  <Edit className="h-3.5 w-3.5 mr-1" />
                                  {t("common.edit")}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() =>
                                    window.open(document.url, "_blank")
                                  }
                                >
                                  <Download className="h-3.5 w-3.5 mr-1" />
                                  {t("common.download")}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-red-500 dark:text-red-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDocument(document.id);
                                  }}
                                >
                                  <Trash className="h-3.5 w-3.5 mr-1" />
                                  {t("common.delete")}
                                </Button>
                              </div>
                            </div>
                            {document.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 ml-13">
                                {document.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        {t("attractionDetails.noDocuments")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="maintenance">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                      {t("attractionDetails.maintenanceHistory")}
                    </CardTitle>
                    <Button onClick={() => handleOpenMaintenanceModal()}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("attractionDetails.addMaintenanceRecord")}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {maintenanceRecords.length > 0 ? (
                      <div className="space-y-4">
                        {maintenanceRecords.map((record) => (
                          <div
                            key={record.id}
                            className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                            onClick={() => handleOpenMaintenanceModal(record)}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                  <Wrench className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {new Date(record.date).toLocaleDateString()}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("common.performedBy")}:{" "}
                                    {record.performedBy}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span className="font-medium">
                                  ${record.cost}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                              {record.description}
                            </p>
                            {record.images && record.images.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {record.images.map((image, index) => (
                                  <div
                                    key={index}
                                    className="relative w-16 h-16 rounded-md overflow-hidden"
                                  >
                                    <Image
                                      src={
                                        image ||
                                        "/placeholder.svg?height=64&width=64&query=maintenance"
                                      }
                                      alt={`${t("common.maintenanceImage")} ${
                                        index + 1
                                      }`}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        {t("attractionDetails.noMaintenanceRecords")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <AttractionModal
        isOpen={isAttractionModalOpen}
        onClose={handleCloseAttractionModal}
        attraction={attraction}
        onSave={handleSaveAttraction}
      />

      <MaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={handleCloseMaintenanceModal}
        attractionId={id}
        maintenanceRecord={currentMaintenanceRecord}
        onSave={handleSaveMaintenanceRecord}
      />

      <DocumentModal
        isOpen={isDocumentModalOpen}
        onClose={handleCloseDocumentModal}
        document={currentDocument}
        relatedType="attraction"
        relatedId={id}
        onSave={handleSaveDocument}
      />
    </AppLayout>
  );
}
