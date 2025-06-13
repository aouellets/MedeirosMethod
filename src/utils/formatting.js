export const formatSessionName = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  // Split by underscores and spaces
  const words = name.split(/[_\s]+/);
  
  // Capitalize each word and join with spaces
  return words
    .filter(word => word.length > 0) // Remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const formatSessionType = (type) => {
  if (!type || typeof type !== 'string') return '';
  
  // Split by underscores and spaces
  const words = type.split(/[_\s]+/);
  
  // Capitalize each word and join with spaces
  return words
    .filter(word => word.length > 0) // Remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}; 