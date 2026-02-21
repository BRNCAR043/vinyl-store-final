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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setForm(initial);
  }, [initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // For price fields only allow numbers and dot
    let newVal: any = value;
    if (name === "price" || name === "salePrice") {
      newVal = value.replace(/[^0-9.]/g, "");
    }
    // Always store as string for controlled input
    setForm({ ...form, [name]: newVal });
    // clear error on change
    if (errors[name]) {
      const copy = { ...errors };
      delete copy[name];
      setErrors(copy);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    const newErrors = { ...errors };
    const requiredFields = [
      "albumName",
      "artist",
      "year",
      "condition",
      "genres",
      "price",
      "description",
    ];
    if (requiredFields.includes(name)) {
      if (!value || value.toString().trim() === "") {
        newErrors[name] = "Please complete this field";
      } else {
        delete newErrors[name];
      }
    }
    if (name === "price" && value && isNaN(Number(value))) {
      newErrors.price = "Price must be a number";
    }
    if (name === "salePrice" && value && isNaN(Number(value))) {
      newErrors.salePrice = "Sale price must be a number";
    }
    setErrors(newErrors);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setForm({ ...form, imageUrl: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // prevent double submit

    // Basic validation
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      "albumName",
      "artist",
      "year",
      "condition",
      "genres",
      "price",
      "description",
    ];
    requiredFields.forEach(f => {
      if (!form[f as keyof Vinyl] && form[f as keyof Vinyl] !== 0) {
        newErrors[f] = "Please complete this field";
      }
    });
    // image required
    if (!form.imageUrl && !imageFile) {
      newErrors.image = "Image is required";
    }
    // numeric checks
    if (form.price == null || String(form.price).trim() === "") {
      newErrors.price = newErrors.price || "Please complete this field";
    } else if (isNaN(Number(form.price))) {
      newErrors.price = "Price must be a number";
    }
    if (form.salePrice != null && String(form.salePrice).trim() !== "") {
      if (isNaN(Number(form.salePrice))) {
        newErrors.salePrice = "Sale price must be a number";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

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
      salePrice: form.salePrice != null && String(form.salePrice).trim() !== "" ? Number(form.salePrice as any) : null,
      imageUrl,
    };
    try {
      await Promise.resolve(onSubmit(submitForm as Vinyl));
    } catch (err) {
      setErrors({ submit: "Failed to save. Try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const genreOptions = ["Hard Rock", "Progressive Rock", "Blues Rock", "Alternative Rock", "Punk Rock", "Heavy Metal", "Indie Rock"];
  const conditionOptions = ["Mint", "Near Mint", "VG+", "VG", "Good", "Fair", "Poor"];
  return (
    <form onSubmit={handleSubmit} className="bg-[#f7efe6] rounded-lg shadow p-6 grid grid-cols-2 gap-4">
      <input id="albumName" name="albumName" value={form.albumName || ""} onChange={handleChange} onBlur={handleBlur} placeholder="Album Name" aria-invalid={!!errors.albumName} aria-describedby={errors.albumName ? 'albumName-error' : undefined} className={`p-2 rounded col-span-2 focus:outline-none focus:ring-2 transition ${errors.albumName ? 'border-red-600 focus:ring-red-200' : 'border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42] hover:ring-[#8a3b42]'} border`} />
      {errors.albumName && <p id="albumName-error" role="alert" className="text-red-600 text-sm col-span-2">{errors.albumName}</p>}
      <input id="artist" name="artist" value={form.artist || ""} onChange={handleChange} onBlur={handleBlur} placeholder="Artist" aria-invalid={!!errors.artist} aria-describedby={errors.artist ? 'artist-error' : undefined} className={`p-2 rounded col-span-2 focus:outline-none focus:ring-2 transition ${errors.artist ? 'border-red-600 focus:ring-red-200' : 'border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42] hover:ring-[#8a3b42]'} border`} />
      {errors.artist && <p id="artist-error" role="alert" className="text-red-600 text-sm col-span-2">{errors.artist}</p>}
      <input id="year" name="year" value={form.year || ""} onChange={handleChange} onBlur={handleBlur} placeholder="Year" aria-invalid={!!errors.year} aria-describedby={errors.year ? 'year-error' : undefined} className={`p-2 rounded focus:outline-none focus:ring-2 transition ${errors.year ? 'border-red-600 focus:ring-red-200' : 'border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42] hover:ring-[#8a3b42]'} border`} />
      {errors.year && <p id="year-error" role="alert" className="text-red-600 text-sm">{errors.year}</p>}
      <select id="condition" name="condition" value={form.condition || ""} onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errors.condition} aria-describedby={errors.condition ? 'condition-error' : undefined} className={`p-2 rounded focus:outline-none focus:ring-2 transition ${errors.condition ? 'border-red-600 focus:ring-red-200' : 'border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42] hover:ring-[#8a3b42]'} border`}>
        <option value="">Select Condition</option>
        {conditionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {errors.condition && <p id="condition-error" role="alert" className="text-red-600 text-sm">{errors.condition}</p>}
      <select id="genres" name="genres" value={form.genres || ""} onChange={handleChange} onBlur={handleBlur} aria-invalid={!!errors.genres} aria-describedby={errors.genres ? 'genres-error' : undefined} className={`p-2 rounded col-span-2 focus:outline-none focus:ring-2 transition ${errors.genres ? 'border-red-600 focus:ring-red-200' : 'border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42] hover:ring-[#8a3b42]'} border`}>
        <option value="">Select Genre</option>
        {genreOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {errors.genres && <p id="genres-error" role="alert" className="text-red-600 text-sm col-span-2">{errors.genres}</p>}
      <div>
        <input id="price" inputMode="numeric" name="price" value={form.price || ""} onChange={handleChange} onBlur={handleBlur} placeholder="Price (Rands)" aria-invalid={!!errors.price} aria-describedby={errors.price ? 'price-error' : undefined} className={`p-2 rounded focus:outline-none focus:ring-2 transition w-full ${errors.price ? 'border-red-600 focus:ring-red-200' : 'border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42] hover:ring-[#8a3b42]'} border`} />
        {errors.price && <p id="price-error" role="alert" className="text-red-600 text-sm mt-1">{errors.price}</p>}
      </div>
      <div>
        <input id="salePrice" inputMode="numeric" name="salePrice" value={form.salePrice || ""} onChange={handleChange} onBlur={handleBlur} placeholder="Sale Price (Rands)" aria-invalid={!!errors.salePrice} aria-describedby={errors.salePrice ? 'salePrice-error' : undefined} className={`p-2 rounded focus:outline-none focus:ring-2 transition w-full ${errors.salePrice ? 'border-red-600 focus:ring-red-200' : 'border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42] hover:ring-[#8a3b42]'} border`} />
        {errors.salePrice && <p id="salePrice-error" role="alert" className="text-red-600 text-sm mt-1">{errors.salePrice}</p>}
      </div>
      <textarea id="description" name="description" value={form.description || ""} onChange={handleChange} onBlur={handleBlur} placeholder="Description" aria-invalid={!!errors.description} aria-describedby={errors.description ? 'description-error' : undefined} className={`p-2 rounded col-span-2 focus:outline-none focus:ring-2 transition ${errors.description ? 'border-red-600 focus:ring-red-200' : 'border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42] hover:ring-[#8a3b42]'} border`} />
      {errors.description && <p id="description-error" role="alert" className="text-red-600 text-sm col-span-2">{errors.description}</p>}
      <div className="col-span-2 flex items-center gap-4">
        <input type="checkbox" name="onSale" checked={!!form.onSale} onChange={e => setForm({ ...form, onSale: e.target.checked })} />
        <label htmlFor="onSale">On Sale</label>
      </div>
      <div className="col-span-2">
        <label className="block mb-2">Image Upload</label>
        <input id="image" type="file" accept="image/*" onChange={handleImage} aria-invalid={!!errors.image} aria-describedby={errors.image ? 'image-error' : undefined} className={`p-2 rounded w-full focus:outline-none focus:ring-2 transition ${errors.image ? 'border-red-600 focus:ring-red-200' : 'border-gray-300 focus:border-[#8a3b42] focus:ring-[#8a3b42] hover:ring-[#8a3b42]'} border`} />
        {errors.image && <p id="image-error" role="alert" className="text-red-600 text-sm mt-1">{errors.image}</p>}
        {form.imageUrl && (
          <img src={form.imageUrl} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
        )}
      </div>
      <div className="col-span-2">
        {errors.submit && <p className="text-red-600 mb-2">{errors.submit}</p>}
        <button disabled={isSubmitting} type="submit" className={`w-full bg-[#8a3b42] text-white px-6 py-2 rounded font-semibold mt-4 ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-[#a94a56]"}`}>
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
