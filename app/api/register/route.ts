import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail, initDB } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }
    await initDB()
    const existing = await getUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }
    // Password hashed by Postgres pgcrypto crypt() — no bcrypt in Node needed
    const user = await createUser(email, name, password)
    return NextResponse.json({ id: user.id, email: user.email, name: user.name })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
