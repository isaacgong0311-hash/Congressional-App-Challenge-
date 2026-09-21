import { Toast } from "../../../components/lantern/primitives";
import { translated, type Language } from "./first-day-copy";

export function FirstDayToast({
  completionEventId,
  language,
  message,
  onDismiss,
  onUndo,
  taskId,
}: {
  completionEventId?: string;
  language: Language;
  message: string;
  onDismiss: () => void;
  onUndo: (taskId: string, completionEventId: string) => void;
  taskId?: string;
}) {
  return (
    <Toast>
      <p className="text-sm font-semibold">{message}</p>
      <div className="flex items-center gap-2">
        {taskId && completionEventId ? (
          <button className="font-bold text-amber underline underline-offset-4" onClick={() => onUndo(taskId, completionEventId)} type="button">
            {translated(language, "Undo", "Deshacer")}
          </button>
        ) : null}
        <button aria-label={translated(language, "Dismiss message", "Cerrar mensaje")} className="rounded-lg px-2 py-1 text-white/65 hover:bg-white/10 hover:text-white" onClick={onDismiss} type="button">×</button>
      </div>
    </Toast>
  );
}
