import {
  ShippingMethod,
  ShippingMethodZone,
  ShippingZone,
} from "@prisma/client";

export type ShippingMethodWithRelations = ShippingMethod & {
  zones?: Array<
    ShippingMethodZone & {
      zone?: Pick<ShippingZone, "id" | "name">;
    }
  >;
};
