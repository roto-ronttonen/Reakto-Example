export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  options?: SelectOption[];
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  value?: string;
  label?: string;
};

export default function Select({
  options,
  onChange,
  placeholder,
  value,
  label,
}: SelectProps) {
  return (
    <div className="select-wrapper">
      {label && <label>{label}</label>}
      <select value={value} onChange={onChange}>
        <option selected>{placeholder}</option>
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <style jsx>{`
        .select-wrapper {
          display: flex;
          flex-direction: column;
        }
        label {
          margin-bottom: 4px;
          display: flex;
        }
      `}</style>
    </div>
  );
}
