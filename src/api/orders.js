import { http } from './http';

export const createOrder = async (orderData) => {
  return http('orders', { body: orderData });
};

export const getOrders = async (token) => {
  return http('orders', { token });
};

export const updateOrder = async (id, data, token) => {
  return http(`orders/${id}`, { method: 'PUT', body: data, token });
};


