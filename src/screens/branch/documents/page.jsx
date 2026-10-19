import { useCallback, useEffect, useState } from "react";
import { documentService } from "@/services/document-service";
import { customerService } from "@/services/customer-service";
import { policyService } from "@/services/policy-service";
import { claimService } from "@/services/claim-service";

const unwrapRows = (response) => Array.isArray(response?.data) ? response.data : [];

export const DocumentsPage = ({ onNavigate, user }) => {
  const [documents, setDocuments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [downloadingId, setDownloadingId] = useState("");
  const [activeDocument, setActiveDocument] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [type, setType] = useState("");
  const [association, setAssociation] = useState("policy");
  const [associationId, setAssociationId] = useState("");

  const canManageDocuments = user?.userType === "BRANCH";

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await documentService.getDocuments({ page: 1, limit: 100 });
      setDocuments(unwrapRows(response));
    } catch (error) {
      setErrorMessage(error.message || "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
    Promise.all([
      customerService.getCustomers({ page: 1, limit: 100 }),
      policyService.getPolicies({ page: 1, limit: 100 }),
      claimService.getClaims({ page: 1, limit: 100 }),
    ]).then(([customerResponse, policyResponse, claimResponse]) => {
      setCustomers(unwrapRows(customerResponse));
      setPolicies(unwrapRows(policyResponse));
      setClaims(unwrapRows(claimResponse));
    }).catch(() => {
      // Associations are only needed for the Branch upload form.
    });
  }, [loadDocuments]);

  const relatedRecords = association === "customer" ? customers : association === "claim" ? claims : policies;

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] || null;
    if (!selected) {
      setFile(null);
      return;
    }
    if (!["application/pdf", "image/jpeg", "image/png"].includes(selected.type)) {
      setErrorMessage("Choose a PDF, JPEG, or PNG file.");
      event.target.value = "";
      setFile(null);
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setErrorMessage("The file must be 5 MB or smaller.");
      event.target.value = "";
      setFile(null);
      return;
    }
    setErrorMessage("");
    setFile(selected);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file || !type.trim() || !associationId) {
      setErrorMessage("Choose a file, enter its type, and link it to a record.");
      return;
    }
    setUploading(true);
    setErrorMessage("");
    try {
      await documentService.uploadDocument({
        file,
        type: type.trim(),
        customerId: association === "customer" ? associationId : undefined,
        policyId: association === "policy" ? associationId : undefined,
        claimId: association === "claim" ? associationId : undefined,
      });
      setUploadOpen(false);
      setFile(null);
      setType("");
      setAssociationId("");
      await loadDocuments();
    } catch (error) {
      setErrorMessage(error.message || "Document upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document) => {
    setDownloadingId(document.id);
    setErrorMessage("");
    try {
      const content = await documentService.getDocumentContent(document.id);
      const objectUrl = URL.createObjectURL(content);
      const link = window.document.createElement("a");
      link.href = objectUrl;
      link.download = document.fileName || "document";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      setErrorMessage(error.message || "Could not download this document.");
    } finally {
      setDownloadingId("");
    }
  };

  const handleViewDetails = async (document) => {
    setActiveDocument({ ...document, loading: true });
    setDetailLoading(true);
    try {
      const response = await documentService.getDocumentById(document.id);
      setActiveDocument(response?.data ?? response);
    } catch (error) {
      setActiveDocument({ ...document, error: error.message || "Could not load document details." });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm("Delete this document?")) return;
    setDeletingId(documentId);
    setErrorMessage("");
    try {
      await documentService.deleteDocument(documentId);
      setDocuments((current) => current.filter((document) => document.id !== documentId));
    } catch (error) {
      setErrorMessage(error.message || "Document could not be deleted.");
    } finally {
      setDeletingId("");
    }
  };

  const recordLabel = (record) => {
    if (association === "customer") return record.name || "Customer";
    if (association === "policy") return record.policyNumber || "Policy";
    return record.claimNumber || "Claim";
  };

  return (
    <div className="px-4 py-5 lg:px-8 flex flex-col gap-4 w-full max-w-[1500px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-[#716d78] text-[11px] uppercase tracking-wider font-semibold">
            <button type="button" className="hover:text-[#302d36]" onClick={() => onNavigate("/branch/dashboard")}>Home</button>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#302d36] font-bold">Documents</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-bold text-[#302d36] tracking-tight">Documents</h1>
            <span className="bg-[#cadeff] text-[#061c35] text-xs px-2.5 py-0.5 rounded-full font-bold">{documents.length}</span>
          </div>
          <p className="text-xs text-[#716d78]">Documents linked to customers, policies, and claims.</p>
        </div>
        {canManageDocuments && (
          <button type="button" onClick={() => { setErrorMessage(""); setUploadOpen(true); }} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#7054a5] text-[#ffffff] hover:opacity-95 text-xs font-bold rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {errorMessage && <div role="alert" className="p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-sm">{errorMessage}</div>}

      <div className="bg-white rounded-xl border border-[#f0eef3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f6f8]/70 text-[#716d78] text-[11px] font-bold uppercase tracking-wider h-10 border-b border-[#f0eef3]">
                <th className="px-5 py-2">File name</th>
                <th className="px-5 py-2">File type</th>
                <th className="px-5 py-2">Linked records</th>
                <th className="px-5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eef3]">
              {loading ? (
                <tr><td colSpan={4} className="py-12 text-center text-[#827e89]">Loading documents...</td></tr>
              ) : documents.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-[#827e89]">No documents returned.</td></tr>
              ) : documents.map((document) => (
                <tr key={document.id} className="hover:bg-[#f7f6f8]/50 transition-colors h-14">
                  <td className="px-5 py-3 font-bold text-[#302d36] text-[13px]">{document.fileName || "—"}</td>
                  <td className="px-5 py-3 text-[#716d78]">{document.fileType || "—"}</td>
                  <td className="px-5 py-3 text-[#716d78]">
                    {[document.customerId && "Customer", document.policyId && "Policy", document.claimId && "Claim"].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => handleDownload(document)} disabled={downloadingId === document.id} className="px-2.5 py-1 rounded bg-[#f7f6f8] border border-[#e7e4eb] hover:bg-[#ebe5f4] text-[11px] font-bold text-[#302d36] disabled:opacity-50">
                        {downloadingId === document.id ? "Downloading..." : "Download"}
                      </button>
                      <button type="button" onClick={() => handleViewDetails(document)} className="px-2.5 py-1 rounded bg-white border border-[#e7e4eb] hover:bg-[#f7f6f8] text-[11px] font-bold text-[#302d36]">Details</button>
                      {canManageDocuments && (
                        <button type="button" onClick={() => handleDelete(document.id)} disabled={deletingId === document.id} className="p-1 rounded text-[#ba1a1a] hover:bg-[#ffdad6] disabled:opacity-50" title="Delete document" aria-label="Delete document">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2c35]/60 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="document-details-title" className="w-full max-w-lg rounded-xl border border-[#f0eef3] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="document-details-title" className="text-lg font-bold text-[#302d36]">Document details</h2>
              <button type="button" onClick={() => setActiveDocument(null)} className="rounded px-2 py-1 text-sm">Close</button>
            </div>
            {detailLoading || activeDocument.loading ? (
              <p className="py-6 text-center text-sm text-[#827e89]">Loading document details...</p>
            ) : activeDocument.error ? (
              <p role="alert" className="py-4 text-sm text-[#ba1a1a]">{activeDocument.error}</p>
            ) : (
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["File name", activeDocument.fileName],
                  ["File type", activeDocument.fileType],
                  ["Linked to", [activeDocument.customerId && "Customer", activeDocument.policyId && "Policy", activeDocument.claimId && "Claim"].filter(Boolean).join(", ") || null],
                ].filter(([, value]) => value != null).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-[#827e89]">{label}</dt>
                    <dd className="mt-1 font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        </div>
      )}

      {uploadOpen && canManageDocuments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2c35]/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl border border-[#f0eef3]">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0eef3]">
              <h2 className="text-base font-bold text-[#302d36]">Upload document</h2>
              <button type="button" onClick={() => setUploadOpen(false)} aria-label="Close upload form"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleUpload} className="flex flex-col gap-3 mt-4">
              {errorMessage && <div role="alert" className="p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-xs">{errorMessage}</div>}
              <label className="text-xs font-semibold">File (PDF, JPEG, or PNG; max 5 MB)
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} required className="block w-full mt-1 p-2 border border-[#e7e4eb] rounded-lg text-xs bg-[#f7f6f8]" />
              </label>
              <label className="text-xs font-semibold">Type
                <input value={type} onChange={(event) => setType(event.target.value)} required className="block w-full mt-1 h-9 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-xs" />
              </label>
              <label className="text-xs font-semibold">Link to
                <select value={association} onChange={(event) => { setAssociation(event.target.value); setAssociationId(""); }} className="block w-full mt-1 h-9 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-xs">
                  <option value="policy">Policy</option>
                  <option value="customer">Customer</option>
                  <option value="claim">Claim</option>
                </select>
              </label>
              <label className="text-xs font-semibold">Record
                <select value={associationId} onChange={(event) => setAssociationId(event.target.value)} required className="block w-full mt-1 h-9 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-xs">
                  <option value="">Select a record</option>
                  {relatedRecords.map((record) => <option key={record.id} value={record.id}>{recordLabel(record)}</option>)}
                </select>
              </label>
              <div className="mt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setUploadOpen(false)} className="px-3 py-1.5 rounded-lg bg-[#f7f6f8] text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={uploading} className="px-4 py-1.5 rounded-lg bg-[#7054a5] text-[#ffffff] text-xs font-bold disabled:opacity-50">{uploading ? "Uploading..." : "Upload"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
