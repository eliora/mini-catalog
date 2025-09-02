import { http } from './http';

export const getProducts = async (search = '', line = '') => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (line) params.append('line', line);
  return http(`products?${params.toString()}`);
};

export const getProductLines = async () => {
  return http('product-lines');
};

export const saveProduct = async (product, token) => {
  return http('products', { body: product, token });
};

export const deleteProduct = async (ref, token) => {
  return http(`products/${ref}`, { method: 'DELETE', token });
};


