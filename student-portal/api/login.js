import { json } from './auth.js';

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  try {
    return json({ error: 'Login has been removed from this portal' }, 410);
  } catch (error) {
    return json({ error: error?.message || 'Server error' }, 500);
  }
}
