export const getFileNameDatePart = (link: string) =>
  /(?<=\/eVFRM\/)\d{6}(?=\/VFRM.pdf)/.exec(link)?.[0] ?? "";

export const getDatePart = (link: string) =>
  /(?<=\/eVFRM\/)\d{6}(?=\/index\.html)/.exec(link)?.[0] ?? "";
