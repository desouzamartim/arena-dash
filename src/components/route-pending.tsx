export function RoutePending() {
  return (
    <div className="routePendingOverlay" aria-live="polite" role="status">
      <div className="routePendingModal">
        <div className="routePendingBeacon" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <strong>Arena Dash</strong>
      </div>
    </div>
  );
}
