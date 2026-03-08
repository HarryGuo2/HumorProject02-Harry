import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get user session
  const { data: { user } } = await supabase.auth.getUser()

  // If accessing admin routes, check for authentication and superadmin status
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // Redirect to login if not authenticated
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('message', 'Please login to access admin panel')
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user is superadmin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_superadmin) {
      // Redirect to unauthorized page if not superadmin
      const redirectUrl = new URL('/unauthorized', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}