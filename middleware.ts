import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // สั่งให้ปล่อยผ่านทุก Request ไปยังหน้าเว็บปกติ โดยไม่เปิดใช้คำสั่งตัวเก่าที่พัง
  return NextResponse.next();
}

// กำหนดขอบเขตให้รันเฉพาะหน้าเว็บทั่วไป
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
