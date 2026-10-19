import { useEffect, useState } from "react";
import { customerService } from "@/services/customer-service";
import { getInitials } from "@/lib/utils";
import { CreateCustomerDialog } from "@/components/dialogs/create-customer-dialog";

export const CustomersPage = ({ onNavigate, user }) => {
  const isBranch = user?.userType === "BRANCH";
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", gender: "", address: "", notes: "", status: "" });
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => { setLoading(true); setError(""); try { const response = await customerService.getCustomers({ search }); if (!Array.isArray(response?.data)) throw new Error("Invalid customers response."); setCustomers(response.data); } catch (err) { setError(err?.message || "Could not load customers."); } finally { setLoading(false); } };
  useEffect(() => { fetchCustomers(); }, [search]);
  const openEdit = async (customer) => { setEditing(customer); setEditError(""); try { const response = await customerService.getCustomerById(customer.id); const detail = response?.data ?? response; setEditForm(Object.fromEntries(Object.keys(editForm).map((key) => [key, detail[key] ?? ""]))); } catch (err) { setEditError(err?.message || "Could not load customer details."); } };
  const saveEdit = async (event) => { event.preventDefault(); if (!editForm.name.trim() || !editForm.phone.trim()) return setEditError("Name and phone are required."); setSaving(true); try { const payload = Object.fromEntries(Object.entries(editForm).map(([key, value]) => [key, value.trim()]).filter(([, value]) => value !== "")); const response = await customerService.updateCustomer(editing.id, payload); if (response?.success === false) throw new Error(response.message); setEditing(null); await fetchCustomers(); } catch (err) { setEditError(err?.message || "Could not update customer."); } finally { setSaving(false); } };
  const deleteCustomer = async (customer) => { if (!window.confirm(`Delete ${customer.name || "this customer"}?`)) return; try { await customerService.deleteCustomer(customer.id); await fetchCustomers(); } catch (err) { setError(err?.message || "Could not delete customer."); } };

  return <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 py-5 lg:px-8">
    <header className="flex items-end justify-between"><div><button type="button" onClick={() => onNavigate("/branch/dashboard")} className="text-xs">Home › Customers</button><h1 className="mt-1 text-2xl font-bold">Customers</h1><p className="text-xs text-[#716d78]">Manage customer contact information and records.</p></div><div className="flex gap-2">{isBranch && <button type="button" onClick={() => setCreateOpen(true)} className="rounded-lg bg-[#7054a5] px-4 py-2 text-xs font-bold text-[#ffffff]">+ Add Customer</button>}<button type="button" onClick={fetchCustomers} className="rounded-lg bg-[#7054a5] px-4 py-2 text-xs font-bold text-[#ffffff]">Refresh</button></div></header>
    <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or phone" className="w-full max-w-lg rounded-lg border bg-[#f7f6f8] px-3 py-2 text-xs" />
    {error && <div role="alert" className="rounded bg-[#fff4f2] p-3 text-sm text-[#93000a]">{error}</div>}
    <section className="overflow-hidden rounded-xl border bg-white"><table className="w-full text-left text-xs"><thead><tr className="border-b bg-[#f7f6f8]/70 text-[11px] font-bold uppercase"><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Address</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="5" className="py-10 text-center">Loading...</td></tr> : customers.length ? customers.map((customer) => <tr key={customer.id} className="border-b"><td className="px-5 py-3"><span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#cadeff] font-bold">{getInitials(customer.name)}</span>{customer.name || "—"}<div className="ml-10 text-[11px] text-[#827e89]">{customer.email || "No email registered"}</div></td><td className="px-5 py-3">{customer.phone || "—"}</td><td className="px-5 py-3">{customer.address || "—"}</td><td className="px-5 py-3">{customer.status || "—"}</td><td className="px-5 py-3 text-right">{isBranch && <><button type="button" onClick={() => openEdit(customer)} className="mr-1 rounded border px-2 py-1">Edit</button><button type="button" onClick={() => deleteCustomer(customer)} className="rounded border border-[#ffdad6] px-2 py-1 text-[#93000a]">Delete</button></>}</td></tr>) : <tr><td colSpan="5" className="py-10 text-center">No customers found.</td></tr>}</tbody></table></section>
    {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={saveEdit} className="w-full max-w-lg rounded-xl bg-white p-6"><h2 className="text-lg font-bold">Edit customer</h2>{editError && <p className="my-2 text-sm text-[#93000a]">{editError}</p>}{Object.keys(editForm).map((key) => <label key={key} className="mt-2 block text-xs font-semibold">{key}<input type="text" value={editForm[key]} onChange={(event) => setEditForm({ ...editForm, [key]: event.target.value })} className="mt-1 w-full rounded border px-2 py-1 text-sm" required={key === "name" || key === "phone"} /></label>)}<div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded border px-3 py-2 text-xs">Cancel</button><button disabled={saving} className="rounded bg-[#7054a5] px-3 py-2 text-xs font-bold text-[#ffffff]">{saving ? "Saving..." : "Save"}</button></div></form></div>}
    {isBranch && <CreateCustomerDialog isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={fetchCustomers} />}
  </div>;
};
