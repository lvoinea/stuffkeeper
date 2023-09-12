export function blobToDataUrl(blob) {
  return new Promise(r => {let a=new FileReader(); a.onload=r; a.readAsDataURL(blob)}).then(e => e.target.result);
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function filter2search(filters) {
    const searchText = filters.map(filter => `${filter.type}.${filter.term}`).join(', ');
    return searchText;
}