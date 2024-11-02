// import type { ValidationError } from "elysia/error";

export interface ApiErrorDto {
  errorMessage: string;
  // TODO: Fixa sen
  verboseErrorMessage?: Readonly<any> | string;
}
