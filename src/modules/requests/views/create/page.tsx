"use client";

import RequestForm from "@/modules/requests/components/RequestForm";
import { useToast } from "ndui-ahrom";

export default function CreateRequestPage(isAdmin: boolean = false) {
  
  

  return (
    <RequestForm params={{isAdmin:isAdmin}} />
    // </Card>
  );
}
