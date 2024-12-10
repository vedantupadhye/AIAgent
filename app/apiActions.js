// app/apiActions.js
"use server";

import axios from 'axios';

export async function fetchQuery(question) {
  try {
    const res = await axios.post('http://localhost:8000/query', { text: question });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'An error occurred');
  }
}