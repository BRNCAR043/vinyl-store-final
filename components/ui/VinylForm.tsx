// components/ui/VinylForm.tsx
"use client";
import React, { useState } from "react";
import { storage } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Vinyl } from "../../types/vinyl";

interface VinylFormProps {
  initial?: Partial<Vinyl>;
  onSubmit: (vinyl: Vinyl) => void;
  submitLabel?: string;
}

export default function VinylForm({ initial = {}, onSubmit, submitLabel = "Save" }: VinylFormProps) {
  const [form, setForm] = useState<Partial<Vinyl>>(initial);
  const [imageFile, setImageFile] = useState<File | null>(null);

  React.useEffect(() => {
    setForm(initial);
  }, [initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Always store as string for controlled input
    setForm({ ...form, [name]: value });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setForm({ ...form, imageUrl: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = form.imageUrl;
    if (imageFile) {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `vinyls/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }
    // Convert price and salePrice to numbers before submit
    const submitForm = {
      ...form,
      price: form.price !== undefined ? Number(form.price) : 0,
      salePrice: form.salePrice !== undefined && form.salePrice !== "" ? Number(form.salePrice) : null,
      imageUrl,
    };
    onSubmit(submitForm as Vinyl);
  };

  const genreOptions = ["Rock", "Pop", "Jazz", "Hip-Hop", "Classical", "Electronic", "Soul", "Folk", "Other"];
  const conditionOptions = ["Mint", "Near Mint", "VG+", "VG", "Good", "Fair", "Poor"];
  return (
    <form onSubmit={handleSubmit} className="bg-[#f7efe6] rounded-lg shadow p-6 grid grid-cols-2 gap-4">
      <input name="albumName" value={form.albumName || ""} onChange={handleChange} placeholder="Album Name" className="border p-2 rounded col-span-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 hover:ring-2 hover:ring-emerald-800 transition" />
      <input name="artist" value={form.artist || ""} onChange={handleChange} placeholder="Artist" className="border p-2 rounded col-span-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 hover:ring-2 hover:ring-emerald-800 transition" />
      <input name="year" value={form.year || ""} onChange={handleChange} placeholder="Year" className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-800 hover:ring-2 hover:ring-emerald-800 transition" />
      <select name="condition" value={form.condition || ""} onChange={handleChange} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-800 hover:ring-2 hover:ring-emerald-800 transition">
        <option value="">Select Condition</option>
        {conditionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <select name="genres" value={form.genres || ""} onChange={handleChange} className="border p-2 rounded col-span-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 hover:ring-2 hover:ring-emerald-800 transition">
        <option value="">Select Genre</option>
        {genreOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <input name="price" value={form.price || ""} onChange={handleChange} placeholder="Price (Rands)" className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-800 hover:ring-2 hover:ring-emerald-800 transition" />
      <input name="salePrice" value={form.salePrice || ""} onChange={handleChange} placeholder="Sale Price (Rands)" className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-800 hover:ring-2 hover:ring-emerald-800 transition" />
      <textarea name="description" value={form.description || ""} onChange={handleChange} placeholder="Description" className="border p-2 rounded col-span-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 hover:ring-2 hover:ring-emerald-800 transition" />
      <div className="col-span-2 flex items-center gap-4">
        <input type="checkbox" name="onSale" checked={!!form.onSale} onChange={e => setForm({ ...form, onSale: e.target.checked })} />
        <label htmlFor="onSale">On Sale</label>
      </div>
      <div className="col-span-2">
        <label className="block mb-2">Image Upload</label>
        <input type="file" accept="image/*" onChange={handleImage} className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-emerald-800 hover:ring-2 hover:ring-emerald-800 transition" />
        {form.imageUrl && (
          <img src={form.imageUrl} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
        )}
      </div>
      <button type="submit" className="col-span-2 bg-[#8a3b42] text-white px-6 py-2 rounded font-semibold hover:bg-[#a94a56] mt-4">{submitLabel}</button>
    </form>
  );
}
