export const getCsvHeaders = async (file) => {
  const formData = new FormData();
  formData.append('csvFile', file);
  return fetch('/api/csv-headers', { method: 'POST', body: formData });
};

export const importCsv = async (file, columnMapping) => {
  const formData = new FormData();
  formData.append('csvFile', file);
  formData.append('columnMapping', JSON.stringify(columnMapping));
  return fetch('/api/import-csv', { method: 'POST', body: formData });
};

export const exportCsv = async () => {
  const response = await fetch('/api/export-csv');
  if (!response.ok) throw new Error('Failed to export CSV');
  return response.blob();
};


export const replacePicsFromCsv = async (file, token) => {
  const form = new FormData();
  form.append('csvFile', file);
  const res = await fetch('/api/admin/replace-pics-from-csv', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  const body = await res.json();
  if (!res.ok) {
    const err = new Error(body && body.error ? body.error : `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
};


