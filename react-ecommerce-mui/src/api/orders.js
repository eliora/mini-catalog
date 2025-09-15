import { supabase } from '../config/supabase';

export const createOrder = async (orderData) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      customer_name: orderData.customerName, // Use snake_case for database
      total: orderData.total,
      items: orderData.items
    }])
    .select();

  if (error) throw error;
  return data[0];
};

export const getOrderById = async (id) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const getOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const updateOrder = async (id, data) => {
  const { data: result, error } = await supabase
    .from('orders')
    .update({
      customer_name: data.customerName, // Use snake_case for database
      total: data.total,
      items: data.items
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  return result[0];
};


