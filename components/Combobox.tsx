import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

type Option = {
  id: string;
  label: string;
};

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function Combobox({ options, value, onChange, placeholder = 'Select...', className = '' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.label === value || opt.id === value);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white hover:border-brand-amber cursor-pointer transition-colors"
      >
        <span className={selectedOption ? 'text-white truncate' : 'text-white/40 truncate'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#1A1C23] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 p-2 border-b border-white/5">
            <Search className="w-4 h-4 text-white/40" />
            <input 
              type="text" 
              autoFocus
              className="w-full bg-transparent text-white outline-none text-sm placeholder:text-white/30" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div 
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.label); // Sending label back to match the old free-text string logic
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-brand-amber/10 hover:text-brand-amber transition-colors ${selectedOption?.id === opt.id ? 'bg-brand-amber/5 text-brand-amber font-bold' : 'text-slate-300'}`}
                >
                  <span className="truncate">{opt.label}</span>
                  {selectedOption?.id === opt.id && <Check className="w-4 h-4 shrink-0" />}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-text-muted italic">No items found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
