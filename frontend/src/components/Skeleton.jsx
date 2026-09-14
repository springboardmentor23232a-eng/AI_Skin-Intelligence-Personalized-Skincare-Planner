function Skeleton({ height = "20px", width = "100%", borderRadius = "var(--radius-sm)", className = "" }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        height,
        width,
        borderRadius
      }}
    />
  );
}

export default Skeleton;
