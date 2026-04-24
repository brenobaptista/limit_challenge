export const formatDate = (value: string) => new Date(value).toLocaleDateString();

export const formatDateTime = (value: string) => new Date(value).toLocaleString();

export const toLocalDayStartISO = (dateStr: string) =>
  new Date(`${dateStr}T00:00:00`).toISOString();

export const toLocalDayEndISO = (dateStr: string) =>
  new Date(`${dateStr}T23:59:59.999`).toISOString();
