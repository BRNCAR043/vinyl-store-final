export default function FilterSidebar() {
  return (
    <form className="space-y-6 bg-[#070606]/30 p-4 rounded-lg">
      <div>
        <label className="block text-sm font-semibold text-[#ffeede] mb-2">Price range</label>
        <input type="range" min={0} max={100} className="w-full" />
        <div className="text-xs text-gray-300 mt-1">UI only</div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#ffeede] mb-2">Genre</label>
        <div className="grid gap-2 text-sm text-gray-200">
          <label className="flex items-center gap-2"><input type="checkbox" /> Hard Rock</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> Progressive Rock</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> Blues Rock</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> Alternative Rock</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> Punk Rock</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> Heavy Metal</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> Indie Rock</label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#ffeede] mb-2">Artist</label>
        <input className="w-full rounded-md p-2 bg-[#0b0808] text-sm" placeholder="Artist name (UI only)" />
      </div>

      <button type="button" className="w-full mt-2 px-4 py-2 bg-gradient-to-b from-[#7b0017] to-[#3b000a] rounded-md text-sm font-semibold">
        Apply
      </button>
    </form>
  );
}
