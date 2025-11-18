declare module "xlsx" {
  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [sheet: string]: WorkSheet };
  }

  export interface WorkSheet {
    [cell: string]: any;
  }

  export interface ParsingOptions {
    type?: "base64" | "binary" | "buffer" | "file" | "array" | "string";
    cellDates?: boolean;
    cellNF?: boolean;
    cellStyles?: boolean;
    sheetStubs?: boolean;
    sheetRows?: number;
    bookType?: string;
    bookFiles?: number;
    bookSheets?: boolean;
    bookProps?: boolean;
    bookVBA?: boolean;
    password?: string;
    WTF?: boolean;
  }

  export interface WritingOptions {
    type?: "base64" | "binary" | "buffer" | "file" | "array" | "string";
    cellDates?: boolean;
    cellNF?: boolean;
    cellStyles?: boolean;
    sheetStubs?: boolean;
    bookType?: string;
    bookFiles?: number;
    bookSheets?: boolean;
    bookProps?: boolean;
    bookVBA?: boolean;
    password?: string;
    compression?: boolean;
  }

  export interface Sheet2JSONOpts {
    raw?: boolean;
    dateNF?: string;
    defval?: any;
    blankrows?: boolean;
    header?: number | string[] | "A";
    range?: number | string;
  }

  export function read(data: any, opts?: ParsingOptions): WorkBook;
  export function write(workbook: WorkBook, opts?: WritingOptions): any;
  export const utils: {
    sheet_to_json<T = any>(worksheet: WorkSheet, opts?: Sheet2JSONOpts): T[];
    json_to_sheet(data: any[], opts?: any): WorkSheet;
    [key: string]: any;
  };
}
