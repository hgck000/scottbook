export default function AppBootstrap() {
  return (
    <main className="app-bootstrap" aria-busy="true" aria-live="polite">
      <span className="app-bootstrap-mark" aria-hidden="true">
        读
      </span>
      <strong>ScottBook</strong>
      <span>Đang mở thư viện offline…</span>
    </main>
  );
}
