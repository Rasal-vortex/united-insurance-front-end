import React, { useState, useEffect } from 'react';
import { CrmDocument, Customer, Policy, Claim } from '@/types/crm';
import { documentService } from '@/services/document-service';
import { customerService } from '@/services/customer-service';
import { policyService } from '@/services/policy-service';
import { claimService } from '@/services/claim-service';
import { formatDate } from '@/lib/utils';

interface DocumentsPageProps {
  onNavigate: (path: string) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onNavigate }) => {
  const [documents, setDocuments] = useState<CrmDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Associations for upload
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('Policy Schedule');
  const [assocType, setAssocType] = useState<'customer' | 'policy' | 'claim'>('policy');
  const [assocId, setAssocId] = useState('');

  const fetchDocs = () => {
    setLoading(true);
    documentService
      .getDocuments()
      .then((res) => setDocuments(res.data))
      .catch((err) => console.error('Failed to load documents:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocs();
    Promise.all([
      customerService.getCustomers({ limit: 50 }),
      policyService.getPolicies({ limit: 50 }),
      claimService.getClaims({ limit: 50 }),
    ]).then(([cRes, pRes, clRes]) => {
      setCustomers(cRes.data);
      setPolicies(pRes.data);
      setClaims(clRes.data);
      if (pRes.data.length > 0) setAssocId(pRes.data[0].id);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(f.type)) {
        setErrorMessage('Allowed file types: PDF, JPEG, PNG only');
        setSelectedFile(null);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setErrorMessage('Maximum file size exceeded (5 MB ceiling)');
        setSelectedFile(null);
        return;
      }
      setErrorMessage(null);
      setSelectedFile(f);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please choose a file to upload');
      return;
    }
    if (!assocId) {
      setErrorMessage('At least one associated record is required (Customer, Policy, or Claim)');
      return;
    }

    try {
      setUploading(true);
      await documentService.uploadDocument({
        file: selectedFile,
        type: docType,
        customerId: assocType === 'customer' ? assocId : undefined,
        policyId: assocType === 'policy' ? assocId : undefined,
        claimId: assocType === 'claim' ? assocId : undefined,
      });
      setUploadModalOpen(false);
      setSelectedFile(null);
      fetchDocs();
    } catch (err: any) {
      setErrorMessage(err.message || 'Document upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this stored document?')) {
      await documentService.deleteDocument(id);
      fetchDocs();
    }
  };

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-[#44474d] text-[11px] uppercase tracking-wider font-semibold">
            <span className="hover:text-[#0f1c2e] cursor-pointer" onClick={() => onNavigate('/branch/dashboard')}>
              Home
            </span>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#0f1c2e] font-bold">Documents</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-bold text-[#0f1c2e] tracking-tight">Institutional Document Vault</h1>
            <span className="bg-[#cadeff] text-[#061c35] text-xs px-2.5 py-0.5 rounded-full font-bold">
              {documents.length} Encrypted Files
            </span>
          </div>
          <p className="text-xs text-[#44474d]">
            Secure storage for policy contracts, vehicle appraisals, police reports, and photo attachments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setUploadModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#002c26] text-[#93f4e3] hover:opacity-95 text-xs font-bold rounded-lg shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          <span>+ Upload Document</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#e6eeff] shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eff3ff]/70 text-[#44474d] text-[11px] font-bold uppercase tracking-wider h-10 border-b border-[#e6eeff]">
                <th className="px-5 py-2">Document Name</th>
                <th className="px-5 py-2">Category</th>
                <th className="px-5 py-2">Format & Size</th>
                <th className="px-5 py-2">Uploaded At</th>
                <th className="px-5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6eeff]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#75777e]">
                    Loading document index...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#75777e]">
                    No documents uploaded yet.
                  </td>
                </tr>
              ) : (
                documents.map((d) => (
                  <tr key={d.id} className="hover:bg-[#eff3ff]/50 transition-colors h-14">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[#4d5f7b] text-xl">
                          {d.mimeType.includes('pdf') ? 'picture_as_pdf' : 'image'}
                        </span>
                        <span className="font-bold text-[#0f1c2e] text-[13px]">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="bg-[#eff3ff] border border-[#d6e3fc] px-2 py-0.5 rounded text-[11px] font-semibold text-[#0f1c2e]">
                        {d.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#44474d] tabular-nums">
                      {d.mimeType} ({(d.size / 1024).toFixed(0)} KB)
                    </td>
                    <td className="px-5 py-3 text-[#44474d]">{formatDate(d.uploadedAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={d.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-[#eff3ff] border border-[#d6e3fc] hover:bg-[#dde9ff] text-[11px] font-bold text-[#0f1c2e] inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                          <span>View Content</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className="p-1 rounded text-[#ba1a1a] hover:bg-[#ffdad6]"
                          title="Delete Document"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#021129]/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl border border-[#e6eeff]">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6eeff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#002c26]">upload_file</span>
                <h3 className="text-base font-bold text-[#0f1c2e]">Upload Document</h3>
              </div>
              <button onClick={() => setUploadModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-3 mt-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* File input */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Choose File (PDF, JPEG, PNG max 5MB) *</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="p-2 border border-[#d6e3fc] rounded-lg text-xs bg-[#eff3ff]"
                  required
                />
              </div>

              {/* Document Type */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Document Category *</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="h-9 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-xs"
                >
                  <option value="Policy Schedule">Policy Schedule</option>
                  <option value="Incident Report">Incident Report</option>
                  <option value="Appraisal Photos">Appraisal Photos</option>
                  <option value="ID Proof & Registration">ID Proof & Registration</option>
                  <option value="Medical Assessment">Medical Assessment</option>
                </select>
              </div>

              {/* Association Target */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Associate With *</label>
                <div className="grid grid-cols-3 gap-2 mb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAssocType('policy');
                      if (policies[0]) setAssocId(policies[0].id);
                    }}
                    className={`py-1 text-xs font-bold rounded-md ${assocType === 'policy' ? 'bg-[#002c26] text-[#93f4e3]' : 'bg-[#eff3ff] text-[#44474d]'}`}
                  >
                    Policy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssocType('claim');
                      if (claims[0]) setAssocId(claims[0].id);
                    }}
                    className={`py-1 text-xs font-bold rounded-md ${assocType === 'claim' ? 'bg-[#002c26] text-[#93f4e3]' : 'bg-[#eff3ff] text-[#44474d]'}`}
                  >
                    Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssocType('customer');
                      if (customers[0]) setAssocId(customers[0].id);
                    }}
                    className={`py-1 text-xs font-bold rounded-md ${assocType === 'customer' ? 'bg-[#002c26] text-[#93f4e3]' : 'bg-[#eff3ff] text-[#44474d]'}`}
                  >
                    Customer
                  </button>
                </div>

                <select
                  value={assocId}
                  onChange={(e) => setAssocId(e.target.value)}
                  className="h-9 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-xs"
                  required
                >
                  <option value="">Select Target Record</option>
                  {assocType === 'policy' &&
                    policies.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.policyNumber} — {p.product} ({p.customerName})
                      </option>
                    ))}
                  {assocType === 'claim' &&
                    claims.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.claimNumber} — {c.customerName}
                      </option>
                    ))}
                  {assocType === 'customer' &&
                    customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.customerNumber})
                      </option>
                    ))}
                </select>
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#eff3ff] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 rounded-lg bg-[#002c26] text-[#93f4e3] text-xs font-bold shadow-xs"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
