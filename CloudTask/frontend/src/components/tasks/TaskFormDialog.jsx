import { useEffect } from 'react'
import { AlertCircle, CalendarClock, Flag, ListChecks } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createTask, updateTask } from '../../api/tasksApi'
import { localDateTimeToUtc, toDateTimeLocalValue } from '../../utils/date'
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../../utils/taskConstants'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

const emptyValues = {
  title: '',
  description: '',
  status: 'Pending',
  priority: 'Medium',
  dueDate: '',
}

function valuesFromTask(task) {
  if (!task) return emptyValues
  return {
    title: task.title ?? '',
    description: task.description ?? '',
    status: task.status ?? 'Pending',
    priority: task.priority ?? 'Medium',
    dueDate: toDateTimeLocalValue(task.dueDate),
  }
}

function FieldError({ error }) {
  if (!error) return null
  return (
    <p className="field-error" role="alert">
      <AlertCircle size={13} aria-hidden="true" />
      {error.message}
    </p>
  )
}

export default function TaskFormDialog({ open, task = null, onClose, onSaved }) {
  const isEditing = Boolean(task)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ defaultValues: emptyValues })

  useEffect(() => {
    if (open) reset(valuesFromTask(task))
  }, [open, task, reset])

  const handleClose = () => {
    if (!isSubmitting) onClose?.()
  }

  const onSubmit = async (values) => {
    const payload = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      status: values.status,
      priority: values.priority,
      dueDate: localDateTimeToUtc(values.dueDate),
    }

    try {
      const savedTask = isEditing
        ? await updateTask(task.id, payload)
        : await createTask(payload)
      toast.success(isEditing ? 'Task updated' : 'Task created', {
        description: `“${savedTask.title}” is ready.`,
      })
      onSaved?.(savedTask)
    } catch (error) {
      const fieldMap = {
        title: 'title',
        description: 'description',
        status: 'status',
        priority: 'priority',
        duedate: 'dueDate',
      }
      Object.entries(error.validationErrors ?? {}).forEach(([serverField, messages]) => {
        const normalizedField = serverField.split('.').at(-1).replace(/[^a-z]/gi, '').toLowerCase()
        const field = fieldMap[normalizedField]
        if (field) setError(field, { type: 'server', message: messages[0] })
      })
      toast.error(isEditing ? 'Could not update the task' : 'Could not create the task', {
        description: error.message,
      })
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="lg"
      title={isEditing ? 'Edit task' : 'Create a new task'}
      description={
        isEditing
          ? 'Update the details below. Changes are saved to CloudTask immediately.'
          : 'Capture the work, choose its priority, and set a clear next milestone.'
      }
      contentClassName="overflow-y-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5 px-5 py-6 sm:px-6">
          <div>
            <label className="field-label" htmlFor="task-title">
              Task title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <ListChecks className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-subtle)]" />
              <input
                id="task-title"
                data-autofocus
                className="input-control pl-10"
                placeholder="What needs to be done?"
                autoComplete="off"
                maxLength={150}
                {...register('title', {
                  required: 'A task title is required.',
                  validate: (value) => value.trim().length > 0 || 'A task title is required.',
                  maxLength: { value: 150, message: 'Keep the title under 150 characters.' },
                })}
                aria-invalid={Boolean(errors.title)}
              />
            </div>
            <FieldError error={errors.title} />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="field-label" htmlFor="task-description">Description</label>
              <span className="mb-2 text-xs text-[var(--text-subtle)]">Optional</span>
            </div>
            <textarea
              id="task-description"
              rows={4}
              className="input-control min-h-28 resize-y py-3 leading-6"
              placeholder="Add context, notes, or a definition of done…"
              maxLength={2000}
              {...register('description', {
                maxLength: { value: 2000, message: 'Keep the description under 2,000 characters.' },
              })}
              aria-invalid={Boolean(errors.description)}
            />
            <FieldError error={errors.description} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="task-status">Status</label>
              <div className="relative">
                <select id="task-status" className="input-control appearance-none pr-10" {...register('status', { required: true })} aria-invalid={Boolean(errors.status)}>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ListChecks className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-subtle)]" />
              </div>
              <FieldError error={errors.status} />
            </div>

            <div>
              <label className="field-label" htmlFor="task-priority">Priority</label>
              <div className="relative">
                <select id="task-priority" className="input-control appearance-none pr-10" {...register('priority', { required: true })} aria-invalid={Boolean(errors.priority)}>
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <Flag className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-subtle)]" />
              </div>
              <FieldError error={errors.priority} />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="task-due-date">Due date</label>
            <div className="relative">
              <input
                id="task-due-date"
                type="datetime-local"
                className="input-control pr-11 [color-scheme:light] dark:[color-scheme:dark]"
                {...register('dueDate')}
                aria-invalid={Boolean(errors.dueDate)}
              />
              <CalendarClock className="pointer-events-none absolute right-3.5 top-1/2 hidden size-4 -translate-y-1/2 text-[var(--text-subtle)] sm:block" />
            </div>
            <p className="field-hint">Entered in your local time and stored by the API as UTC.</p>
            <FieldError error={errors.dueDate} />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" loading={isSubmitting} loadingText={isEditing ? 'Saving…' : 'Creating…'} disabled={isEditing && !isDirty}>
            {isEditing ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

