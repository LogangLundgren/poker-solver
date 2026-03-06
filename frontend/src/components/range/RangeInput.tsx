"use client";

interface RangeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RangeInput({ value, onChange }: RangeInputProps) {
  return (
    <div className="w-full">
      <label className="block text-sm text-gray-400 mb-1">Range Notation</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. JJ+,AKs,AQs"
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md
                   text-white text-sm placeholder-gray-500 focus:outline-none
                   focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
