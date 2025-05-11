"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getClients,
  createClient,
  deleteClient,
  updateClient,
} from "@/services/clients-service";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Plus,
  Search,
  Trash,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import ClientModal from "@/components/modals/client-modal";
import { useToast } from "@/components/ui/use-toast";
import type { Client } from "@/app/types/types";
import { useTranslation } from "@/lib/i18n/translation-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;
const MOBILE_ITEMS_PER_BATCH = 5;

export default function ClientsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [mobilePageCount, setMobilePageCount] = useState(1);
  const { toast } = useToast();

  const isMobile = useIsMobile();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastClientElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && isMobile) {
          loadMoreClients();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, isMobile]
  );

  // Funkcja do ładowania większej liczby klientów na urządzeniach mobilnych
  const loadMoreClients = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const nextPage = mobilePageCount + 1;
      const response = await getClients({
        page: nextPage,
        limit: MOBILE_ITEMS_PER_BATCH,
        search: searchTerm,
      });

      if (response && response.data && response.data.length > 0) {
        setClients((prev) => [...prev, ...response.data]);
        setMobilePageCount(nextPage);

        if (
          response.data.length < MOBILE_ITEMS_PER_BATCH ||
          nextPage >= response.totalPages
        ) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: "Nie udało się załadować więcej klientów.",
      });
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcja do pobierania klientów z paginacją
  const fetchClients = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const response = await getClients({
        page,
        limit: isMobile ? MOBILE_ITEMS_PER_BATCH : ITEMS_PER_PAGE,
        search,
      });

      if (response) {
        setClients(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalClients(response.total || 0);
        setHasMore(page < (response.totalPages || 1));
        setMobilePageCount(1);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("clients.fetchError"),
        description: "Nie udało się pobrać listy klientów.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Efekt do pobierania klientów przy zmianie strony lub wyszukiwania
  useEffect(() => {
    fetchClients(currentPage, searchTerm);
  }, [currentPage, searchTerm, isMobile]);

  // Efekt do resetowania strony przy zmianie wyszukiwania
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenModal = (client?: Client) => {
    setCurrentClient(client || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentClient(null);
  };

  const handleSaveClient = async (data: Partial<Client>) => {
    try {
      if (currentClient) {
        const updatedClient = await updateClient(currentClient.id, data);

        setClients((prev) =>
          prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
        );

        toast({
          title: t("clients.updated") || "Klient zaktualizowany",
          description: `${data.firstName} ${data.lastName} został zaktualizowany.`,
        });
      } else {
        const newClient = await createClient(
          data as Omit<Client, "id" | "createdAt">
        );

        // Dodaj nowego klienta tylko jeśli jesteśmy na pierwszej stronie
        if (currentPage === 1) {
          setClients((prev) => [newClient, ...prev.slice(0, -1)]);
        } else {
          // Jeśli nie jesteśmy na pierwszej stronie, przejdź do pierwszej strony
          setCurrentPage(1);
        }

        toast({
          title: t("clients.created") || "Klient utworzony",
          description: `${data.firstName} ${data.lastName} został dodany.`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("common.error") || "Błąd",
        description: "Nie udało się zapisać klienta.",
      });
    } finally {
      handleCloseModal();
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (
      !confirm(
        t("clients.confirmDelete") || "Czy na pewno chcesz usunąć tego klienta?"
      )
    )
      return;

    try {
      await deleteClient(id);

      setClients((prev) => prev.filter((c) => c.id !== id));

      // Jeśli usunęliśmy ostatniego klienta na stronie, wróć do poprzedniej strony
      if (clients.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }

      toast({
        title: t("clients.deleted") || "Klient usunięty",
        description: t("clients.deleteSuccess") || "Klient został usunięty.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: t("common.error") || "Błąd",
        description: "Nie udało się usunąć klienta.",
      });
    }
  };

  // Renderowanie kart klientów dla widoku mobilnego
  const renderClientCards = () => {
    if (clients.length === 0 && !isLoading) {
      return (
        <div className="text-center py-8 text-gray-500">
          {searchTerm
            ? "Nie znaleziono klientów spełniających kryteria wyszukiwania."
            : "Brak klientów. Dodaj pierwszego klienta."}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {clients.map((client, index) => {
          const isLastElement = index === clients.length - 1;

          return (
            <div
              key={client.id}
              ref={isLastElement ? lastClientElementRef : null}
              onClick={() => handleOpenModal(client)}
              className="cursor-pointer"
            >
              <Card className="hover:border-orange-500 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-base">
                          {client.firstName} {client.lastName}
                        </div>
                        {client.companyName && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Building className="h-3 w-3 mr-1" />
                            {client.companyName}
                            {client.taxId && (
                              <span className="ml-1">({client.taxId})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(client);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center text-sm">
                      <Phone className="h-3.5 w-3.5 mr-2 text-gray-500" />
                      {client.phone}
                    </div>
                    {client.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-3.5 w-3.5 mr-2 text-gray-500" />
                        {client.email}
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <MapPin className="h-3.5 w-3.5 mr-2 text-gray-500" />
                      {client.street} {client.buildingNumber},{" "}
                      {client.postalCode} {client.city}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-3.5 w-3.5 mr-2" />
                      {new Date(client.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}

        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Renderowanie tabeli klientów dla widoku desktopowego
  const renderClientTable = () => {
    if (clients.length === 0 && !isLoading) {
      return (
        <div className="text-center py-8 text-gray-500">
          {searchTerm
            ? "Nie znaleziono klientów spełniających kryteria wyszukiwania."
            : "Brak klientów. Dodaj pierwszego klienta."}
        </div>
      );
    }

    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left font-medium p-2">
                  {t("clients.name") || "Nazwa"}
                </th>
                <th className="text-left font-medium p-2">
                  {t("clients.contact") || "Kontakt"}
                </th>
                <th className="text-left font-medium p-2">
                  {t("clients.address") || "Adres"}
                </th>
                <th className="text-left font-medium p-2">
                  {t("clients.created") || "Utworzono"}
                </th>
                <th className="text-right font-medium p-2">
                  {t("common.actions") || "Akcje"}
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
                  onClick={() => handleOpenModal(client)}
                >
                  <td className="p-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {client.firstName} {client.lastName}
                        </div>
                        {client.companyName && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {client.companyName}
                            {client.taxId && (
                              <span className="ml-1">({client.taxId})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div>{client.phone}</div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {client.email || t("clients.noEmail")}
                    </div>
                  </td>
                  <td className="p-2">
                    <div>
                      {client.street} {client.buildingNumber}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {client.postalCode}, {client.city}
                    </div>
                  </td>
                  <td className="p-2">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(client);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {isLoading &&
                [...Array(3)].map((_, i) => (
                  <tr
                    key={`skeleton-${i}`}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="p-2">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </td>
                    <td className="p-2">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </td>
                    <td className="p-2">
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </td>
                    <td className="p-2">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Paginacja dla widoku desktopowego */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {/* Generowanie przycisków stron */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Pokaż tylko kilka stron wokół bieżącej strony
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    // Dodaj wielokropek po pierwszej stronie i przed ostatnią
                    if (page === 2 && currentPage > 3) {
                      return (
                        <PaginationItem key="ellipsis-start">
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    if (
                      page === totalPages - 1 &&
                      currentPage < totalPages - 2
                    ) {
                      return (
                        <PaginationItem key="ellipsis-end">
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return null;
                  }
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        setCurrentPage(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">
            {t("clients.title") || "Klienci"}
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder={t("clients.search") || "Szukaj klientów..."}
                className="pl-8 h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-[#0F0F12] dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={() => handleOpenModal()}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("clients.addClient") || "Dodaj klienta"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{t("clients.allClients") || "Wszyscy klienci"}</span>
              {totalClients > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  {totalClients} {totalClients === 1 ? "klient" : "klientów"}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="md:hidden">{renderClientCards()}</div>
            <div className="hidden md:block">{renderClientTable()}</div>
          </CardContent>
        </Card>
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        client={currentClient}
        onSave={handleSaveClient}
      />
    </AppLayout>
  );
}
