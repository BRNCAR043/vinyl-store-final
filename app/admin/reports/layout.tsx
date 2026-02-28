export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="[&+footer]:hidden">
      <style>{`footer { display: none !important; }`}</style>
      {children}
    </div>
  );
}
