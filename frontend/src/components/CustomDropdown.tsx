import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomDropdownProps {
    value: string;
    options: { value: string; label: string }[];
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string; // Optional custom classes for the container
    btnClassName?: string; // Optional custom classes for the button
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    value,
    options,
    onChange,
    placeholder,
    className = "",
    btnClassName = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedLabel = options.find(o => o.value === value)?.label || placeholder || value;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative z-20 font-mono ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-black/50 border border-white/20 text-white px-4 py-3 text-sm uppercase focus:outline-none hover:border-white transition-colors text-left ${btnClassName}`}
            >
                <span className="truncate">{selectedLabel}</span>
                <span
                    className="material-symbols-outlined text-[1rem] opacity-70 transition-transform duration-300"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                    expand_more
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full left-0 mt-2 w-full bg-black/90 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden max-h-60 overflow-y-auto z-50 rounded-none custom-scrollbar origin-top"
                    >
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-3 text-sm uppercase transition-all duration-200 ${value === opt.value
                                        ? 'bg-white/20 text-white pl-6'
                                        : 'text-gray-400 hover:bg-white/10 hover:text-white hover:pl-6'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomDropdown;
