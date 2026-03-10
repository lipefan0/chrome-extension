import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  User,
  DollarSign,
  Hash,
  Loader2,
  Package,
  CreditCard,
  Receipt,
  ArrowLeft,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { storage } from "../lib/storage";

interface Sale {
  id: number;
  numero: number;
  data: string;
  total: number;
  contato: {
    nome: string;
  };
}

interface SaleDetail {
  id: number;
  numero: number;
  numeroLoja: string;
  data: string;
  totalProdutos: number;
  total: number;
  contato: {
    nome: string;
    numeroDocumento: string;
  };
  itens: Array<{
    id: number;
    codigo: string;
    quantidade: number;
    valor: number;
    descricao: string;
  }>;
  parcelas: Array<{
    id: number;
    dataVencimento: string;
    valor: number;
    observacoes: string;
  }>;
}

export function SalesList() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMore, setHasMore] = useState(true);

  // View state
  const [view, setView] = useState<"list" | "details">("list");
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saleDetails, setSaleDetails] = useState<SaleDetail | null>(null);

  const fetchSales = async (
    currentPage: number,
    query: string,
    append = false,
  ) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const token = await storage.get("token");

      const searchParam = query ? `&numeroPedido=${query}` : "";
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/bling/vendas/list?pagina=${currentPage}${searchParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar vendas");
      }

      const data: Sale[] = await response.json();

      if (data.length === 0) {
        setHasMore(false);
        if (!append) setSales([]);
      } else {
        setHasMore(data.length > 0);
        if (append) {
          setSales((prev) => [...prev, ...data]);
        } else {
          setSales(data);
        }
      }
    } catch (err) {
      console.error(err);
      if (!append) setSales([]);
    } finally {
      if (!append) setLoading(false);
      else setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (view === "list") {
      setPage(1);
      setHasMore(true);
      fetchSales(1, searchQuery, false);
    }
  }, [searchQuery, view]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSales(nextPage, searchQuery, true);
  };

  const handleSaleClick = async (id: number) => {
    setView("details");
    setLoadingDetails(true);
    setSaleDetails(null);

    try {
      const token = await storage.get("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/bling/vendas/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar detalhes da venda");
      }

      const data: SaleDetail = await response.json();
      setSaleDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBackToList = () => {
    setView("list");
    setSaleDetails(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  if (view === "details") {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col h-full fade-in slide-in-from-right-4 duration-500 animate-in">
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToList}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full h-10 w-10 flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Receipt className="w-5 h-5 text-blue-500" />
            Detalhes do Pedido
          </h2>
        </div>

        <div className="flex-1 space-y-4 pb-4 bg-zinc-950/50 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl text-white">
          {loadingDetails ? (
            <div className="flex flex-col gap-4 p-6">
              <Skeleton className="h-20 w-full bg-zinc-900 rounded-xl" />
              <Skeleton className="h-28 w-full bg-zinc-900 rounded-xl" />
              <Skeleton className="h-40 w-full bg-zinc-900 rounded-xl" />
            </div>
          ) : saleDetails ? (
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                  <p className="text-zinc-500 text-[10px] sm:text-xs uppercase tracking-wider font-semibold mb-1">
                    Nº / Loja
                  </p>
                  <p className="font-semibold text-base sm:text-lg text-zinc-200">
                    {saleDetails.numero}{" "}
                    <span className="text-zinc-500 text-xs sm:text-sm font-normal">
                      / {saleDetails.numeroLoja || "-"}
                    </span>
                  </p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                  <p className="text-zinc-500 text-[10px] sm:text-xs uppercase tracking-wider font-semibold mb-1">
                    Data
                  </p>
                  <p className="font-semibold text-base sm:text-lg text-zinc-200">
                    {formatDate(saleDetails.data)}
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div>
                <h3 className="text-zinc-400 text-sm font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-500" />
                  Cliente
                </h3>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                  <p className="font-medium text-white">
                    {saleDetails.contato.nome}
                  </p>
                  {saleDetails.contato.numeroDocumento && (
                    <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                      Doc:{" "}
                      <span className="font-mono text-zinc-400">
                        {saleDetails.contato.numeroDocumento}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-zinc-400 text-sm font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-zinc-500" />
                  Itens do Pedido
                  <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-full ml-1 font-mono">
                    {saleDetails.itens?.length || 0}
                  </span>
                </h3>
                <div className="space-y-3">
                  {saleDetails.itens?.map((item) => (
                    <div
                      key={item.id}
                      className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col gap-2"
                    >
                      <p className="font-medium text-sm text-white leading-relaxed">
                        {item.descricao}
                      </p>

                      <div className="flex flex-wrap justify-between items-center mt-2 gap-2">
                        <div className="text-zinc-500 text-[11px] sm:text-xs flex gap-2">
                          <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                            Qtd: {item.quantidade}
                          </span>
                          <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800 font-mono">
                            Cod: {item.codigo}
                          </span>
                        </div>
                        <div className="text-right w-full sm:w-auto mt-1 sm:mt-0">
                          <p className="font-bold text-sm text-emerald-400">
                            {formatCurrency(item.quantidade * item.valor)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Installments */}
              <div>
                <h3 className="text-zinc-400 text-sm font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-zinc-500" />
                  Pagamentos / Parcelas
                </h3>
                <div className="space-y-3">
                  {saleDetails.parcelas?.map((parcela) => (
                    <div
                      key={parcela.id}
                      className="bg-zinc-900 px-4 py-3 rounded-xl border border-zinc-800 flex flex-wrap justify-between items-center gap-3"
                    >
                      <div>
                        <p className="text-zinc-300 text-xs sm:text-sm font-medium">
                          Venc: {formatDate(parcela.dataVencimento)}
                        </p>
                        {parcela.observacoes && (
                          <p className="text-zinc-500 text-[10px] sm:text-xs mt-1">
                            {parcela.observacoes}
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-sm text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                        {formatCurrency(parcela.valor)}
                      </p>
                    </div>
                  ))}
                  {(!saleDetails.parcelas ||
                    saleDetails.parcelas.length === 0) && (
                    <p className="text-xs sm:text-sm text-zinc-500 bg-zinc-900/50 p-4 rounded-xl text-center border border-zinc-800 border-dashed">
                      Nenhuma parcela encontrada.
                    </p>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-blue-600/10 p-5 rounded-xl border border-blue-500/20 pt-5 mt-6 mb-2">
                <div className="flex justify-between items-center mb-3 text-xs sm:text-sm text-blue-300/80">
                  <span>Total dos Produtos</span>
                  <span className="tabular-nums font-medium">
                    {formatCurrency(saleDetails.totalProdutos)}
                  </span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg sm:text-xl text-blue-400 pt-3 border-t border-blue-500/20">
                  <span>Total da Venda</span>
                  <span className="tabular-nums">
                    {formatCurrency(saleDetails.total)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center flex flex-col items-center p-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <Receipt className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-red-400 font-medium font-lg mb-2">
                Erro ao carregar venda
              </p>
              <p className="text-zinc-500 text-sm">
                Não foi possível buscar as informações neste momento.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full fade-in slide-in-from-left-4 duration-500 animate-in">
      <div className="mb-6 space-y-4">
        <h2 className="text-2xl font-bold text-white">Últimas Vendas</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            type="number"
            placeholder="Buscar por número do pedido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-blue-500/50"
          />
        </div>
      </div>

      <div className="flex-1 space-y-4 pb-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4 flex flex-col gap-3">
                <Skeleton className="h-5 w-1/3 bg-zinc-800" />
                <Skeleton className="h-4 w-2/3 bg-zinc-800" />
                <Skeleton className="h-8 w-1/4 bg-zinc-800" />
              </CardContent>
            </Card>
          ))
        ) : sales.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-800 border-dashed">
            Nenhuma venda encontrada.
          </div>
        ) : (
          <>
            {sales.map((sale) => (
              <Card
                key={sale.id}
                onClick={() => handleSaleClick(sale.id)}
                className="bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:-translate-y-0.5 transition-all shadow-none cursor-pointer text-white overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/0 group-hover:bg-blue-500/80 transition-colors" />
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 font-semibold text-base sm:text-lg">
                      <Hash className="w-4 h-4 text-blue-400" />
                      Ped. {sale.numero}
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded-full text-[11px] sm:text-sm">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                      {formatCurrency(sale.total)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-zinc-400 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-zinc-500 shrink-0" />
                      <span className="truncate">
                        {sale.contato?.nome || "Sem Nome"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
                      {formatDate(sale.data)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {hasMore && (
              <div className="pt-4 flex justify-center pb-8">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Carregando...
                    </>
                  ) : (
                    "Carregar mais vendas"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
