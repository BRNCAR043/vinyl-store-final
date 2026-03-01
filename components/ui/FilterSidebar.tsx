import React from "react";

type ExtrasState = { limited: boolean; autographed: boolean; onSale: boolean };

type FilterSidebarProps = {
  priceSort?: string;
  setPriceSort?: (v: string) => void;
  dateSort?: string;
  setDateSort?: (v: string) => void;
  genre?: string;
  setGenre?: (v: string) => void;
  condition?: string;
  setCondition?: (v: string) => void;
  artistQuery?: string;
  setArtistQuery?: (v: string) => void;
  extras?: ExtrasState;
  setExtras?: (e: ExtrasState) => void;
  genresList?: string[];
  conditionsList?: string[];
  artistsList?: string[];
};

export default function FilterSidebar(props: FilterSidebarProps = {}) {
  const {
    priceSort,
    setPriceSort,
    dateSort,
    setDateSort,
    genre,
    setGenre,
    condition,
    setCondition,
    artistQuery,
    setArtistQuery,
    extras,
    setExtras,
    genresList,
    conditionsList,
    artistsList,
  } = props;

  const onExtrasChange = (key: keyof ExtrasState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!setExtras || !extras) return;
    setExtras({ ...extras, [key]: e.target.checked });
  };

  return (
    <aside className="bg-[#f6efe6] text-[#8a3b42] p-5 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Price</label>
        <select value={priceSort ?? ""} onChange={(e) => setPriceSort?.(e.target.value)} className="w-full p-2 rounded bg-white text-[#8a3b42]">
          <option value="">Sort by price</option>
          <option value="low-high">Low to High</option>
          <option value="high-low">High to Low</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Release Date</label>
        <select value={dateSort ?? ""} onChange={(e) => setDateSort?.(e.target.value)} className="w-full p-2 rounded bg-white text-[#8a3b42]">
          <option value="">Sort by release date</option>
          <option value="new-old">Newest First</option>
          <option value="old-new">Oldest First</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Genre</label>
        <select value={genre ?? ""} onChange={(e) => setGenre?.(e.target.value)} className="w-full p-2 rounded bg-white text-[#8a3b42]">
          <option value="">All genres</option>
          {genresList?.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Condition</label>
        <select value={condition ?? ""} onChange={(e) => setCondition?.(e.target.value)} className="w-full p-2 rounded bg-white text-[#8a3b42]">
          <option value="">All conditions</option>
          {conditionsList?.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Artist</label>
        <input list="artist-list" value={artistQuery ?? ""} onChange={(e) => setArtistQuery?.(e.target.value)} type="text" placeholder="Artist name" className="w-full p-2 rounded bg-white text-[#8a3b42]" />
        <datalist id="artist-list">
          {artistsList?.map((a) => (
            <option key={a} value={a} />
          ))}
        </datalist>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Extras</label>
        <div className="flex flex-col gap-2">
          <label className="text-sm"><input checked={extras?.limited ?? false} onChange={onExtrasChange("limited")} type="checkbox" className="mr-2" /> Limited edition</label>
          <label className="text-sm"><input checked={extras?.autographed ?? false} onChange={onExtrasChange("autographed")} type="checkbox" className="mr-2" /> Autographed</label>
          <label className="text-sm"><input checked={extras?.onSale ?? false} onChange={onExtrasChange("onSale")} type="checkbox" className="mr-2" /> On sale</label>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => {
            setPriceSort?.("");
            setDateSort?.("");
            setGenre?.("");
            setCondition?.("");
            setArtistQuery?.("");
            if (setExtras) setExtras({ limited: false, autographed: false, onSale: false });
          }}
          className="w-full mt-2 px-4 py-2 bg-[#8a3b42] text-white rounded font-semibold hover:bg-[#a94a56]"
        >
          Clear Filters
        </button>
      </div>
    </aside>
  );
}
