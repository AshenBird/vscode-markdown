export const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
) => {
  let timer: number;
  return (...args: T) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      // func(...args);
      func.apply(undefined, args);
    }, delay);
  };
};
