export function LoadingState({ title = "Đang tải dữ liệu...", description = "Vui lòng chờ trong giây lát." }) {
  return (
    <div className="ui-state ui-state-loading">
      <span className="ui-spinner" aria-hidden="true" />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function EmptyState({
  title = "Chưa có dữ liệu",
  description = "Nội dung sẽ hiển thị khi có dữ liệu phù hợp.",
  action,
}) {
  return (
    <div className="ui-state">
      <span className="ui-state-icon">0</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({ title = "Đã có lỗi xảy ra", description, action }) {
  return (
    <div className="ui-state ui-state-error">
      <span className="ui-state-icon">!</span>
      <h3>{title}</h3>
      <p>{description || "Không thể tải dữ liệu. Hãy thử lại sau."}</p>
      {action}
    </div>
  );
}

export function SuccessState({ title = "Thanh cong", description, action }) {
  return (
    <div className="ui-state ui-state-success">
      <span className="ui-state-icon">OK</span>
      <h3>{title}</h3>
      <p>{description || "Tác vụ đã được xử lý thành công."}</p>
      {action}
    </div>
  );
}
