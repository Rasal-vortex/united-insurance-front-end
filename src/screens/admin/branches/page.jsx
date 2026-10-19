import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { branchService } from "@/services/branch-service";
import { CreateBranchDialog } from "@/components/dialogs/create-branch-dialog";

export const BranchesPage = ({ onNavigate }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBranch, setEditingBranch] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", code: "", status: "" });
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchBranches = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient("/api/branches");
      const rows = response?.data;
      if (!Array.isArray(rows)) {
        throw new Error("The branches response did not contain a data array.");
      }
      setBranches(rows);
    } catch (err) {
      setError(err?.message || "Could not load branches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const query = searchTerm.trim().toLowerCase();
  const filteredBranches = branches.filter((branch) =>
    [branch.name, branch.code].some((value) =>
      typeof value === "string" && value.toLowerCase().includes(query),
    ),
  );

  const exportBranches = () => {
    const headers = ["name", "code", "status"];
    const rows = filteredBranches.map((branch) =>
      headers.map((key) => `"${String(branch[key] ?? "").replaceAll('"', '""')}"`).join(","),
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "branches.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const openEdit = (branch) => {
    setEditingBranch(branch);
    setEditForm({
      name: branch.name ?? "",
      code: branch.code ?? "",
      status: branch.status ?? "",
    });
    setEditError("");
  };

  const saveBranch = async (event) => {
    event.preventDefault();
    if (!editingBranch?.id) return;
    const input = {
      name: editForm.name.trim(),
      code: editForm.code.trim(),
      status: editForm.status.trim(),
    };
    if (!input.name || !input.code || !input.status) {
      setEditError("Name, code, and status are required.");
      return;
    }

    setSavingEdit(true);
    setEditError("");
    try {
      const response = await branchService.updateBranch(editingBranch.id, input);
      if (response?.success === false) {
        throw new Error(response.message || "Branch update failed.");
      }
      const updatedBranch = response?.data ?? response;
      setBranches((current) => current.map((branch) =>
        branch.id === editingBranch.id ? { ...branch, ...updatedBranch } : branch,
      ));
      setEditingBranch(null);
    } catch (err) {
      setEditError(err?.message || "Could not update branch.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 py-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#716d78]">
            <button type="button" onClick={() => onNavigate("/admin/reports")} className="hover:text-[#302d36]">Administration</button>
            <span aria-hidden="true" className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-bold text-[#302d36]">Branches</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2f2c35] lg:text-3xl">Branches</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setCreateDialogOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#7054a5] px-4 py-2.5 text-xs font-bold text-[#ffffff] hover:opacity-90">
            <span aria-hidden="true" className="material-symbols-outlined text-base">add</span>
            Add Branch
          </button>
          <button type="button" onClick={fetchBranches} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg bg-[#7054a5] px-4 py-2.5 text-xs font-bold text-[#ffffff] disabled:opacity-50">
            <span aria-hidden="true" className="material-symbols-outlined text-base">refresh</span>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </header>

      <section className="rounded-xl border border-[#f0eef3] bg-white p-4 shadow-xs">
        <label htmlFor="branch-search" className="sr-only">Search branches by name or code</label>
        <div className="relative flex max-w-lg items-center">
          <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute left-3 text-lg text-[#827e89]">search</span>
          <input id="branch-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by branch name or code" className="w-full rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] py-2 pl-9 pr-4 text-xs text-[#302d36] placeholder:text-[#827e89] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7054a5]" />
        </div>
      </section>

      {error && <div role="alert" className="rounded-lg border border-[#ffdad6] bg-[#fff4f2] p-4 text-sm text-[#93000a]">{error}</div>}

      <section aria-label="Branches" className="overflow-hidden rounded-xl border border-[#f0eef3] bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-[#f0eef3] px-5 py-4">
          <h2 className="text-sm font-bold text-[#302d36]">Branch directory</h2>
          {!loading && <span className="text-xs text-[#716d78]">{filteredBranches.length} shown</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="h-10 border-b border-[#f0eef3] bg-[#f7f6f8]/70 text-[11px] font-bold uppercase tracking-wider text-[#716d78]">
                <th scope="col" className="px-5 py-2">Branch Name</th>
                <th scope="col" className="px-5 py-2">Code</th>
                <th scope="col" className="px-5 py-2">Status</th>
                <th scope="col" className="px-5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eef3] text-[#302d36]">
              {loading ? (
                <tr><td colSpan={4} className="py-10 text-center text-[#827e89]">Loading branches...</td></tr>
              ) : filteredBranches.length ? filteredBranches.map((branch) => (
                <tr key={branch.id} className="h-14 hover:bg-[#f7f6f8]/50">
                  <td className="px-5 py-3 font-semibold">{branch.name ?? "—"}</td>
                  <td className="px-5 py-3 font-mono">{branch.code ?? "—"}</td>
                  <td className="px-5 py-3">{branch.status ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <button type="button" onClick={() => openEdit(branch)} className="inline-flex items-center gap-1 rounded-md border border-[#e7e4eb] px-2.5 py-1.5 font-semibold text-[#292631] hover:bg-[#f7f6f8]">
                      <span aria-hidden="true" className="material-symbols-outlined text-sm">edit</span>
                      Edit
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="py-10 text-center text-[#827e89]">{error ? "Branches could not be loaded." : "No branches found."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292631]/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingEdit) setEditingBranch(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="edit-branch-title" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="edit-branch-title" className="text-lg font-bold text-[#302d36]">Edit branch</h2>
                <p className="mt-1 text-xs text-[#6e6a75]">Update branch details</p>
              </div>
              <button type="button" onClick={() => setEditingBranch(null)} disabled={savingEdit} aria-label="Close edit form" className="rounded p-1 text-[#6e6a75] hover:bg-[#f7f6f8] disabled:opacity-50">
                <span aria-hidden="true" className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={saveBranch} className="flex flex-col gap-4">
              {editError && <div role="alert" className="rounded-lg border border-[#ffdad6] bg-[#fff4f2] p-3 text-sm text-[#93000a]">{editError}</div>}
              <label className="flex flex-col gap-1 text-xs font-semibold text-[#302d36]">
                Name
                <input autoFocus value={editForm.name} onChange={(event) => setEditForm((form) => ({ ...form, name: event.target.value }))} className="rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 py-2 text-sm font-normal focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7054a5]" required />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-[#302d36]">
                Code
                <input value={editForm.code} onChange={(event) => setEditForm((form) => ({ ...form, code: event.target.value }))} className="rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 py-2 font-mono text-sm font-normal focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7054a5]" required />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-[#302d36]">
                Status
                <input value={editForm.status} onChange={(event) => setEditForm((form) => ({ ...form, status: event.target.value }))} className="rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 py-2 text-sm font-normal focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7054a5]" required />
              </label>
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingBranch(null)} disabled={savingEdit} className="rounded-lg border border-[#e7e4eb] px-4 py-2 text-xs font-semibold text-[#292631] disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={savingEdit} className="rounded-lg bg-[#7054a5] px-4 py-2 text-xs font-bold text-[#ffffff] disabled:opacity-50">{savingEdit ? "Saving..." : "Save changes"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      <CreateBranchDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={fetchBranches}
      />
    </div>
  );
};
