'use server'

import { simpleLogout } from '@/lib/simple-auth'
import { redirect } from 'next/navigation'

export async function logout() {
    await simpleLogout()
    redirect('/login')
}
