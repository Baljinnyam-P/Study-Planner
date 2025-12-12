// Utility function to extract error message from API errors
export const apiMsg = (e) => {
  return e?.response?.data?.msg || e?.message || 'Something went wrong';
};
