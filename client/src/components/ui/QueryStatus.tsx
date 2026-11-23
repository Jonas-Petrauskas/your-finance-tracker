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
  return (
    <>
      {loading && !hasData ? <p className="text-(--muted)">Loading…</p> : null}
      {error ? (
        <p className="rounded-md border border-(--expense) bg-white px-3 py-2 text-(--expense)">
          Could not reach GraphQL. Is the server running on port 4000?
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
