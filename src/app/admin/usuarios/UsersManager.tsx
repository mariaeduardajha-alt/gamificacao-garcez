"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface U {
  id: string;
  name: string;
  email: string;
  sector: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export function UsersManager({ initial, currentUserId }: { initial: U[]; currentUserId: string }) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="val-btn-danger" onClick={() => setShowNew(true)}>
          + Recrutar agente
        </button>
      </div>

      {showNew && <NewUserForm onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); router.refresh(); }} />}

      <div className="val-card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-val-line/30">
              <Th>Nome</Th>
              <Th>Email</Th>
              <Th>Setor</Th>
              <Th>Role</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {initial.map((u) => (
              <UserRow key={u.id} user={u} currentUserId={currentUserId} onChanged={() => router.refresh()} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserRow({
  user,
  currentUserId,
  onChanged
}: {
  user: U;
  currentUserId: string;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const isSelf = user.id === currentUserId;

  if (editing) return <EditUserRow user={user} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); onChanged(); }} />;

  async function onDelete() {
    if (!confirm(`Remover ${user.name}? Esta ação não pode ser desfeita.`)) return;
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (res.ok) onChanged();
    else alert("Falha ao remover");
  }

  return (
    <tr className="border-b border-val-line/10 hover:bg-val-bgDark/40">
      <Td className="font-display uppercase tracking-wider2 text-val-cream">{user.name}</Td>
      <Td className="font-mono text-val-line text-xs">{user.email}</Td>
      <Td className="font-mono text-val-line text-xs">{user.sector || "—"}</Td>
      <Td>
        <span
          className={`font-display uppercase tracking-wider2 text-[10px] px-2 py-1 border ${
            user.role === "ADMIN"
              ? "text-val-red border-val-red/60"
              : "text-val-cyan border-val-cyan/40"
          }`}
        >
          {user.role}
        </span>
      </Td>
      <Td className="text-right">
        <button onClick={() => setEditing(true)} className="text-val-cream hover:text-val-red font-display uppercase tracking-wider2 text-xs mr-3">
          Editar
        </button>
        {!isSelf && (
          <button onClick={onDelete} className="text-val-red/70 hover:text-val-red font-display uppercase tracking-wider2 text-xs">
            Remover
          </button>
        )}
      </Td>
    </tr>
  );
}

function NewUserForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        sector: fd.get("sector"),
        role: fd.get("role"),
        password: fd.get("password")
      })
    });
    setLoading(false);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setErr(data?.error === "email_taken" ? "email já cadastrado" : data?.error || "falha");
      return;
    }
    onSaved();
  }

  return (
    <form onSubmit={submit} className="val-card space-y-4 border-val-red/50">
      <div className="flex items-center justify-between">
        <h3 className="val-heading text-lg">Recrutar novo agente</h3>
        <button type="button" onClick={onClose} className="text-val-line hover:text-val-red font-display uppercase text-xs">Fechar</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="val-label">Nome</label><input name="name" required className="val-input" /></div>
        <div><label className="val-label">Email</label><input name="email" type="email" required className="val-input" /></div>
        <div><label className="val-label">Setor</label><input name="sector" className="val-input" placeholder="Jurídico / Admin / etc" /></div>
        <div>
          <label className="val-label">Role</label>
          <select name="role" className="val-input">
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="val-label">Senha inicial (mín. 6)</label>
          <input name="password" type="text" required minLength={6} className="val-input" defaultValue={`movimento${Math.floor(Math.random()*9000+1000)}`} />
        </div>
      </div>
      {err && <div className="border border-val-red/50 bg-val-red/10 px-3 py-2 text-val-red font-mono text-xs uppercase">{err}</div>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="val-btn-outline">Cancelar</button>
        <button type="submit" disabled={loading} className="val-btn-danger">{loading ? "Salvando..." : "Confirmar recrutamento"}</button>
      </div>
    </form>
  );
}

function EditUserRow({ user, onClose, onSaved }: { user: U; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(user.name);
  const [sector, setSector] = useState(user.sector || "");
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, sector, role, password: password || undefined })
    });
    setLoading(false);
    if (res.ok) onSaved();
  }

  return (
    <tr className="border-b border-val-red/30 bg-val-bgDark">
      <Td><input value={name} onChange={(e) => setName(e.target.value)} className="val-input py-1 px-2 text-sm" /></Td>
      <Td className="font-mono text-val-line text-xs">{user.email}</Td>
      <Td><input value={sector} onChange={(e) => setSector(e.target.value)} className="val-input py-1 px-2 text-sm" /></Td>
      <Td>
        <select value={role} onChange={(e) => setRole(e.target.value as any)} className="val-input py-1 px-2 text-sm">
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </Td>
      <Td className="text-right space-y-1">
        <input
          type="text"
          placeholder="nova senha (opt)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="val-input py-1 px-2 text-xs w-40 mb-1"
        />
        <div>
          <button onClick={save} disabled={loading} className="text-val-cyan hover:text-val-cream font-display uppercase tracking-wider2 text-xs mr-3">
            {loading ? "..." : "Salvar"}
          </button>
          <button onClick={onClose} className="text-val-line hover:text-val-red font-display uppercase tracking-wider2 text-xs">
            Cancelar
          </button>
        </div>
      </Td>
    </tr>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left font-display uppercase tracking-wider2 text-xs text-val-line ${className || ""}`}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm align-top ${className || ""}`}>{children}</td>;
}
