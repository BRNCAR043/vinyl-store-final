"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthContext } from "../../lib/AuthContext";
import { updateUserProfile } from "../../lib/userUtils";
import { getWishlist, removeFromWishlist } from "../../lib/wishlist";
import { getVinylById } from "../../lib/firestoreVinyls";
import type { Vinyl } from "../../types/vinyl";

export default function AccountPage() {
  const { user } = useAuthContext();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") ?? "details";
  const [tab, setTab] = useState<string>(initialTab);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (!user) return;
    const parts = (user.displayName ?? "").split(" ");
    setFirstName(parts[0] ?? "");
    setLastName(parts.slice(1).join(" ") ?? "");
    setEmail(user.email ?? "");
    // address fields will be loaded later when orders placed; leave blank for now
  }, [user]);

  useEffect(() => {
    // respond to external query param changes
    setTab(initialTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab]);

  const initial = useMemo(() => {
    if (!user) return "U";
    return (user.displayName ?? user.email ?? "U").charAt(0).toUpperCase();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const profileData = {
        firstName: firstName || "",
        lastName: lastName || "",
        email: email || "",
        address: {
          street: street || "",
          city: city || "",
          country: country || "",
        },
        displayName: `${firstName} ${lastName}`.trim(),
      } as Record<string, any>;
      await updateUserProfile(user.uid, profileData);
      setEditing(false);
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex gap-6">
            <aside className="w-72 bg-[#8a3b42] rounded p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold">
                {initial}
              </div>
              <div>
                <div className="text-sm text-gray-200">Heya</div>
                <div className="font-semibold text-lg">{user?.displayName ?? "Guest"}</div>
              </div>
            </div>

            <hr className="my-4 border-t border-white/20" />

            <div className="space-y-2">
              <button
                onClick={() => setTab("details")}
                className={`w-full text-left px-3 py-2 rounded transition transform duration-150 ${tab === "details" ? "bg-black/30" : "hover:bg-black/20 hover:scale-105"}`}
              >
                Account details
              </button>
              <button
                onClick={() => setTab("orders")}
                className={`w-full text-left px-3 py-2 rounded transition transform duration-150 ${tab === "orders" ? "bg-black/30" : "hover:bg-black/20 hover:scale-105"}`}
              >
                My purchases
              </button>
              <button
                onClick={() => setTab("wishlist")}
                className={`w-full text-left px-3 py-2 rounded transition transform duration-150 ${tab === "wishlist" ? "bg-black/30" : "hover:bg-black/20 hover:scale-105"}`}
              >
                My wishlist
              </button>
            </div>
          </aside>

          <section className="flex-1 bg-[#f6efe6] rounded p-6 text-[#140b08]">
            {tab === "details" && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Account details</h2>

                <div className={`space-y-4 transition-shadow`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Name</label>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!editing}
                        className={`mt-1 w-full rounded px-3 py-2 border ${editing ? 'ring-2 ring-[#8a3b42] bg-white' : 'bg-white/50'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Surname</label>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!editing}
                        className={`mt-1 w-full rounded px-3 py-2 border ${editing ? 'ring-2 ring-[#8a3b42] bg-white' : 'bg-white/50'}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!editing}
                      className={`mt-1 w-full rounded px-3 py-2 border ${editing ? 'ring-2 ring-[#8a3b42] bg-white' : 'bg-white/50'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Address</label>
                    <input
                      placeholder="Street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      disabled={!editing}
                      className={`mt-1 w-full rounded px-3 py-2 border mb-2 ${editing ? 'ring-2 ring-[#8a3b42] bg-white' : 'bg-white/50'}`}
                    />
                    <input
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={!editing}
                      className={`mt-1 w-full rounded px-3 py-2 border mb-2 ${editing ? 'ring-2 ring-[#8a3b42] bg-white' : 'bg-white/50'}`}
                    />
                    <input
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      disabled={!editing}
                      className={`mt-1 w-full rounded px-3 py-2 border ${editing ? 'ring-2 ring-[#8a3b42] bg-white' : 'bg-white/50'}`}
                    />
                  </div>

                  <div className="flex gap-2">
                    {!editing ? (
                      <button onClick={() => setEditing(true)} className="px-4 py-2 bg-[#8a3b42] text-white rounded transition transform duration-150 hover:scale-105 hover:opacity-90">
                        Edit
                      </button>
                    ) : (
                      <>
                        <button onClick={saveProfile} disabled={saving} className="px-4 py-2 bg-[#5a1518] text-white rounded transition transform duration-150 hover:scale-105 hover:opacity-90">
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-300 rounded transition transform duration-150 hover:scale-105 hover:opacity-90">
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab === "orders" && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">My purchases</h2>
                <p className="text-sm">You have no purchases yet.</p>
              </div>
            )}

            {tab === "wishlist" && (
              <WishlistSection user={user} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function WishlistSection({ user }: { user: any }) {
  const [items, setItems] = useState<Vinyl[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) {
        if (mounted) setItems([]);
        return;
      }
      setLoading(true);
      try {
        const ids = await getWishlist(user.uid);
        const records = await Promise.all(ids.map((id) => getVinylById(id)));
        const filtered = records.filter((r): r is Vinyl => Boolean(r));
        if (mounted) setItems(filtered);
      } catch (err) {
        console.error("Failed to load wishlist", err);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();

    function onExternal() {
      load();
    }
    window?.addEventListener?.("wishlist-updated", onExternal as EventListener);

    return () => {
      mounted = false;
      window?.removeEventListener?.("wishlist-updated", onExternal as EventListener);
    };
  }, [user]);

  const handleRemove = async (id?: string) => {
    if (!user || !id) return;
    try {
      await removeFromWishlist(user.uid, id);
      setItems((prev) => (prev ? prev.filter((v) => v.id !== id) : []));
      window.dispatchEvent(new CustomEvent("wishlist-updated"));
    } catch (err) {
      console.error("Remove wishlist item failed", err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My wishlist</h2>
      {loading ? (
        <p className="text-sm">Loading wishlist...</p>
      ) : items && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((v) => (
            <div key={v.id} className="flex items-center bg-white/80 rounded p-3">
              <div className="w-16 h-16 rounded overflow-hidden bg-gray-200 flex items-center justify-center">
                {v.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.imageUrl} alt={v.albumName} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-sm text-gray-500">No image</div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="font-semibold">{v.albumName}</div>
                <div className="text-sm text-gray-700">{v.artist}</div>
              </div>
              <div>
                <button
                  onClick={() => handleRemove(v.id)}
                  className="px-4 py-2 bg-[#8a3b42] text-white rounded transition transform duration-150 hover:scale-105 hover:opacity-90"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm">Your wishlist is empty.</p>
      )}
    </div>
  );
}
