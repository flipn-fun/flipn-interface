import React from "react";
import InviteCodeView from "@/app/sections/invite-code";
import { INVITE_TYPE } from '@/app/config/invite';

const InviteCode: React.FC<any> = () => {
  return <InviteCodeView type={INVITE_TYPE.REF} />;
};

export default InviteCode;
