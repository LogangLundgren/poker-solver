"use client";

interface RangeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RangeInput({ value, onChange }: RangeInputProps) {
  return (
    <div className="w-full">
      <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1.5">Range Notation</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. JJ+,AKs,AQs"
        className="input-field"
      />
    </div>
  );
}
