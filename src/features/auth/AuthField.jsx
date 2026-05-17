export function AuthField({ label, name, value, onChange, type = "text", ...inputProps }) {
  return (
    <label className="field auth-field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...inputProps}
      />
    </label>
  );
}
