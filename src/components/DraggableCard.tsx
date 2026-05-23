import { useDraggable } from "@dnd-kit/core";
import ApplicationCard from "./ApplicationCard";
import type { JobApplication } from "../types/application";

type DraggableCardProps = {
  application: JobApplication;
  onDelete: (id: number) => void;
};

function DraggableCard({ application, onDelete }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: application.id,
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: 999,
        position: "relative" as const,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style}>
      {/* Only this handle area triggers dragging */}
      <div
        {...listeners}
        {...attributes}
        style={{ cursor: "grab", padding: "4px 0 2px" }}
      >
        <div
          style={{
            width: 24,
            height: 3,
            borderRadius: 999,
            background: "#d1d5db",
            margin: "0 auto 6px",
          }}
        />
      </div>
      <ApplicationCard application={application} onDelete={onDelete} />
    </div>
  );
}

export default DraggableCard;
