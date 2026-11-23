// Lets UI outside the canvas (the floating nav) scroll the flight to a section.
let handler = null;
export const registerNav = (fn) => { handler = fn; return () => { if (handler === fn) handler = null; }; };
export const navTo = (id) => (handler ? handler(id) : false);
