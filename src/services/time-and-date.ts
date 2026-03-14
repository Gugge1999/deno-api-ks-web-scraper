/** Format: `yyyy-MM-dd     HH:mm:ss.SSS` */
export function currentDateAndTime() {
  const now = Temporal.Now.zonedDateTimeISO();

  const date = now.toPlainDate().toString(); // YYYY-MM-DD
  const time = now.toPlainTime().toString({ smallestUnit: "millisecond" }); // HH:mm:ss.SSS

  return `${time}     ${date}`;
}

/** Format: `HH:mm:ss` */
export const currentTime = () => Temporal.Now.plainTimeISO().toString({ smallestUnit: "second" });
