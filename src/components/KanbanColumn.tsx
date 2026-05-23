import { useDroppable } from "@dnd-kit/core";

type KanbanColumnProps = {
  status: string;
  label: string;
  children: React.ReactNode;
  count: number;
};

function KanbanColumn({ status, label, children, count }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div ref={setNodeRef} className="kanban-column">
      <div className="kanban-column-header">
        <h3>{label}</h3>
        <span className="column-count">{count}</span>
      </div>
      {children}
    </div>
  );
}

export default KanbanColumn;
