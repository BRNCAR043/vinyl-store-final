"use client";
import React, { useEffect, useState } from "react";
import useCart from "../../lib/useCart";
import { getVinylById } from "../../lib/firestoreVinyls";
import type { Vinyl } from "../../types/vinyl";
import Link from "next/link";
import { useAuthContext } from "../../lib/AuthContext";
import { useAuthModal } from "../../components/ui/AuthModal";
import { useToast } from "../../components/ui/ToastProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { updateUserProfile } from "../../lib/userUtils";

export default function CheckoutPage() {
  const { items, update, remove } = useCart();
  const [lookup, setLookup] = useState<Record<string, Vinyl | null>>({});
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const ids = items.map((i) => i.vinylId);
      const entries = await Promise.all(ids.map((id) => getVinylById(id)));
      if (!mounted) return;
      const map: Record<string, Vinyl | null> = {};
      ids.forEach((id, idx) => (map[id] = entries[idx]));
      setLookup(map);
    }
    if (items.length > 0) load();
    return () => {
      mounted = false;
    };
  }, [items]);

  const subtotal = items.reduce((s, it) => {
    const v = lookup[it.vinylId];
    const price = v ? (v.onSale && v.salePrice ? v.salePrice : v.price) : 0;
    return s + price * it.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="flex-1 pt-6">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-4xl font-bold mb-6">Shopping Cart</h1>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center gap-6">
              {Array.from({ length: 4 }).map((_, i) => {
                const num = i + 1;
                const active = num === step;
                return (
                  <div key={num} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          active ? "bg-black" : "bg-[#f6efe6]"
                        } border border-gray-300`}
                        style={active ? { boxShadow: "inset 0 0 0 6px rgba(255,255,255,0.03)" } : {}}
                      >
                        {active ? (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#c9b89f]" />
                          </div>
                        ) : (
                          <div className="text-sm font-semibold text-[#5a1518]">{num}</div>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-300">
                        {num === 1 ? "Cart" : num === 2 ? "Checkout Details" : num === 3 ? "Payment" : "Confirmation"}
                      </div>
                    </div>
                    {num < 4 && <div className="flex-1 h-1 bg-gray-700/40" />}
                  </div>
                );
              })}
            </div>
          </div>

            {/* Two-column layout - step-aware */}
            {step === 1 ? (
            <div className="flex gap-8">
              {/* Left: cart items (larger) */}
              <section className="flex-1 bg-[#f6efe6] text-[#5a1518] p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Your items</h2>

                {items.length === 0 ? (
                  <div className="text-sm text-gray-600">Your cart is empty.</div>
                ) : (
                  <>
                    {/* Headings row */}
                    <div className="hidden sm:flex items-center gap-4 px-3 pb-2 mb-3 border-b border-[#e6dbcf] text-sm font-medium text-[#5a1518]">
                      <div className="w-28" />
                      <div className="flex-1 text-left">Item</div>
                      <div className="w-40 text-center">Quantity</div>
                      <div className="w-20 text-center">Price</div>
                      <div className="w-16 text-center">Total</div>
                      <div className="w-8" />
                    </div>

                    <ul className="space-y-4">
                      {items.map((it) => {
                        const v = lookup[it.vinylId];
                        const title = v ? v.albumName : `Record ${it.vinylId}`;
                        const artist = v ? v.artist : "Unknown";
                        const img = v ? v.imageUrl : undefined;
                        const price = v ? (v.onSale && v.salePrice ? v.salePrice : v.price) : 0;
                        return (
                          <li key={it.vinylId} className="flex items-center gap-4 bg-white/80 p-3 rounded">
                            <div className="w-28 h-28 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                              {img ? (
                                // @ts-ignore
                                <img src={img} alt={title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs">No image</div>
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="font-semibold text-lg">{title}</div>
                              <div className="text-sm text-gray-600">{artist}</div>
                            </div>

                            <div className="w-40 flex items-center justify-center gap-3">
                              <button onClick={() => update(it.vinylId, it.quantity - 1)} className="px-3 py-1 bg-[#8a3b42] text-white rounded hover:bg-[#7a3b3d] transition">-</button>
                              <div className="w-10 text-center">{it.quantity}</div>
                              <button onClick={() => update(it.vinylId, it.quantity + 1)} className="px-3 py-1 bg-[#8a3b42] text-white rounded hover:bg-[#7a3b3d] transition">+</button>
                            </div>

                            <div className="w-20 text-right">
                              <div className="text-sm">R {price.toFixed(2)}</div>
                            </div>
                            <div className="w-16 text-right">
                              <div className="text-sm font-semibold">R {(price * it.quantity).toFixed(2)}</div>
                            </div>

                            <button
                              onClick={() => remove(it.vinylId)}
                              aria-label={`Remove ${title}`}
                              className="p-2 text-[#5a1518] hover:text-white hover:bg-[#8a3b42]/90 rounded transition transform hover:scale-105"
                            >
                              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                <path d="M9 3a1 1 0 00-1 1v1H5a1 1 0 000 2h14a1 1 0 100-2h-3V4a1 1 0 00-1-1H9z" fill="#c0392b" opacity="0.0" />
                                <path d="M7 7v12a2 2 0 002 2h6a2 2 0 002-2V7H7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </section>

              {/* Right: summary/actions (smaller) */}
              <aside className="w-80 flex-shrink-0 bg-transparent">
                <div className="p-6 rounded-lg sticky top-28 bg-[#8a3b42] text-white">
                  <div className="mb-4">
                    <div className="text-sm text-[#f6efe6]">Subtotal</div>
                    <div className="text-xl font-bold">R {subtotal.toFixed(2)}</div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <Link href="/vinyl">
                      <button className="w-full px-4 py-3 rounded bg-[#f6efe6] text-[#5a1518] hover:bg-[#fff7ec] transition transform hover:scale-[1.02]">Back to shopping</button>
                    </Link>

                    <button
                      onClick={() => setStep(2)}
                      className="w-full px-4 py-3 rounded bg-[#a94a56] text-white hover:bg-[#c16167] transition transform hover:scale-[1.02]"
                    >
                      Proceed to checkout
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          ) : step === 2 ? (
            // Step 2: Checkout Details
            <div className="flex gap-8">
              <section className="flex-1 bg-[#f6efe6] text-[#5a1518] p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Delivery Details</h2>
                <DeliveryForm items={items} subtotal={subtotal} setStep={setStep} lookup={lookup} />
              </section>

              <aside className="w-80 flex-shrink-0 bg-transparent">
                <div className="p-6 rounded-lg sticky top-28 bg-[#8a3b42] text-white">
                  <div className="mb-4">
                    <div className="text-sm text-[#f6efe6]">Order Summary</div>
                    <div className="text-xl font-bold">R {subtotal.toFixed(2)}</div>
                    <div className="text-sm text-[#f6efe6] mt-2">{items.length} item(s)</div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <button onClick={() => setStep(1)} className="w-full px-4 py-3 rounded bg-[#f6efe6] text-[#5a1518] hover:bg-[#fff7ec] transition transform hover:scale-[1.02]">Back</button>
                    <PayNowButtons subtotal={subtotal} setStep={setStep} />
                  </div>
                </div>
              </aside>
            </div>
          ) : step === 3 ? (
            // Step 3: Payment
            <div className="flex gap-8">
              <section className="flex-1 bg-[#f6efe6] text-[#5a1518] p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Payment</h2>
                <PaymentForm items={items} subtotal={subtotal} setStep={setStep} lookup={lookup} />
              </section>

              <aside className="w-80 flex-shrink-0 bg-transparent">
                <div className="p-6 rounded-lg sticky top-28 bg-[#8a3b42] text-white">
                  <div className="mb-4">
                    <div className="text-sm text-[#f6efe6]">Order Summary</div>
                    <div className="text-xl font-bold">R {subtotal.toFixed(2)}</div>
                    <div className="text-sm text-[#f6efe6] mt-2">{items.length} item(s)</div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <button onClick={() => setStep(2)} className="w-full px-4 py-3 rounded bg-[#f6efe6] text-[#5a1518] hover:bg-[#fff7ec] transition transform hover:scale-[1.02]">Back</button>
                    <button onClick={() => {
                      try {
                        (window as any).dispatchEvent(new CustomEvent("checkout:pay"));
                      } catch (e) {}
                    }} className="w-full px-4 py-3 rounded bg-[#a94a56] text-white hover:bg-[#c16167] transition transform hover:scale-[1.02]">Pay</button>
                  </div>
                </div>
              </aside>
            </div>
          ) : step === 4 ? (
            // Step 4: Confirmation
            <div className="flex justify-center">
              <section className="relative w-full max-w-3xl bg-[#8a3b42] text-white p-12 rounded-lg text-center">
                  <ConfirmationFairyLights />
                  <div className="relative z-10">
                    <img src="/logo.png" alt="Rock Roll Records" className="mx-auto w-28 h-28 object-contain mb-6" />
                    <h2 className="text-2xl font-semibold mb-4">Thank you for shopping with Rock Roll Records</h2>
                    <p className="text-sm mb-3">Your order has been confirmed. We appreciate your purchase and hope you enjoy your music.</p>
                    <p className="text-sm">If you have any issues, please contact us at <span className="font-medium">+27 21 555 0123</span> or <span className="font-medium">support@rockrollrecords.example</span>.</p>
                  </div>
                </section>
            </div>
          ) : (
            // fallback / unknown
            <div className="text-center">Unknown step</div>
          )}
        </div>
      </main>
    </div>
  );
}

function ConfirmationFairyLights() {
  const bulbs = new Array(12).fill(null);
  return (
    <div aria-hidden className="absolute left-0 right-0 top-0 pointer-events-none confirm-fairy">
      <div className="max-w-3xl mx-auto px-6">
        <ul className="flex justify-between items-start">
          {bulbs.map((_, i) => (
            <li key={i} className={`flex flex-col items-center bulb-${i + 1}`}>
              <span className="bulb-dot" />
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .confirm-fairy { top: 8px; height: 0; z-index: 0; }
        .confirm-fairy ul { margin-top: 0; }
        .confirm-fairy li { list-style: none; }
        .bulb-dot {
          display: block;
          width: 0.6rem;
          height: 0.6rem;
          border-radius: 9999px;
          background: radial-gradient(circle at 35% 25%, #fff3b0, #ffd54d 40%, #f6b24a 70%);
          box-shadow: 0 0 8px rgba(255,220,120,0.95), 0 0 20px rgba(255,200,60,0.18);
          transform-origin: center;
          animation: cf-twinkle 3.2s ease-in-out infinite;
          margin-top: 0.6rem;
        }
        ul > li:nth-child(odd) .bulb-dot { animation-delay: 0.12s; }
        ul > li:nth-child(2n) .bulb-dot { animation-delay: 0.36s; }
        ul > li:nth-child(3n) .bulb-dot { animation-delay: 0.64s; }
        @keyframes cf-twinkle {
          0% { transform: translateY(0) scale(0.92); opacity: 0.7; filter: brightness(0.9); }
          40% { transform: translateY(6px) scale(1.18); opacity: 1; filter: brightness(1.2); }
          80% { transform: translateY(2px) scale(0.98); opacity: 0.85; filter: brightness(1); }
          100% { transform: translateY(0) scale(1); opacity: 0.9; }
        }
        @media (prefers-reduced-motion: reduce) { .bulb-dot { animation: none !important; } }
      `}</style>
    </div>
  );
}

// Simple shared in-file store so right-panel Pay button can access current form values
const checkoutState: { current: any } = { current: {} };

function PayNowButtons({ subtotal, setStep }: { subtotal: number; setStep: (n: number) => void }) {
  const { show } = useToast();

  function validate() {
    const v = checkoutState.current || {};
    const required = ["name", "phone", "street", "suburb", "city", "postalCode", "country"];
    const missing: string[] = [];
    for (const k of required) {
      const val = v[k];
      let filled = !(val === undefined || val === null || String(val).trim() === "");
      if (!filled) {
        // fallback: check input/textarea/select in DOM (handles late firestore autofill)
        try {
          const el = document.querySelector(`[name="${k}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
          if (el) {
            const ev = (el as any).value;
            if (ev !== undefined && ev !== null && String(ev).trim() !== "") filled = true;
          }
        } catch (e) {
          // ignore DOM errors
        }
      }
      if (!filled) missing.push(k);
    }
    return { ok: missing.length === 0, missing };
  }

  const handlePay = () => {
    const res = validate();
    if (!res.ok) {
      show("Please complete delivery details before proceeding to payment.", "error");
      // notify the delivery form to show inline errors
      try {
        (window as any).dispatchEvent(new CustomEvent("checkout:validation", { detail: res.missing }));
      } catch (e) {}
      return;
    }
    // Proceed to payment: advance to payment step
    try {
      setStep(3);
    } catch (e) {}
    show("All details present — proceeding to payment", "success");
  };

  return (
    <>
      <button onClick={handlePay} className="w-full px-4 py-3 rounded bg-[#a94a56] text-white hover:bg-[#c16167] transition transform hover:scale-[1.02]">Pay Now</button>
    </>
  );
}

function PaymentForm({ items, subtotal, setStep, lookup }: any) {
  const { show } = useToast();
  const [method, setMethod] = useState<string>("card");
  const [card, setCard] = useState({ owner: "", number: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setCardField = (k: string, v: string) => {
    setCard((c) => ({ ...c, [k]: v }));
    setErrors((e) => {
      const copy = { ...e };
      delete copy[k];
      return copy;
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (method === "card") {
      if (!card.owner.trim()) next.owner = "Enter cardholder name";
      if (!card.number.trim() || card.number.replace(/\s+/g, "").length < 12) next.number = "Enter a valid card number";
      if (!card.expiry.trim()) next.expiry = "Enter expiry date";
      if (!card.cvv.trim() || card.cvv.trim().length < 3) next.cvv = "Enter CVV";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePay = () => {
    if (!validate()) {
      show("Please complete payment fields.", "error");
      return;
    }
    show(`Would process ${method.toUpperCase()} payment (not implemented).`, "success");
  };

  // Listen for external pay requests (right-panel Pay button)
  useEffect(() => {
    function onPayEvent() {
      if (!validate()) {
        show("Please complete payment fields.", "error");
        return;
      }
      // In a real app we'd call payment API here. For now, advance to confirmation.
      show("Payment successful (simulated).", "success");
      try {
        setStep(4);
      } catch (e) {}
    }
    (window as any).addEventListener("checkout:pay", onPayEvent);
    return () => (window as any).removeEventListener("checkout:pay", onPayEvent);
  }, [method, card]);

  return (
    <div>
      <div className="space-y-4">
        <fieldset>
          <legend className="text-sm font-medium mb-2">Payment method</legend>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 p-3 rounded border border-gray-200">
              <input type="radio" name="pay-method" checked={method === "card"} onChange={() => setMethod("card")} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Credit / Debit card</div>
                  <div className="flex items-center gap-2">
                    <svg className="w-8 h-5" viewBox="0 0 48 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <rect width="48" height="24" rx="3" fill="#1a4fb6" />
                      <text x="24" y="16" fill="#fff" fontSize="10" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" textAnchor="middle">VISA</text>
                    </svg>
                    <svg className="w-8 h-5" viewBox="0 0 48 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <circle cx="18" cy="12" r="9" fill="#eb001b" />
                      <circle cx="30" cy="12" r="9" fill="#f79e1b" />
                    </svg>
                  </div>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded border border-gray-200">
              <input type="radio" name="pay-method" checked={method === "paypal"} onChange={() => setMethod("paypal")} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">PayPal</div>
                  <div className="text-sm font-semibold text-[#0a66c2]">PayPal</div>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded border border-gray-200">
              <input type="radio" name="pay-method" checked={method === "eft"} onChange={() => setMethod("eft")} />
              <div className="flex-1">
                <div className="font-medium">EFT / Bank transfer</div>
              </div>
            </label>
          </div>
        </fieldset>

        {method === "card" && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Name on card</label>
              <input value={card.owner} onChange={(e) => setCardField("owner", e.target.value)} className={`w-full p-3 rounded border ${errors.owner ? "border-red-600" : "border-gray-300"}`} placeholder="Cardholder name" />
              {errors.owner && <div className="text-sm text-red-600 mt-1">{errors.owner}</div>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Card number</label>
              <input value={card.number} onChange={(e) => setCardField("number", e.target.value)} className={`w-full p-3 rounded border ${errors.number ? "border-red-600" : "border-gray-300"}`} placeholder="1234 5678 9012 3456" />
              {errors.number && <div className="text-sm text-red-600 mt-1">{errors.number}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Expiry (MM/YY)</label>
              <input value={card.expiry} onChange={(e) => setCardField("expiry", e.target.value)} className={`w-full p-3 rounded border ${errors.expiry ? "border-red-600" : "border-gray-300"}`} placeholder="MM/YY" />
              {errors.expiry && <div className="text-sm text-red-600 mt-1">{errors.expiry}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">CVV</label>
              <input value={card.cvv} onChange={(e) => setCardField("cvv", e.target.value)} className={`w-full p-3 rounded border ${errors.cvv ? "border-red-600" : "border-gray-300"}`} placeholder="123" />
              {errors.cvv && <div className="text-sm text-red-600 mt-1">{errors.cvv}</div>}
            </div>
          </div>
        )}

        {/* Right-panel has the pay action; remove duplicate in-form Pay button */}
      </div>
    </div>
  );
}

function DeliveryForm({ items, subtotal, setStep, lookup }: any) {
  const { user } = useAuthContext();
  const { open: openAuthModal } = useAuthModal();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    suburb: "",
    city: "",
    postalCode: "",
    country: "",
    instructions: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // load saved address when user available
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) return;
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (!mounted) return;
        if (snap.exists()) {
          const data = snap.data() as any;
          if (data.address) {
            setForm((f) => ({ ...f, ...data.address }));
            checkoutState.current = { ...checkoutState.current, ...(data.address || {}) };
          }
        }
      } catch (e) {
        console.error("Failed to load user address", e);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  // keep checkoutState in sync
  useEffect(() => {
    checkoutState.current = { ...checkoutState.current, ...form };
  }, [form]);

  // Listen for validation requests from PayNowButtons
  useEffect(() => {
    function onValidation(e: Event) {
      const missing = (e as CustomEvent).detail as string[];
      if (!Array.isArray(missing)) return;
      const next: Record<string, string> = {};
      missing.forEach((m) => (next[m] = "Please complete this field"));
      setErrors((e) => ({ ...e, ...next }));
      // focus first missing field if present
      const first = missing[0];
      if (first) {
        const el = document.querySelector(`[name="${first}"]`) as HTMLElement | null;
        if (el && typeof el.focus === "function") el.focus();
      }
    }
    (window as any).addEventListener("checkout:validation", onValidation);
    return () => (window as any).removeEventListener("checkout:validation", onValidation);
  }, []);

  function setFieldError(field: string, message: string | null) {
    setErrors((e) => {
      const copy = { ...e };
      if (message) copy[field] = message;
      else delete copy[field];
      return copy;
    });
  }

  function validateField(field: string) {
    const v = (form as any)[field];
    if (!v || String(v).trim() === "") {
      setFieldError(field, "Please complete this field");
      return false;
    }
    setFieldError(field, null);
    return true;
  }

  const updateField = (k: string, v: string) => {
    setForm((s) => ({ ...s, [k]: v }));
    // clear error as user types
    setFieldError(k, null);
  };

  const handleSave = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    // validate before saving
    const required = ["name", "phone", "street", "suburb", "city", "postalCode", "country"];
    const missing = required.filter((k) => !form[k as keyof typeof form] || String(form[k as keyof typeof form]).trim() === "");
    if (missing.length > 0) {
      // show inline messages
      const next: Record<string, string> = {};
      missing.forEach((m) => (next[m] = "Please complete this field"));
      setErrors((e) => ({ ...e, ...next }));
      show && show("Please complete required fields before saving.", "error");
      return;
    }
    setLoading(true);
    try {
      await updateUserProfile(user.uid, { address: form });
      setSavedMsg("Address saved");
      setTimeout(() => setSavedMsg(null), 3000);
    } catch (e) {
      console.error(e);
      show("Failed to save address", "error");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const required = ["name", "phone", "street", "suburb", "city", "postalCode", "country"];
    const missing = required.filter((k) => !form[k as keyof typeof form] || String(form[k as keyof typeof form]).trim() === "");
    return missing;
  };

  const handlePay = () => {
    const missing = validate();
    if (missing.length > 0) {
      show("Please fill in all required fields before paying.", "error");
      return;
    }
    // advance to payment step
    try {
      setStep(3);
    } catch (e) {}
    show("Proceeding to payment", "success");
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Receiver's name</label>
            <input
              name="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              onBlur={() => validateField("name")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={`w-full p-3 rounded focus:outline-none focus:ring-2 transition border ${errors.name ? "border-red-600 focus:ring-red-200" : "border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42]"}`}
              placeholder="Enter receiver's name"
            />
            {errors.name && <div id="name-error" role="alert" className="text-sm text-red-600 mt-1">{errors.name}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Receiver's cellphone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              onBlur={() => validateField("phone")}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className={`w-full p-3 rounded focus:outline-none focus:ring-2 transition border ${errors.phone ? "border-red-600 focus:ring-red-200" : "border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42]"}`}
              placeholder="e.g. +27 82 000 0000"
            />
            {errors.phone && <div id="phone-error" role="alert" className="text-sm text-red-600 mt-1">{errors.phone}</div>}
          </div>
        </div>

          <div>
          <label className="block text-sm font-medium mb-1">Street address</label>
          <div className="relative">
            <input
              name="street"
              value={form.street}
              onChange={(e) => updateField("street", e.target.value)}
              onBlur={() => validateField("street")}
              aria-invalid={!!errors.street}
              aria-describedby={errors.street ? "street-error" : undefined}
              className={`w-full p-3 rounded pr-10 focus:outline-none focus:ring-2 transition border ${errors.street ? "border-red-600 focus:ring-red-200" : "border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42]"}`}
              placeholder="e.g. 8 Street Name, Suburb Name, City Name"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">📍</div>
          </div>
          {errors.street && <div id="street-error" role="alert" className="text-sm text-red-600 mt-1">{errors.street}</div>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Suburb</label>
            <input
              name="suburb"
              value={form.suburb}
              onChange={(e) => updateField("suburb", e.target.value)}
              onBlur={() => validateField("suburb")}
              aria-invalid={!!errors.suburb}
              aria-describedby={errors.suburb ? "suburb-error" : undefined}
              className={`w-full p-3 rounded focus:outline-none focus:ring-2 transition border ${errors.suburb ? "border-red-600 focus:ring-red-200" : "border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42]"}`}
            />
            {errors.suburb && <div id="suburb-error" role="alert" className="text-sm text-red-600 mt-1">{errors.suburb}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              name="city"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              onBlur={() => validateField("city")}
              aria-invalid={!!errors.city}
              aria-describedby={errors.city ? "city-error" : undefined}
              className={`w-full p-3 rounded focus:outline-none focus:ring-2 transition border ${errors.city ? "border-red-600 focus:ring-red-200" : "border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42]"}`}
            />
            {errors.city && <div id="city-error" role="alert" className="text-sm text-red-600 mt-1">{errors.city}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Postal code</label>
            <input
              name="postalCode"
              value={form.postalCode}
              onChange={(e) => updateField("postalCode", e.target.value)}
              onBlur={() => validateField("postalCode")}
              aria-invalid={!!errors.postalCode}
              aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
              className={`w-full p-3 rounded focus:outline-none focus:ring-2 transition border ${errors.postalCode ? "border-red-600 focus:ring-red-200" : "border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42]"}`}
            />
            {errors.postalCode && <div id="postalCode-error" role="alert" className="text-sm text-red-600 mt-1">{errors.postalCode}</div>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <input
            name="country"
            value={form.country}
            onChange={(e) => updateField("country", e.target.value)}
            onBlur={() => validateField("country")}
            aria-invalid={!!errors.country}
            aria-describedby={errors.country ? "country-error" : undefined}
            className={`w-full p-3 rounded focus:outline-none focus:ring-2 transition border ${errors.country ? "border-red-600 focus:ring-red-200" : "border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42]"}`}
          />
          {errors.country && <div id="country-error" role="alert" className="text-sm text-red-600 mt-1">{errors.country}</div>}
        </div>

        <div>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded bg-[#5a1518] text-white hover:bg-[#451014] transition">
            {loading ? "Saving…" : "Save address"}
          </button>
          {savedMsg && <span className="ml-3 text-sm text-green-400">{savedMsg}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Delivery instructions</label>
          <textarea value={form.instructions} onChange={(e) => updateField("instructions", e.target.value)} className="w-full p-3 rounded border border-gray-300" rows={3} />
        </div>

        {/* Right-panel has the pay action; remove duplicate in-form Pay Now button */}
      </div>
    </div>
  );
}
