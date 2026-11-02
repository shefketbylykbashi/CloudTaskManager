import { Trash2, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { deleteTask } from '../../api/tasksApi'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

export default function DeleteTaskDialog({ task, open, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!task) return
    setDeleting(true)
    try {
      await deleteTask(task.id)
      toast.success('Task deleted', { description: `“${task.title}” was permanently removed.` })
      onDeleted?.(task)
    } catch (error) {
      toast.error('Could not delete the task', { description: error.message })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal open={open} onClose={deleting ? undefined : onClose} size="sm" showClose={!deleting} ariaLabel="Delete task confirmation">
      <div className="px-6 pb-2 pt-7 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
          <TriangleAlert size={24} aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-lg font-bold tracking-tight">Delete this task?</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text)]">{task?.title}</span> will be permanently removed. This action cannot be undone.
        </p>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 border-t border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={deleting}>Keep task</Button>
        <Button variant="danger" onClick={handleDelete} loading={deleting} loadingText="Deleting…">
          {!deleting && <Trash2 size={16} aria-hidden="true" />}
          Delete task
        </Button>
      </div>
    </Modal>
  )
}

