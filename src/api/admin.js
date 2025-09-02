import { http } from './http';

export const login = async (username, password) => {
  return http('admin/login', { body: { username, password } });
};


