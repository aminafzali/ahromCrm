// مسیر فایل: src/@Server/Http/Helper/QueryBuilder.ts

export class QueryBuilder {
  private where: any = {};
  private orderBy: any = { createdAt: "desc" };
  private include: any = {};
  private page: number = 1;
  private limit: number = 10;

  /**
   * Set the where clause
   */
  setWhere(where: any): QueryBuilder {
    console.log(`[QueryBuilder - LOG] Setting initial 'where' clause:`, where);
    this.where = { ...this.where, ...where };
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

    // Handle nested fields (e.g., 'user.name')
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

  // search(fields: string[], value: string): QueryBuilder {
  //   if (!value) {
  //     return this;
  //   }

  //   console.log(`[QueryBuilder - LOG] Applying search term "${value}" on fields:`, fields);

  //   // ===== شروع اصلاحیه کلیدی =====
  //   // این منطق جدید، فیلدهای تو در تو (مانند 'user.name') را به ساختار صحیح Prisma تبدیل می‌کند
  //   const searchConditions = fields.map((field) => {
  //     const parts = field.split(".");
  //     if (parts.length > 1) {
  //       // ساختن آبجکت تو در تو برای فیلدهای مرتبط
  //       // "user.name" => { user: { name: { contains: value } } }
  //       return parts.reduceRight((acc, part) => ({ [part]: acc }), {
  //         contains: value,
  //         mode: "insensitive",
  //       } as any);
  //     }
  //     // برای فیلدهای ساده
  //     return { [field]: { contains: value, mode: "insensitive" } };
  //   });
  //   // ===== پایان اصلاحیه کلیدی =====

  //   if (!this.where.OR) {
  //     this.where.OR = [];
  //   }
  //   if (!Array.isArray(this.where.OR)) {
  //       this.where.OR = [this.where.OR];
  //   }

  //   this.where.OR.push(...searchConditions);
  //   console.log(`[QueryBuilder - LOG] Added search conditions to 'OR' clause.`);

  //   return this;
  // }

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
