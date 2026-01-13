import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const token = req.headers.get("cookie")?.split("auth_token=")[1]?.split(";")[0];

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenant/integration/update-google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        provider: "google",
        key: code,
        secret: "",
      }),
    });
    console.log("CODE RECEIVED:", code);
    console.log("Laravel response status:", res.status);

    if (!res.ok) {
      console.error("Failed to store code:", await res.text());
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/integrations?error=store_failed`);
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/integrations?connected=google`);
  } catch (err) {
    console.error("Callback error:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/integrations?error=callback`);
  }
}
