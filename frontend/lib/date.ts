export const formatDate = (value: string) => new Date(value).toLocaleDateString();

export const formatDateTime = (value: string) => new Date(value).toLocaleString();

export const toStartOfDayUTC = (dateStr: string) => new Date(`${dateStr}T00:00:00`).toISOString();

export const toEndOfDayUTC = (dateStr: string) => new Date(`${dateStr}T23:59:59.999`).toISOString();
