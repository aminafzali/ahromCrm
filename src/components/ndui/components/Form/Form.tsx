// مسیر فایل: src/components/Form.tsx (یا مسیر مشابه برای این کامپوننت)

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

interface FormProps<T extends z.ZodType> {
  schema: T;
  onSubmit: (data: z.infer<T>) => void;
  children: React.ReactNode;
  className?: string;
  defaultValues?: z.infer<T>;
}

function Form<T extends z.ZodType>({ 
  schema, 
  onSubmit, 
  children, 
  defaultValues, 
  className = '' 
}: FormProps<T>) {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as z.infer<T>,
  });

  // ===== لاگ ردیابی ۱: بررسی وضعیت فرم و خطاها =====
  React.useEffect(() => {
    const subscription = methods.watch((value, { name, type }) => {
      console.log(`%c[Form] 📝 Form value changed:`, "color: #e83e8c;", value);
    });
    return () => subscription.unsubscribe();
  }, [methods.watch]);

  React.useEffect(() => {
    if (Object.keys(methods.formState.errors).length > 0) {
      console.warn(`%c[Form] ⚠️ Validation errors updated:`, "color: orange;", methods.formState.errors);
    }
  }, [methods.formState.errors]);
  // ===================================================

  // ===== لاگ ردیابی ۲: مدیریت هر دو حالت موفق و ناموفق ارسال فرم =====
  const onValid = (data: z.infer<T>) => {
    console.log(`%c[Form] ✅ Validation Succeeded! Calling parent onSubmit with data:`, "color: #28a745; font-weight: bold;", data);
    onSubmit(data);
  };

  const onInvalid = (errors: FieldErrors) => {
    // این مهم‌ترین لاگ است. اگر فرم شما ارسال نمی‌شود، به احتمال زیاد این لاگ را خواهید دید.
    console.error(`%c[Form] ❌ Validation Failed! Form not submitted. Errors:`, "color: #dc3545; font-weight: bold;", errors);
  };
  // =================================================================

  return (
    <FormProvider {...methods}>
      {/* handleSubmit اکنون هر دو حالت را مدیریت می‌کند */}
      <form 
        onSubmit={methods.handleSubmit(onValid, onInvalid)}
        className={className}
      >
        {children}
      </form>
    </FormProvider>
  );
}

export default Form;

// import React from 'react';
// import { useForm, FormProvider } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';

// interface FormProps<T extends z.ZodType> {
//   schema: T;
//   onSubmit: (data: z.infer<T>) => void;
//   children: React.ReactNode;
//   className?: string;
//   defaultValues?: z.infer<T>;
// }

// function Form<T extends z.ZodType>({ 
//   schema, 
//   onSubmit, 
//   children, 
//   defaultValues, 
//   className = '' 
// }: FormProps<T>) {
//   const methods = useForm({
//     resolver: zodResolver(schema),
//     defaultValues: defaultValues as z.infer<T>,
//   });

//   return (
//     <FormProvider {...methods}>
//       <form 
//         onSubmit={methods.handleSubmit(onSubmit)}
//         className={className}
//       >
//         {children}
//       </form>
//     </FormProvider>
//   );
// }

// export default Form;
