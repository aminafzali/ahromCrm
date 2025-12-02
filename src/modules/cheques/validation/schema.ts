import { z } from "zod";

export const createChequeSchema = z
  .object({
    workspaceUser: z.object(
      { id: z.number() },
      { required_error: "انتخاب کاربر الزامی است." }
    ),
    invoiceId: z.number().optional(),
    paymentId: z.number().optional(),
    bankAccountId: z.number().optional(),
    chequeNumber: z.string().min(1, "شماره چک الزامی است."),
    serial: z.string().optional(),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    accountNumber: z.string().optional(),
    amount: z.number().min(1000, "مبلغ باید حداقل 1000 تومان باشد"),
    issueDate: z.string().min(1, "تاریخ صدور الزامی است."),
    dueDate: z.string().min(1, "تاریخ سررسید الزامی است."),
    direction: z.enum(["INCOMING", "OUTGOING"], {
      required_error: "انتخاب جهت چک الزامی است.",
    }),
    status: z.enum(
      [
        "CREATED",
        "HANDED_OVER",
        "DEPOSITED",
        "CLEARED",
        "RETURNED",
        "CANCELLED",
        "LOST",
      ],
      {
        required_error: "انتخاب وضعیت چک الزامی است.",
      }
    ),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.issueDate && data.dueDate) {
        const issue = new Date(data.issueDate);
        const due = new Date(data.dueDate);
        return due >= issue;
      }
      return true;
    },
    {
      message: "تاریخ سررسید باید بعد از تاریخ صدور باشد.",
      path: ["dueDate"],
    }
  );

export const updateChequeSchema = z.object({
  workspaceUser: z
    .object({ id: z.number() }, { required_error: "انتخاب کاربر الزامی است." })
    .optional(),
  invoiceId: z.number().optional(),
  paymentId: z.number().optional(),
  bankAccountId: z.number().optional(),
  chequeNumber: z.string().min(1, "شماره چک الزامی است.").optional(),
  serial: z.string().optional(),
  bankName: z.string().optional(),
  branchName: z.string().optional(),
  accountNumber: z.string().optional(),
  amount: z.number().min(1000, "مبلغ باید حداقل 1000 تومان باشد").optional(),
  issueDate: z.string().min(1, "تاریخ صدور الزامی است.").optional(),
  dueDate: z.string().min(1, "تاریخ سررسید الزامی است.").optional(),
  direction: z.enum(["INCOMING", "OUTGOING"]).optional(),
  status: z
    .enum([
      "CREATED",
      "HANDED_OVER",
      "DEPOSITED",
      "CLEARED",
      "RETURNED",
      "CANCELLED",
      "LOST",
    ])
    .optional(),
  description: z.string().optional(),
});

export const updateChequeStatusSchema = z.object({
  status: z.enum([
    "CREATED",
    "HANDED_OVER",
    "DEPOSITED",
    "CLEARED",
    "RETURNED",
    "CANCELLED",
    "LOST",
  ]),
  note: z.string().optional(),
});
