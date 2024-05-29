import { HttpResponse, http } from 'msw'

import { env } from '@/config/env'

import { db, persistDb } from '../db'
import { requireAuth, requireAdmin, sanitizeUser, networkDelay } from '../utils'

type ProfileBody = {
  email: string
  firstName: string
  lastName: string
  bio: string
}

export const usersHandlers = [
  http.get(`${env.API_URL}/users`, async ({ cookies }) => {
    await networkDelay()

    try {
      const user = requireAuth(cookies)
      const result = db.user
        .findMany({
          where: {
            teamId: {
              equals: user?.teamId
            }
          }
        })
        .map(sanitizeUser)

      return HttpResponse.json(result)
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 }
      )
    }
  }),

  http.patch(`${env.API_URL}/users/profile`, async ({ request, cookies }) => {
    await networkDelay()

    try {
      const user = requireAuth(cookies)
      const data = (await request.json()) as ProfileBody
      const result = db.user.update({
        where: {
          id: {
            equals: user?.id
          }
        },
        data
      })
      persistDb('user')
      return HttpResponse.json(result)
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 }
      )
    }
  }),

  http.delete(`${env.API_URL}/users/:userId`, async ({ cookies, params }) => {
    await networkDelay()

    try {
      const user = requireAuth(cookies)
      const userId = params.userId as string
      requireAdmin(user)
      const result = db.user.delete({
        where: {
          id: {
            equals: userId
          },
          teamId: {
            equals: user?.teamId
          }
        }
      })
      persistDb('user')
      return HttpResponse.json(result)
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 }
      )
    }
  })
]
