export const formatSessionName = (name) => {
  if (!name) return '';
  
  // Split by underscores and spaces
  const words = name.split(/[_\s]+/);
  
  // Capitalize each word and join with spaces
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const formatSessionType = (type) => {
  if (!type) return '';
  
  // Split by underscores and spaces
  const words = type.split(/[_\s]+/);
  
  // Capitalize each word and join with spaces
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}; 