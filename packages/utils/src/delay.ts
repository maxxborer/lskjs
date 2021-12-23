export const DELAY_MAX_SETTIMEOUT = 1234567890;

export function priomiseDelay(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), duration));
}

export async function delay(duration: number): Promise<void> {
  if (duration < DELAY_MAX_SETTIMEOUT) return priomiseDelay(duration);
  while (duration > 0) {
    const step = duration > DELAY_MAX_SETTIMEOUT ? DELAY_MAX_SETTIMEOUT : duration;
    // eslint-disable-next-line no-await-in-loop
    await priomiseDelay(step);
    // eslint-disable-next-line no-param-reassign
    duration -= step;
  }
  return undefined;
}

export default delay;
