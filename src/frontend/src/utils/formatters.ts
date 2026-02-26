import { MoveSize, Status } from "../backend";

export function formatMoveSize(size: MoveSize): string {
  switch (size) {
    case MoveSize.studio:
      return "Studio";
    case MoveSize.oneBR:
      return "1 BR";
    case MoveSize.twoBR:
      return "2 BR";
    case MoveSize.threeBRPlus:
      return "3 BR+";
    default:
      return String(size);
  }
}

export function formatStatus(status: Status): string {
  switch (status) {
    case Status.new_:
      return "New";
    case Status.distributed:
      return "Distributed";
    case Status.closed:
      return "Closed";
    default:
      return String(status);
  }
}

export function getStatusClass(status: Status): string {
  switch (status) {
    case Status.new_:
      return "status-new";
    case Status.distributed:
      return "status-distributed";
    case Status.closed:
      return "status-closed";
    default:
      return "";
  }
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
