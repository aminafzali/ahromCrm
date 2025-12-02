// مسیر فایل: src/@Server/Http/Helper/QueryBuilder.ts

export class QueryBuilder {
  private where: any = {};
  private orderBy: any = { createdAt: "desc" };
  private include: any = {};
  private page: number = 1;
  private limit: number = 10;

  /**
   * Set taskId filter specifically (custom handler for Document model)
   * This method handles taskId filter correctly without converting it to task relation
   */
  setTaskIdFilter(taskId: number | null | string | undefined): QueryBuilder {
    if (taskId === undefined) {
      return this;
    }

    const taskIdValue =
      taskId === null || taskId === "null" ? null : Number(taskId);

    console.log(`[QueryBuilder - LOG] Setting taskId filter:`, taskIdValue);

    if (!isNaN(taskIdValue as number) && taskIdValue !== null) {
      this.where.taskId = taskIdValue;
    } else if (taskIdValue === null) {
      this.where.taskId = null;
    }

    return this;
  }

  setWhere(where: any): QueryBuilder {
    console.log(`[QueryBuilder - LOG] Setting initial 'where' clause:`, where);

    if (!where) {
      return this;
    }

    // بررسی فیلتر taskId - باید قبل از پردازش عادی حذف شود
    if (where.taskId !== undefined) {
      this.setTaskIdFilter(where.taskId);
      // حذف taskId از where تا در حلقه پردازش نشود
      const { taskId, ...restWhere } = where;
      where = restWhere;
    }

    for (const key in where) {
      const value = where[key];
      if (
        value === undefined ||
        // value === null ||
        value === "all" ||
        value === ""
      ) {
        continue;
      }

      if (value === "null" || null) {
        if (key.endsWith("Id")) {
          const fieldName = key.replace("Id", "");
          console.log("تست آیدی", fieldName);
          this.where[fieldName] = null;
        } else if (key.endsWith("_some")) {
          const fieldName = key.replace("_some", "");
          this.where[fieldName] = null;
        } else if (key.endsWith("_in")) {
          const fieldName = key.replace("_in", "");
          this.where[fieldName] = null;
        } else if (key.endsWith("_contains")) {
          const fieldName = key.replace("_contains", "");
          this.where[fieldName] = null;
        } else if (key.endsWith("_bool")) {
          const fieldName = key.replace("_bool", "");
          this.where[fieldName] = null;
        } else {
          this.where[key] = null;
        }
      } else {
        if (key.endsWith("_some")) {
          const fieldName = key.replace("_some", "");
          const ids = String(value)
            .split(",")
            .map(Number)
            .filter((id) => !isNaN(id));
          if (ids.length > 0) {
            this.where[fieldName] = { some: { id: { in: ids } } };
          }
        } else if (key.endsWith("_in")) {
          const fieldName = key.replace("_in", "");
          const valuesAsArray = String(value).split(",");

          // // ===== شروع اصلاحیه کلیدی =====
          // // اگر نام فیلد به "Id" ختم می‌شود، مقادیر را به عدد تبدیل می‌کنیم
          // if (fieldName.endsWith("Id")) {
          //   const ids = valuesAsArray.map(Number).filter((id) => !isNaN(id));
          //   if (ids.length > 0) {
          //     this.where[fieldName] = { in: ids };
          //   }
          // } else {
          //   // در غیر این صورت، مقادیر را به صورت رشته نگه می‌داریم (برای status, type و...)
          //   this.where[fieldName] = { in: valuesAsArray };
          // }
          // // ===== پایان اصلاحیه کلیدی =====

          // ===== شروع اصلاحیه کلیدی =====
          // بررسی می‌کنیم که نام فیلد خود "id" است یا به "Id" ختم می‌شود
          if (fieldName.toLowerCase().endsWith("id")) {
            const ids = valuesAsArray.map(Number).filter((id) => !isNaN(id));
            if (ids.length > 0) {
              this.where[fieldName] = { in: ids };
            }
          } else {
            // برای سایر فیلترها (مانند status, type) مقادیر را به صورت رشته نگه می‌داریم
            this.where[fieldName] = { in: valuesAsArray };
          }
          // ===== پایان اصلاحیه کلیدی =====
        } else if (key.endsWith("_gte")) {
          const fieldName = key.replace("_gte", "");
          if (!this.where[fieldName]) this.where[fieldName] = {};
          this.where[fieldName].gte = value;
        } else if (key.endsWith("_lte")) {
          const fieldName = key.replace("_lte", "");
          if (!this.where[fieldName]) this.where[fieldName] = {};
          this.where[fieldName].lte = value;
        } else if (key.endsWith("_contains")) {
          const fieldName = key.replace("_contains", "");
          this.where[fieldName] = { contains: value, mode: "insensitive" };
        } else if (key.endsWith("_bool")) {
          const fieldName = key.replace("_bool", "");
          if (value === "true") {
            this.where[fieldName] = true;
          } else if (value === "false") {
            this.where[fieldName] = false;
          } else {
            this.where[fieldName] = {};
          }
        } else {
          this.where[key] = value;
        }
      }
    }

    return this;
  }

  

  /**
   * Add a where condition
   */
  Where(field: string, value: any, operator: string = "equals"): QueryBuilder {
    if (value === undefined || value === null) {
      return this;
    }

    if (!this.where) {
      this.where = {};
    }

    const parts = field.split(".");
    if (parts.length > 1) {
      let current = this.where;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      if (!current[parts[parts.length - 1]]) {
        current[parts[parts.length - 1]] = {};
      }

      current[parts[parts.length - 1]][operator] = value;
    } else {
      if (!this.where[field]) {
        this.where[field] = {};
      }
      this.where[field][operator] = value;
    }
    console.log(
      `[QueryBuilder - LOG] Added condition: ${field} ${operator} ${value}`
    );
    return this;
  }

  /**
   * Add a search condition
   */

  search(fields: string[], value: string): QueryBuilder {
    if (!value) {
      return this;
    }

    const searchConditions = fields.map((field) => ({
      [field]: { contains: value },
    }));

    if (!this.where.OR) {
      this.where.OR = searchConditions;
    } else {
      this.where.OR = [...this.where.OR, ...searchConditions];
    }

    return this;
  }

  /**
   * Add a date range condition
   */
  dateRange(
    field: string,
    startDate?: string | Date,
    endDate?: string | Date
  ): QueryBuilder {
    if (!startDate && !endDate) {
      return this;
    }

    if (!this.where[field]) {
      this.where[field] = {};
    }

    if (startDate) {
      this.where[field].gte = new Date(startDate);
    }

    if (endDate) {
      this.where[field].lte = new Date(endDate);
    }
    console.log(`[QueryBuilder - LOG] Applied date range on field "${field}".`);
    return this;
  }

  /**
   * Add a numeric range condition
   */
  numericRange(field: string, min?: number, max?: number): QueryBuilder {
    if (min === undefined && max === undefined) {
      return this;
    }

    if (!this.where[field]) {
      this.where[field] = {};
    }

    if (min !== undefined) {
      this.where[field].gte = min;
    }

    if (max !== undefined) {
      this.where[field].lte = max;
    }
    console.log(
      `[QueryBuilder - LOG] Applied numeric range on field "${field}".`
    );
    return this;
  }

  /**
   * Add an array contains condition
   */
  arrayContains(field: string, value: any): QueryBuilder {
    if (!value) {
      return this;
    }

    if (!this.where[field]) {
      this.where[field] = {};
    }

    this.where[field].has = value;
    return this;
  }

  /**
   * Set the order by clause
   */
  setOrderBy(orderBy: any): QueryBuilder {
    console.log(`[QueryBuilder - LOG] Setting 'orderBy':`, orderBy);
    this.orderBy = orderBy;
    return this;
  }

  /**
   * Set the include clause
   */
  setInclude(include: any): QueryBuilder {
    console.log(`[QueryBuilder - LOG] Setting 'include':`, include);
    this.include = { ...this.include, ...include };
    return this;
  }

  /**
   * Set pagination parameters
   */
  setPagination(page: number, limit: number): QueryBuilder {
    console.log(
      `[QueryBuilder - LOG] Setting pagination: page=${page}, limit=${limit}`
    );
    this.page = page;
    this.limit = limit;
    return this;
  }

  /**
   * Build the query
   */
  build(): {
    where: any;
    orderBy: any;
    include: any;
    skip: number;
    take: number;
  } {
    const finalQuery = {
      where: this.where,
      orderBy: this.orderBy,
      include: this.include,
      skip: (this.page - 1) * this.limit,
      take: this.limit,
    };

    console.log(
      `[QueryBuilder - LOG] Final query built:`,
      JSON.stringify(finalQuery, null, 2)
    );

    return finalQuery;
  }
}
