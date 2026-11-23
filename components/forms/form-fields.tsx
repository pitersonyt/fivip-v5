import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const controlClass =
  'w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50'

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-0.5 border-b border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  )
}

export function Field({
  id,
  label,
  hint,
  className,
  children,
}: {
  id: string
  label: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}

export function TextField({
  id,
  label,
  hint,
  className,
  ...props
}: { id: string; label: string; hint?: string; className?: string } & React.ComponentProps<'input'>) {
  return (
    <Field id={id} label={label} hint={hint} className={className}>
      <Input id={id} name={props.name ?? id} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
    </Field>
  )
}

export function SelectField({
  id,
  label,
  options,
  placeholder = 'Seleccionar',
  className,
  ...props
}: {
  id: string
  label: string
  options: readonly string[]
  placeholder?: string
  className?: string
} & React.ComponentProps<'select'>) {
  return (
    <Field id={id} label={label} className={className}>
      <select
        id={id}
        name={props.name ?? id}
        defaultValue={props.value === undefined ? '' : undefined}
        className={cn(controlClass, 'h-9')}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function TextAreaField({
  id,
  label,
  className,
  ...props
}: { id: string; label: string; className?: string } & React.ComponentProps<'textarea'>) {
  return (
    <Field id={id} label={label} className={className}>
      <textarea id={id} name={props.name ?? id} rows={3} className={cn(controlClass, 'py-2')} {...props} />
    </Field>
  )
}

export function ComputedField({ id, label, value, hint }: { id: string; label: string; value: string; hint?: string }) {
  return (
    <Field id={id} label={label} hint={hint}>
      <output
        id={id}
        aria-live="polite"
        className="flex h-9 items-center rounded-md border border-dashed border-border bg-muted/50 px-3 font-mono text-sm tabular-nums text-foreground"
      >
        {value}
      </output>
    </Field>
  )
}
