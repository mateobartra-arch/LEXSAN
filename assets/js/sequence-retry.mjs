/* A conflicting transaction can be reported as permission-denied by rules
   enforcing monotonic counters. Re-read on a bounded retry; never reuse a value. */
export async function reserveWithRetry(operation) {
  for (let attempt = 0; ; attempt++) {
    try { return await operation(); }
    catch (error) {
      if (attempt >= 3 || !["permission-denied", "aborted"].includes(error.code)) throw error;
      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }
}
