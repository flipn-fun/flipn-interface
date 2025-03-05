import { NextRequest } from "next/server";
import { urlFormat } from "@/app/utils/urlFormat";
// const { spawn } = require('child_process');

const prefix = "https://frontend-api.pump.fun/coins/";

export const runtime = "edge";

export async function GET(request: Request | NextRequest) {
  const params: any = {};
  const queryParams = urlFormat(request.url)

  const token = queryParams["token"];

  const v = await fetch(prefix + token, params);

  // console.log('v:', await v.json())

  // const command = spawn('curl', ['--location', 'https://frontend-api.pump.fun/coins/526d8UxmsTQJKN9bbsZsjaYShzRMnPBPQuniBnC1K3Ao']);

  // command.stdout.on('data', (data: any) => {
  //     console.log(`stdout: ${data}`);
  // });

  // command.stderr.on('data', (data: any) => {
  //     console.error(`stderr: ${data}`);
  // });

  // command.on('close', (code: any) => {
  //     console.log(`child process exited with code ${code}`);
  // });

  return new Response(JSON.stringify(await v.json()), {
    status: 200
  });
}
