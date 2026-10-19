import { useEffect, useState } from "react";
import { staffService } from "@/services/staff-service";
import { getAuthUser, getStoredSession } from "@/lib/auth";

const MOCK_BRANCH_NAMES = ["South Branch", "North Branch"];

export const StaffPage = ({ onNavigate, user }) => {
  const isBranch = user?.userType === "BRANCH";
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [editingStaff, setEditingStaff] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", designation: "", status: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", phone: "", email: "", designation: "", status: "ACTIVE" });
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await staffService.getStaff();
      if (!Array.isArray(response?.data)) {
        throw new Error("The staff response did not contain a data array.");
      }
      setStaff(response.data);
    } catch (err) {
      setError(err?.message || "Could not load staff.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = getAuthUser();
    const currentSession = getStoredSession();
    console.log("[StaffPage] Current Logged-in User Data:", currentUser);
    console.log("[StaffPage] Full Stored Auth Session:", currentSession);

    fetchStaff();
  }, []);

  const openStaffDetails = async (member) => {
    setSelectedStaff(member);
    setDetailLoading(true);
    setDetailError("");
    try {
      const response = await staffService.getStaffById(member.id);
      const detail = response?.data ?? response;
      if (response?.success === false) {
        throw new Error(response.message || "Could not load staff details.");
      }
      setSelectedStaff(detail);
    } catch (err) {
      setDetailError(err?.message || "Could not load staff details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const openStaffEdit = async (member) => {
    setEditingStaff(member);
    setEditLoading(true);
    setEditError("");
    try {
      const response = await staffService.getStaffById(member.id);
      if (response?.success === false) {
        throw new Error(response.message || "Could not load staff details.");
      }
      const detail = response?.data ?? response;
      setEditForm({
        name: detail.name ?? "",
        phone: detail.phone ?? "",
        email: detail.email ?? "",
        designation: detail.designation ?? "",
        status: detail.status ?? "",
      });
    } catch (err) {
      setEditError(err?.message || "Could not load staff details.");
    } finally {
      setEditLoading(false);
    }
  };

  const saveStaff = async (event) => {
    event.preventDefault();
    if (!editingStaff?.id) return;
    const input = {
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
      designation: editForm.designation.trim(),
      status: editForm.status.trim(),
    };
    if (!input.name || !input.designation || !input.status) {
      setEditError("Name, designation, and status are required.");
      return;
    }
    setSavingEdit(true);
    setEditError("");
    try {
      const response = await staffService.updateStaff(editingStaff.id, input);
      if (response?.success === false) {
        throw new Error(response.message || "Staff update failed.");
      }
      const updatedStaff = response?.data ?? response;
      setStaff((current) => current.map((member) =>
        member.id === editingStaff.id ? { ...member, ...input, ...updatedStaff } : member,
      ));
      setEditingStaff(null);
    } catch (err) {
      setEditError(err?.message || "Could not update staff.");
    } finally {
      setSavingEdit(false);
    }
  };

  const createStaff = async (event) => {
    event.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const input = Object.fromEntries(Object.entries(createForm).map(([key, value]) => [key, value.trim()]));
      if (!input.name || !input.phone) throw new Error("Name and phone are required.");
      const response = await staffService.createStaff(input);
      if (response?.success === false) throw new Error(response.message || "Staff creation failed.");
      setCreateOpen(false);
      setCreateForm({ name: "", phone: "", email: "", designation: "", status: "ACTIVE" });
      await fetchStaff();
    } catch (err) {
      setCreateError(err?.message || "Could not create staff.");
    } finally {
      setCreating(false);
    }
  };

  const deleteStaff = async (member) => {
    if (!member?.id || !window.confirm(`Delete ${member.name || "this staff member"}?`)) return;
    setDeletingId(member.id);
    setError("");
    try {
      const response = await staffService.deleteStaff(member.id);
      if (response?.success === false) throw new Error(response.message || "Staff deletion failed.");
      await fetchStaff();
    } catch (err) {
      setError(err?.message || "Could not delete staff.");
    } finally {
      setDeletingId(null);
    }
  };

  const query = searchTerm.trim().toLowerCase();
  const filteredStaff = staff.filter((member) =>
    [member.name, member.designation, member.status].some(
      (value) => typeof value === "string" && value.toLowerCase().includes(query),
    ),
  );

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 py-5 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#716d78]">
            <button type="button" onClick={() => onNavigate("/branch/dashboard")} className="hover:text-[#302d36]">Home</button>
            <span aria-hidden="true" className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="font-bold text-[#302d36]">Staff</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#302d36]">Staff</h1>
          <p className="mt-1 text-xs text-[#716d78]">Manage staff members in your branch.</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
        {isBranch && <button type="button" onClick={() => { setCreateError(""); setCreateOpen(true); }} className="inline-flex items-center gap-2 rounded-lg bg-[#7054a5] px-4 py-2 text-xs font-bold text-[#ffffff]">
          <span aria-hidden="true" className="material-symbols-outlined text-base">person_add</span>
          Add Staff
        </button>}
        <button type="button" onClick={fetchStaff} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-[#7054a5] px-4 py-2 text-xs font-bold text-[#ffffff] disabled:opacity-50">
          <span aria-hidden="true" className="material-symbols-outlined text-base">refresh</span>
          {loading ? "Loading..." : "Refresh"}
        </button></div>
      </header>

      <section className="rounded-xl border border-[#f0eef3] bg-white p-4 shadow-xs">
        <label htmlFor="staff-search" className="sr-only">Search staff</label>
        <input id="staff-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by name, designation, or status" className="w-full max-w-lg rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 py-2 text-xs text-[#302d36] placeholder:text-[#827e89] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7054a5]" />
      </section>

      {error && <div role="alert" className="rounded-lg border border-[#ffdad6] bg-[#fff4f2] p-4 text-sm text-[#93000a]">{error}</div>}

      <section aria-label="Staff directory" className="overflow-hidden rounded-xl border border-[#f0eef3] bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-[#f0eef3] px-5 py-4">
          <h2 className="text-sm font-bold text-[#302d36]">Staff directory</h2>
          {!loading && <span className="text-xs text-[#716d78]">{filteredStaff.length} shown</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="h-10 border-b border-[#f0eef3] bg-[#f7f6f8]/70 text-[11px] font-bold uppercase tracking-wider text-[#716d78]">
                <th scope="col" className="px-5 py-2">Name</th>
                <th scope="col" className="px-5 py-2">Designation</th>
                <th scope="col" className="px-5 py-2">Branch Name</th>
                <th scope="col" className="px-5 py-2">Status</th>
                <th scope="col" className="px-5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eef3] text-[#302d36]">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-[#827e89]">Loading staff...</td></tr>
              ) : filteredStaff.length ? filteredStaff.map((member, index) => (
                <tr key={member.id} className="h-14 hover:bg-[#f7f6f8]/50">
                  <td className="px-5 py-3 font-semibold">{member.name ?? "—"}</td>
                  <td className="px-5 py-3">{member.designation ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span>{member.branchName ?? MOCK_BRANCH_NAMES[index % MOCK_BRANCH_NAMES.length]}</span>
                    {!member.branchName && <span className="ml-2 rounded bg-[#f7f6f8] px-1.5 py-0.5 text-[10px] font-semibold text-[#6e6a75]">Sample</span>}
                  </td>
                  <td className="px-5 py-3">{member.status ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button type="button" onClick={() => openStaffDetails(member)} className="inline-flex items-center gap-1 rounded-md border border-[#e7e4eb] px-2.5 py-1.5 font-semibold text-[#292631] hover:bg-[#f7f6f8]">
                        <span aria-hidden="true" className="material-symbols-outlined text-sm">visibility</span>
                        View
                      </button>
                      {isBranch && <button type="button" onClick={() => openStaffEdit(member)} className="inline-flex items-center gap-1 rounded-md border border-[#e7e4eb] px-2.5 py-1.5 font-semibold text-[#292631] hover:bg-[#f7f6f8]">
                        <span aria-hidden="true" className="material-symbols-outlined text-sm">edit</span>
                        Edit
                      </button>}
                      {isBranch && <button type="button" onClick={() => deleteStaff(member)} disabled={deletingId === member.id} className="inline-flex items-center gap-1 rounded-md border border-[#ffdad6] px-2.5 py-1.5 font-semibold text-[#93000a] hover:bg-[#fff4f2] disabled:opacity-50">
                        <span aria-hidden="true" className="material-symbols-outlined text-sm">delete</span>
                        {deletingId === member.id ? "Deleting..." : "Delete"}
                      </button>}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="py-10 text-center text-[#827e89]">{error ? "Staff could not be loaded." : "No staff found."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292631]/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !detailLoading) setSelectedStaff(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="staff-detail-title" className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="staff-detail-title" className="text-lg font-bold text-[#302d36]">Staff details</h2>
              </div>
              <button type="button" onClick={() => setSelectedStaff(null)} disabled={detailLoading} aria-label="Close staff details" className="rounded p-1 text-[#6e6a75] hover:bg-[#f7f6f8] disabled:opacity-50">
                <span aria-hidden="true" className="material-symbols-outlined">close</span>
              </button>
            </div>
            {detailLoading ? <p className="py-4 text-sm text-[#827e89]">Loading staff details...</p> : (
              <>
                {detailError && <div role="alert" className="mb-4 rounded-lg border border-[#ffdad6] bg-[#fff4f2] p-3 text-sm text-[#93000a]">{detailError}</div>}
                <dl className="grid grid-cols-1 gap-4 text-sm">
                  <div><dt className="text-xs font-semibold text-[#6e6a75]">Name</dt><dd className="mt-1 text-[#302d36]">{selectedStaff.name ?? "—"}</dd></div>
                  <div><dt className="text-xs font-semibold text-[#6e6a75]">Designation</dt><dd className="mt-1 text-[#302d36]">{selectedStaff.designation ?? "—"}</dd></div>
                  <div><dt className="text-xs font-semibold text-[#6e6a75]">Status</dt><dd className="mt-1 text-[#302d36]">{selectedStaff.status ?? "—"}</dd></div>
                  <div><dt className="text-xs font-semibold text-[#6e6a75]">Phone</dt><dd className="mt-1 text-[#302d36]">{selectedStaff.phone ?? "—"}</dd></div>
                  <div><dt className="text-xs font-semibold text-[#6e6a75]">Email</dt><dd className="mt-1 text-[#302d36]">{selectedStaff.email ?? "—"}</dd></div>
                </dl>
              </>
            )}
          </section>
        </div>
      )}

      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292631]/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingEdit && !editLoading) setEditingStaff(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="edit-staff-title" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="edit-staff-title" className="text-lg font-bold text-[#302d36]">Edit staff member</h2>
                <p className="mt-1 text-xs text-[#6e6a75]">Update staff details</p>
              </div>
              <button type="button" onClick={() => setEditingStaff(null)} disabled={savingEdit || editLoading} aria-label="Close staff edit form" className="rounded p-1 text-[#6e6a75] hover:bg-[#f7f6f8] disabled:opacity-50">
                <span aria-hidden="true" className="material-symbols-outlined">close</span>
              </button>
            </div>
            {editLoading ? <p className="py-4 text-sm text-[#827e89]">Loading staff details...</p> : (
              <form onSubmit={saveStaff} className="flex flex-col gap-4">
                {editError && <div role="alert" className="rounded-lg border border-[#ffdad6] bg-[#fff4f2] p-3 text-sm text-[#93000a]">{editError}</div>}
                {[
                  ["name", "Name", "text"],
                  ["designation", "Designation", "text"],
                  ["phone", "Phone", "tel"],
                  ["email", "Email", "email"],
                  ["status", "Status", "text"],
                ].map(([key, label, type]) => (
                  <label key={key} className="flex flex-col gap-1 text-xs font-semibold text-[#302d36]">
                    {label}
                    <input type={type} value={editForm[key]} onChange={(event) => setEditForm((form) => ({ ...form, [key]: event.target.value }))} required={key === "name" || key === "designation" || key === "status"} className="rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 py-2 text-sm font-normal focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7054a5]" />
                  </label>
                ))}
                <div className="mt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setEditingStaff(null)} disabled={savingEdit} className="rounded-lg border border-[#e7e4eb] px-4 py-2 text-xs font-semibold text-[#292631] disabled:opacity-50">Cancel</button>
                  <button type="submit" disabled={savingEdit} className="rounded-lg bg-[#7054a5] px-4 py-2 text-xs font-bold text-[#ffffff] disabled:opacity-50">{savingEdit ? "Saving..." : "Save changes"}</button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292631]/50 p-4" role="presentation">
          <section role="dialog" aria-modal="true" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-[#302d36]">Add staff member</h2>
            <p className="mt-1 text-xs text-[#6e6a75]">Add a staff member to your branch.</p>
            <form onSubmit={createStaff} className="mt-5 flex flex-col gap-3">
              {createError && <div role="alert" className="rounded-lg bg-[#fff4f2] p-3 text-sm text-[#93000a]">{createError}</div>}
              {[['name','Name','text'],['phone','Phone','tel'],['email','Email','email'],['designation','Designation','text']].map(([key,label,type]) => <label key={key} className="flex flex-col gap-1 text-xs font-semibold">{label}<input type={type} value={createForm[key]} onChange={(event) => setCreateForm((form) => ({ ...form, [key]: event.target.value }))} className="rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 py-2 text-sm font-normal" required={key === 'name' || key === 'phone'} /></label>)}
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-[#e7e4eb] px-4 py-2 text-xs font-semibold">Cancel</button><button type="submit" disabled={creating} className="rounded-lg bg-[#7054a5] px-4 py-2 text-xs font-bold text-[#ffffff]">{creating ? 'Creating...' : 'Create staff'}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
