"use client";
// This page is a client component (runs in the browser).
// It manages user-visible state (forms, loading spinners, wishlist interactions)
// and uses browser-only APIs like event listeners and `window`.

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
// Firestore helpers used to read and write the user document
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
// Authentication context provides the logged-in `user` object
import { useAuthContext } from "../../lib/AuthContext";
// Helper functions for updating the user profile and managing wishlist/orders
import { updateUserProfile } from "../../lib/userUtils";
import { getWishlist, removeFromWishlist } from "../../lib/wishlist";
import { getVinylById } from "../../lib/firestoreVinyls";
import { fetchOrdersByUser } from "../../lib/orders";
import type { Vinyl } from "../../types/vinyl";

// Options shown in the gender dropdown. `as const` keeps them literal types.
const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"] as const;

// Shape of the profile object we're interested in; used for developer clarity.
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  country: string;
  age: number | "";
  gender: string;
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AccountContent />
    </Suspense>
  );
}

function AccountContent() {
  // `user` comes from the app-level auth context and can be null when not signed in.
  const { user } = useAuthContext();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") ?? "details";
  const [tab, setTab] = useState<string>(initialTab);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("");
  const [orders, setOrders] = useState<any[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // The component manages many small pieces of state (form inputs, loading flags,
  // success/error messages) so that the UI can show live previews and inline
  // validation while editing the user's profile.

  // Fetch user document from Firestore and prefill fields.
  // This effect runs when `user` changes. It reads the `users/{uid}` document
  // and populates local form state. If the document does not exist we create
  // a minimal one using auth information (so downstream code always has a doc).
  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }
    let mounted = true;
    async function loadProfile() {
      setProfileLoading(true);
      try {
        const ref = doc(db, "users", user!.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as Record<string, any>;
          if (mounted) {
            // When a field is missing in Firestore fall back to auth data or empty string.
            setFirstName(data.firstName ?? (user!.displayName ?? "").split(" ")[0] ?? "");
            setLastName(data.lastName ?? (user!.displayName ?? "").split(" ").slice(1).join(" ") ?? "");
            setEmail(data.email ?? user!.email ?? "");
            setStreet(data.address?.street ?? data.street ?? "");
            setCity(data.address?.city ?? data.city ?? "");
            setCountry(data.address?.country ?? data.country ?? "");
            setAge(typeof data.age === "number" ? data.age : "");
            setGender(data.gender ?? "");
          }
        } else {
          // Document doesn't exist — create it and use auth defaults
          const defaultData = {
            uid: user!.uid,
            email: user!.email ?? "",
            displayName: user!.displayName ?? "",
            createdAt: new Date().toISOString(),
            role: "user",
          };
          await setDoc(ref, defaultData);
          if (mounted) {
            // No user document existed: prefill fields from auth profile.
            const parts = (user!.displayName ?? "").split(" ");
            setFirstName(parts[0] ?? "");
            setLastName(parts.slice(1).join(" ") ?? "");
            setEmail(user!.email ?? "");
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        if (mounted) setErrorMsg("Failed to load profile data.");
      } finally {
        if (mounted) setProfileLoading(false);
      }
    }
    loadProfile();
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    // respond to external query param changes
    setTab(initialTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab]);

  // Load a user's orders. This effect calls `fetchOrdersByUser` and stores
  // the result in local state for the "My purchases" tab.
  useEffect(() => {
    let mounted = true;
    async function loadOrders() {
      if (!user) {
        if (mounted) setOrders([]);
        return;
      }
      setOrdersLoading(true);
      try {
        const recs = await fetchOrdersByUser(user.uid);
        if (!mounted) return;
        setOrders(recs);
      } catch (e) {
        console.error("Failed to load orders", e);
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setOrdersLoading(false);
      }
    }
    loadOrders();
    return () => {
      mounted = false;
    };
  }, [user]);

  const initial = useMemo(() => {
    if (!user) return "U";
    return (user.displayName ?? user.email ?? "U").charAt(0).toUpperCase();
  }, [user]);

  // Clear success messages after a short timeout so banners auto-dismiss.
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(""), 3000);
    return () => clearTimeout(t);
  }, [successMsg]);

  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(""), 5000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  // Persist editable profile fields back to Firestore (via helper).
  // Disables the form while saving and shows success/error banners.
  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const profileData: Record<string, any> = {
        firstName: firstName || "",
        lastName: lastName || "",
        email: email || "",
        address: {
          street: street || "",
          city: city || "",
          country: country || "",
        },
        gender: gender || "",
        displayName: `${firstName} ${lastName}`.trim(),
      };
      if (age !== "" && typeof age === "number") {
        profileData.age = age;
      } else {
        profileData.age = null;
      }
      await updateUserProfile(user.uid, profileData);
      setEditing(false);
      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to save profile", err);
      setErrorMsg("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Shared input styles used to toggle enabled/disabled appearance for fields.
  const inputBase =
    "mt-1 w-full rounded-lg px-3 py-2 border border-neutral-300 transition-all duration-150";
  const inputEnabled = `${inputBase} bg-white focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-[#800000]`;
  const inputDisabled = `${inputBase} bg-white/50 cursor-not-allowed`;

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar with profile avatar and tab buttons (details, orders, wishlist) */}
            <aside className="w-full md:w-72 bg-[#8a3b42] rounded p-4 md:p-6 text-white">
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

            <div className="flex md:flex-col gap-1 sm:gap-2 overflow-x-auto md:overflow-visible">
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

          {/* Main content area: switches between Account details, Orders, and Wishlist */}
          <section className="flex-1 bg-[#F5E6D3] rounded-2xl shadow-lg p-4 sm:p-8 text-[#140b08]">
            {tab === "details" && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Account details</h2>

                {/* Success / Error banners shown after actions (save, errors) */}
                {successMsg && (
                  <div className="mb-4 rounded-lg bg-green-100 border border-green-400 text-green-800 px-4 py-2 text-sm font-medium">
                    {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div className="mb-4 rounded-lg bg-red-100 border border-red-400 text-red-800 px-4 py-2 text-sm font-medium">
                    {errorMsg}
                  </div>
                )}

                {profileLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-[#800000]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="ml-3 text-sm text-gray-600">Loading profile...</span>
                  </div>
                ) : (
                <div className="space-y-4">
                  {/* Name fields: first / last name inputs. Inputs become editable when `editing` is true. */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Name</label>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!editing}
                        className={editing ? inputEnabled : inputDisabled}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Surname</label>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!editing}
                        className={editing ? inputEnabled : inputDisabled}
                      />
                    </div>
                  </div>

                  {/* Email (read-only) - users cannot change email here */}
                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                      value={email}
                      disabled
                      className={`${inputBase} bg-gray-100 cursor-not-allowed text-gray-500`}
                    />
                  </div>

                  {/* Demographic fields: age + gender selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Age</label>
                      <input
                        type="number"
                        min={1}
                        max={150}
                        placeholder="Enter your age"
                        value={age}
                        onChange={(e) => {
                          const v = e.target.value;
                          setAge(v === "" ? "" : Math.max(1, Math.min(150, Number(v))));
                        }}
                        disabled={!editing}
                        className={editing ? inputEnabled : inputDisabled}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        disabled={!editing}
                        className={editing ? inputEnabled : inputDisabled}
                      >
                        <option value="">Select gender</option>
                        {GENDER_OPTIONS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Country</label>
                    <input
                      placeholder="Enter your country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      disabled={!editing}
                      className={editing ? inputEnabled : inputDisabled}
                    />
                  </div>

                  {/* Address fields: street + city */}
                  <div>
                    <label className="block text-sm font-medium">Address</label>
                    <input
                      placeholder="Street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      disabled={!editing}
                      className={`${editing ? inputEnabled : inputDisabled} mb-2`}
                    />
                    <input
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={!editing}
                      className={editing ? inputEnabled : inputDisabled}
                    />
                  </div>

                  {/* Action buttons: Edit toggles edit mode. Save persists changes. */}
                  <div className="flex gap-3 pt-2">
                    {!editing ? (
                      <button
                        onClick={() => { setEditing(true); setSuccessMsg(""); setErrorMsg(""); }}
                        className="px-6 py-2 bg-[#800000] text-[#F5E6D3] font-medium rounded-lg transition-all duration-150 hover:bg-[#600000] hover:shadow-md"
                      >
                        Edit
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={saveProfile}
                          disabled={saving}
                          className="px-6 py-2 bg-[#800000] text-[#F5E6D3] font-medium rounded-lg transition-all duration-150 hover:bg-[#600000] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditing(false)}
                          className="px-6 py-2 bg-gray-300 text-gray-800 font-medium rounded-lg transition-all duration-150 hover:bg-gray-400 hover:shadow-md"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
                )}
              </div>
            )}

            {/* Orders tab: shows a simple list of past purchases with totals. */}
            {tab === "orders" && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">My purchases</h2>
                {ordersLoading ? (
                  <p className="text-sm">Loading purchases...</p>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((o) => {
                      const created = o.createdAt && typeof o.createdAt.toDate === "function" ? o.createdAt.toDate() : o.createdAt ? new Date(o.createdAt) : null;
                      const orderDate = created ? created.toLocaleDateString() : "-";
                      const expected = created ? new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000) : null;
                      const expectedStr = expected ? expected.toLocaleDateString() : "-";
                      const productCount = (o.items || []).reduce((s: number, it: any) => s + (it.quantity || 0), 0);
                      return (
                        <div key={o.id} className="flex items-center bg-white/80 rounded p-3">
                          <div className="flex-1">
                            <div className="font-semibold">Order #{o.id}</div>
                            <div className="text-sm text-gray-700">{productCount} product(s) • Ordered {orderDate}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">R {Number(o.total || 0).toFixed(2)}</div>
                            <div className="text-sm text-gray-600">Expected: {expectedStr}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm">You have no purchases yet.</p>
                )}
              </div>
            )}

            {/* Wishlist tab: separately rendered component below */}
            {tab === "wishlist" && (
              <WishlistSection user={user} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

// WishlistSection: loads vinyl items from the user's wishlist and renders them.
// - Reads wishlist item ids via `getWishlist` then maps them to vinyl records.
// - Listens for a custom `wishlist-updated` event so other parts of the app
//   can trigger a reload when the wishlist changes.
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
        // Get list of vinyl ids in the wishlist, then resolve full records.
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

    // Re-load when an external update occurs (other UI may dispatch this event).
    function onExternal() {
      load();
    }
    window?.addEventListener?.("wishlist-updated", onExternal as EventListener);

    return () => {
      mounted = false;
      window?.removeEventListener?.("wishlist-updated", onExternal as EventListener);
    };
  }, [user]);

  // Remove an item from the wishlist (updates remote and local state).
  const handleRemove = async (id?: string) => {
    if (!user || !id) return;
    try {
      await removeFromWishlist(user.uid, id);
      setItems((prev) => (prev ? prev.filter((v) => v.id !== id) : []));
      // Notify other parts of the app that the wishlist changed.
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
