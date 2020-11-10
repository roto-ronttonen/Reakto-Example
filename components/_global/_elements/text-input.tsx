type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function TextInput({ label, ...props }: TextInputProps) {
  return (
    <div className="input-wrapper">
      {label && <label>{label}</label>}
      <input {...props} />
      <style jsx>{`
        .input-wrapper {
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
