export function blobToDataUrl(blob) {
  return new Promise(r => {let a=new FileReader(); a.onload=r; a.readAsDataURL(blob)}).then(e => e.target.result);
}

export function delay(delayInms) {
  return new Promise(resolve => setTimeout(resolve, delayInms));
}

export function filter2search(filters) {
    const searchText = filters.map(filter => `${filter.type}.${filter.term}`).join(', ');
    return searchText;
}