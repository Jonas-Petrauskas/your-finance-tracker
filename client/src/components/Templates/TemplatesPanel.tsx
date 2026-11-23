import { useTemplatesMutations } from '../../hooks/useTemplatesMutations'
import type { RecurringTemplate } from '../../lib/types'
import { TemplatesPanelView } from './TemplatesPanelView'

type Props = {
  templates: RecurringTemplate[]
  currency: string
}

/** Thin container: wires template mutations into the dumb view. */
export function TemplatesPanel({ templates, currency }: Props) {
  const mutations = useTemplatesMutations()

  return (
    <TemplatesPanelView
      templates={templates}
      currency={currency}
      creating={mutations.creating}
      updating={mutations.updating}
      onCreate={mutations.create}
      onUpdate={mutations.update}
      onDelete={mutations.remove}
    />
  )
}
