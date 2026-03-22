/**
 * SignExternalPDF — Assinatura de PDF Externo
 * Upload de PDF, visualização, assinatura eletrônica, chancela e download
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import OmniLayout from "@/components/OmniLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Upload, FileText, Shield, CheckCircle2, Download, Eye,
  PenLine, AlertCircle, Loader2, X, QrCode, Lock, User,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SignedDoc {
  verifiableDocId: number;
  accessCode: string;
  hash: string;
  qrCodeUrl: string;
  pdfUrl: string;
  title: string;
  documentType: string;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function SignExternalPDF() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado do arquivo
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [uploadedS3Url, setUploadedS3Url] = useState<string>("");
  const [uploadedAttachmentId, setUploadedAttachmentId] = useState<number | null>(null);

  // Estado do formulário de chancela
  const [form, setForm] = useState({
    title: "",
    documentType: "external_pdf",
    issuingUnit: "",
    notes: "",
  });

  // Estado do fluxo
  const [step, setStep] = useState<"upload" | "form" | "sign" | "done">("upload");
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [signForm, setSignForm] = useState({
    signatureType: "institutional" as "institutional" | "advanced" | "qualified",
    confirmName: "",
    role: "",
  });
  const [signedDoc, setSignedDoc] = useState<SignedDoc | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Mutations
  const uploadFile = trpc.attachments.upload.useMutation();
  const issueChancela = trpc.verification.issue.useMutation();
  const signDoc = trpc.verification.sign.useMutation();

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são aceitos");
      return;
    }
    if (f.size > 16 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo: 16 MB");
      return;
    }
    setFile(f);
    const localUrl = URL.createObjectURL(f);
    setFileUrl(localUrl);

    // Converter para base64
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = (ev.target?.result as string).split(",")[1];
      setFileBase64(b64);
    };
    reader.readAsDataURL(f);

    // Pré-preencher título com nome do arquivo
    const nameWithoutExt = f.name.replace(/\.pdf$/i, "");
    setForm(prev => ({ ...prev, title: nameWithoutExt }));
    setStep("form");
  };

  const handleUploadToS3 = async () => {
    if (!file || !fileBase64) return;
    try {
      const result = await uploadFile.mutateAsync({
        entityType: "external_pdf",
        entityId: 0,
        fileName: file.name,
        mimeType: "application/pdf",
        base64Data: fileBase64,
        category: "sign_external",
      });
      setUploadedS3Url(result.s3Url ?? "");
      setUploadedAttachmentId(result.id);
      return result;
    } catch {
      toast.error("Erro ao fazer upload do arquivo");
      throw new Error("Upload failed");
    }
  };

  const handleProceedToSign = async () => {
    if (!form.title.trim()) { toast.error("Título é obrigatório"); return; }
    if (!form.issuingUnit.trim()) { toast.error("Unidade emissora é obrigatória"); return; }

    // Upload para S3 se ainda não foi feito
    if (!uploadedS3Url) {
      await handleUploadToS3();
    }
    setStep("sign");
    setShowSignDialog(true);
  };

  const handleSign = async () => {
    if (!signForm.confirmName.trim()) {
      toast.error("Digite seu primeiro nome para confirmar");
      return;
    }
    const firstName = (user?.name ?? "").split(" ")[0].toUpperCase();
    if (signForm.confirmName.toUpperCase() !== firstName) {
      toast.error(`Nome incorreto. Digite: ${firstName}`);
      return;
    }

    try {
      // 1. Emitir chancela
      const issued = await issueChancela.mutateAsync({
        entityType: "custom",
        entityId: uploadedAttachmentId ?? 0,
        title: form.title,
        documentType: form.documentType,
        issuingUnit: form.issuingUnit,
        content: form.notes || form.title,
        origin: window.location.origin,
      });

      const vd = issued.verifiableDocument;

      // 2. Assinar
      await signDoc.mutateAsync({
        verifiableDocumentId: vd.id,
        signatureType: signForm.signatureType,
        role: signForm.role || undefined,
        origin: window.location.origin,
      });

      setSignedDoc({
        verifiableDocId: vd.id,
        accessCode: vd.verificationKey ?? "",
        hash: vd.documentHash ?? "",
        qrCodeUrl: vd.qrCodeData ?? "",
        pdfUrl: uploadedS3Url || fileUrl,
        title: form.title,
        documentType: form.documentType,
      });

      setShowSignDialog(false);
      setStep("done");
      toast.success("Documento assinado e chancela emitida com sucesso!");
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao assinar documento");
    }
  };

  const handleDownload = () => {
    if (!signedDoc) return;
    // Abre janela de impressão com o documento + chancela
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>${signedDoc.title} — Documento Assinado</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', serif; background: white; }
          .page { width: 210mm; min-height: 297mm; padding: 20mm; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 12px; margin-bottom: 20px; }
          .header h1 { font-size: 14pt; color: #1e3a5f; font-weight: bold; }
          .header p { font-size: 10pt; color: #555; margin-top: 4px; }
          .pdf-embed { width: 100%; height: 600px; border: 1px solid #ddd; margin: 20px 0; }
          .chancela { border: 2px solid #1e3a5f; border-radius: 8px; padding: 16px; margin-top: 20px; background: #f8fafc; }
          .chancela-title { font-size: 11pt; font-weight: bold; color: #1e3a5f; text-align: center; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .chancela-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 9pt; }
          .chancela-item label { color: #666; display: block; font-size: 8pt; }
          .chancela-item span { font-weight: bold; color: #1e3a5f; }
          .hash { font-family: monospace; font-size: 8pt; word-break: break-all; color: #444; background: #f0f4f8; padding: 6px; border-radius: 4px; margin-top: 8px; }
          .qr-section { text-align: center; margin-top: 12px; }
          .qr-section img { width: 80px; height: 80px; }
          .qr-section p { font-size: 8pt; color: #666; margin-top: 4px; }
          .footer { text-align: center; font-size: 8pt; color: #888; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 8px; }
          @media print { body { -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <h1>DOCUMENTO ASSINADO ELETRONICAMENTE</h1>
            <p>${signedDoc.title}</p>
          </div>
          
          ${signedDoc.pdfUrl ? `<iframe src="${signedDoc.pdfUrl}" class="pdf-embed"></iframe>` : ""}
          
          <div class="chancela">
            <div class="chancela-title">⬛ Chancela de Autenticidade</div>
            <div class="chancela-grid">
              <div class="chancela-item">
                <label>Título</label>
                <span>${signedDoc.title}</span>
              </div>
              <div class="chancela-item">
                <label>Código de Acesso</label>
                <span>${signedDoc.accessCode}</span>
              </div>
              <div class="chancela-item">
                <label>Tipo</label>
                <span>${signedDoc.documentType}</span>
              </div>
              <div class="chancela-item">
                <label>Data</label>
                <span>${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
              </div>
            </div>
            <div class="hash">
              <strong>Hash SHA-256:</strong> ${signedDoc.hash}
            </div>
            <div class="qr-section">
              ${signedDoc.qrCodeUrl ? `<img src="${signedDoc.qrCodeUrl}" alt="QR Code" />` : ""}
              <p>Verifique a autenticidade em: ${window.location.origin}/verificar/${signedDoc.accessCode}</p>
            </div>
          </div>
          
          <div class="footer">
            Documento gerado pelo CAIUS — Sistema de Atendimento ao Cidadão
          </div>
        </div>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleReset = () => {
    setFile(null);
    setFileBase64("");
    setFileUrl("");
    setUploadedS3Url("");
    setUploadedAttachmentId(null);
    setForm({ title: "", documentType: "external_pdf", issuingUnit: "", notes: "" });
    setStep("upload");
    setSignedDoc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <OmniLayout title="Assinar PDF Externo">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <PenLine className="w-6 h-6 text-blue-600" />
              Assinar PDF Externo
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Faça upload de um PDF, adicione sua assinatura eletrônica e emita a chancela de autenticidade
            </p>
          </div>
          {step !== "upload" && (
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <X className="w-4 h-4" />Novo Documento
            </Button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { key: "upload", label: "Upload", icon: Upload },
            { key: "form", label: "Dados", icon: FileText },
            { key: "sign", label: "Assinar", icon: PenLine },
            { key: "done", label: "Concluído", icon: CheckCircle2 },
          ].map((s, i, arr) => {
            const stepOrder = ["upload", "form", "sign", "done"];
            const currentIdx = stepOrder.indexOf(step);
            const thisIdx = stepOrder.indexOf(s.key);
            const isActive = s.key === step;
            const isDone = thisIdx < currentIdx;
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive ? "bg-blue-600 text-white" :
                  isDone ? "bg-green-100 text-green-700" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                  {s.label}
                </div>
                {i < arr.length - 1 && (
                  <div className={`h-px w-8 ${isDone ? "bg-green-300" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: Upload ── */}
        {step === "upload" && (
          <div
            className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) {
                const fakeEvent = { target: { files: [f] } } as any;
                handleFileChange(fakeEvent);
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Arraste o PDF aqui</h3>
            <p className="text-gray-500 text-sm mb-4">ou clique para selecionar o arquivo</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">
              <FileText className="w-4 h-4" />Selecionar PDF
            </div>
            <p className="text-xs text-gray-400 mt-4">Apenas arquivos PDF • Máximo 16 MB</p>
          </div>
        )}

        {/* ── STEP 2: Formulário ── */}
        {(step === "form" || step === "sign") && file && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview do PDF */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Visualização do PDF
                </h3>
                <Badge variant="outline" className="text-xs">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 h-[500px]">
                <iframe
                  src={fileUrl}
                  className="w-full h-full"
                  title="Visualização do PDF"
                />
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {file.name}
              </p>
            </div>

            {/* Formulário de dados */}
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Dados da Chancela
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título do Documento *
                  </label>
                  <Input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Ex: Contrato de Prestação de Serviços"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo do Documento *
                  </label>
                  <select
                    value={form.documentType}
                    onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="external_pdf">PDF Externo</option>
                    <option value="contract">Contrato</option>
                    <option value="decree">Decreto</option>
                    <option value="ordinance">Portaria</option>
                    <option value="resolution">Resolução</option>
                    <option value="memo">Memorando</option>
                    <option value="report">Relatório</option>
                    <option value="certificate">Certificado</option>
                    <option value="authorization">Autorização</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade Emissora *
                  </label>
                  <Input
                    value={form.issuingUnit}
                    onChange={e => setForm(f => ({ ...f, issuingUnit: e.target.value }))}
                    placeholder="Ex: Secretaria Municipal de Administração"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    placeholder="Observações adicionais sobre o documento..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Antes de assinar</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Verifique o conteúdo do PDF na visualização ao lado. Após a assinatura, 
                      a chancela será emitida e o documento ficará disponível para verificação pública.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleProceedToSign}
                disabled={uploadFile.isPending}
                className="w-full gap-2"
                size="lg"
              >
                {uploadFile.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Enviando arquivo...</>
                ) : (
                  <><PenLine className="w-4 h-4" />Prosseguir para Assinatura</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Concluído ── */}
        {step === "done" && signedDoc && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Documento Assinado!</h2>
              <p className="text-gray-500">
                A chancela foi emitida com sucesso. O documento pode ser verificado publicamente.
              </p>
            </div>

            {/* Chancela Visual */}
            <div className="border-2 border-blue-800 rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-800" />
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-widest">
                  Chancela de Autenticidade
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Título</p>
                  <p className="text-sm font-semibold text-gray-900">{signedDoc.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Código de Acesso</p>
                  <p className="text-sm font-bold text-blue-800 font-mono">{signedDoc.accessCode}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Data de Assinatura</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Tipo</p>
                  <p className="text-sm font-semibold text-gray-900">{signedDoc.documentType}</p>
                </div>
              </div>

              <div className="bg-white/60 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Hash SHA-256</p>
                <p className="text-xs font-mono text-gray-700 break-all">{signedDoc.hash}</p>
              </div>

              {signedDoc.qrCodeUrl && (
                <div className="flex items-center gap-4 bg-white/60 rounded-xl p-3">
                  <img src={signedDoc.qrCodeUrl} alt="QR Code" className="w-20 h-20 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Verificação Pública</p>
                    <p className="text-xs text-gray-500 break-all">
                      {window.location.origin}/verificar/{signedDoc.accessCode}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleDownload} className="flex-1 gap-2" size="lg">
                <Download className="w-4 h-4" />
                Download PDF com Chancela
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`/verificar/${signedDoc.accessCode}`, "_blank")}
                className="flex-1 gap-2"
              >
                <QrCode className="w-4 h-4" />
                Verificar Autenticidade
              </Button>
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <Upload className="w-4 h-4" />
                Novo Documento
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Dialog de Assinatura ── */}
      <Dialog open={showSignDialog} onOpenChange={open => { if (!open) setShowSignDialog(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Confirmar Assinatura Eletrônica
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm font-medium text-blue-800 mb-1">Documento a assinar:</p>
              <p className="text-sm text-blue-700 font-semibold">{form.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Assinatura
              </label>
              <select
                value={signForm.signatureType}
                onChange={e => setSignForm(f => ({ ...f, signatureType: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="institutional">Institucional</option>
                <option value="advanced">Avançada</option>
                <option value="qualified">Qualificada ICP-Brasil</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo / Função (opcional)
              </label>
              <Input
                value={signForm.role}
                onChange={e => setSignForm(f => ({ ...f, role: e.target.value }))}
                placeholder="Ex: Secretário Municipal de Administração"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirme sua identidade
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Digite seu primeiro nome em maiúsculas para confirmar a assinatura:
              </p>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={signForm.confirmName}
                  onChange={e => setSignForm(f => ({ ...f, confirmName: e.target.value.toUpperCase() }))}
                  placeholder={(user?.name ?? "").split(" ")[0].toUpperCase()}
                  className="pl-9 font-mono uppercase tracking-widest"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Esperado: <strong>{(user?.name ?? "").split(" ")[0].toUpperCase()}</strong>
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => setShowSignDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSign}
                disabled={issueChancela.isPending || signDoc.isPending}
                className="gap-2"
              >
                {(issueChancela.isPending || signDoc.isPending) ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Assinando...</>
                ) : (
                  <><PenLine className="w-4 h-4" />Assinar Documento</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </OmniLayout>
  );
}
