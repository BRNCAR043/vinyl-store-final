// components/layout/Footer.tsx
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#8a3b42] text-[#f7efe6] pt-15 pb-4">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="font-bold mb-3">Shopping & Order</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="hover:underline">Delivery & Tracking</a></li>
              <li><a href="#" className="hover:underline">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:underline">Find a Store</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Customer Care</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="hover:underline">Contact Us</a></li>
              <li><a href="#" className="hover:underline">Gift Cards</a></li>
              <li><a href="#" className="hover:underline">Vinyl Club</a></li>
              <li><a href="#" className="hover:underline">Product Recall</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">About Us</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="hover:underline">Our Story</a></li>
              <li><a href="#" className="hover:underline">Careers</a></li>
              <li><a href="#" className="hover:underline">Charity</a></li>
              <li><a href="#" className="hover:underline">Press</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-t border-[#a97c50] pt-4 gap-4">
          <div className="flex items-center gap-4 text-sm">
            <span>We accept</span>
            <span className="inline-flex gap-2">
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><rect width="32" height="20" rx="3" fill="#fff"/><text x="7" y="15" fontSize="10" fill="#222">VISA</text></svg>
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><rect width="32" height="20" rx="3" fill="#fff"/><circle cx="11" cy="10" r="6" fill="#222"/><circle cx="21" cy="10" r="6" fill="#fff"/><circle cx="21" cy="10" r="5" fill="#222"/></svg>
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><rect width="32" height="20" rx="3" fill="#fff"/><rect x="8" y="6" width="16" height="8" rx="2" fill="#222"/></svg>
            </span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between text-xs text-[#e5d3c6] mt-6 gap-2">
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Accessibility</a>
            <a href="#" className="hover:underline">Terms & Conditions</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
          </div>
          <div className="text-right">&copy; {new Date().getFullYear()} Vinyl Store</div>
        </div>
      </div>
    </footer>
  );
}
