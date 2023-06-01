export function blobToDataUrl(blob) {
  return new Promise(r => {let a=new FileReader(); a.onload=r; a.readAsDataURL(blob)}).then(e => e.target.result);
}

export function delay(delayInms) {
  return new Promise(resolve => setTimeout(resolve, delayInms));
}