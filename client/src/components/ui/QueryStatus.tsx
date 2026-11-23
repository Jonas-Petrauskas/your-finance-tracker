import { useTranslation } from 'react-i18next'

type Props = {
  loading?: boolean
  hasData?: boolean
  error?: boolean
  actionError?: string | null
  emptyMessage?: string | null
}

export function QueryStatus({
  loading,
  hasData,
  error,
  actionError,
  emptyMessage,
}: Props) {
  const { t } = useTranslation()

  return (
    <>
      {loading && !hasData ? (
        <p className="text-(--muted)">{t('common.loading')}</p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-(--expense) bg-white px-3 py-2 text-(--expense)">
          {t('errors.graphqlUnreachable')}
        </p>
      ) : null}
      {actionError ? (
        <p className="rounded-md border border-(--expense) bg-white px-3 py-2 text-(--expense)">
          {actionError}
        </p>
      ) : null}
      {emptyMessage ? (
        <p className="rounded-md border border-(--line) bg-white px-3 py-2 text-(--muted)">
          {emptyMessage}
        </p>
      ) : null}
    </>
  )
}
