import React from "react";
import InviteCodeView from "@/app/sections/invite-code";

export const runtime = "edge";

const InviteCode: React.FC<any> = (props) => {
  return <InviteCodeView inviteLink={true} />;
};

export default InviteCode;
