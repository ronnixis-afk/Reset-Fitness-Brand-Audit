interface FloatingActionBarProps {
  children: React.ReactNode;
}

export function FloatingActionBar({ children }: FloatingActionBarProps) {
  return (
    <div className="floating-bar">
      <div className="floating-bar-content">
        {children}
      </div>
    </div>
  );
}
