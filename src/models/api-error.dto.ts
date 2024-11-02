export interface ApiErrorDto {
  errorMessage: string;
  // TODO: Fixa sen. Tidigare värde var: import type { ValidationError } from "elysia/error";
  // deno-lint-ignore no-explicit-any
  verboseErrorMessage?: Readonly<any> | string;
}
