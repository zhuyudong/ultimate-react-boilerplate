import type { ReactNode } from 'react'
import { Fragment, useCallback } from 'react'

import type { Comment, User } from '@/types/api'

import { useUser } from './auth'

export enum ROLES {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

type RoleTypes = keyof typeof ROLES

export const POLICIES = {
  'comment:delete': (user: User, comment: Comment) => {
    if (user.role === 'ADMIN') {
      return true
    }

    if (user.role === 'USER' && comment.author?.id === user.id) {
      return true
    }

    return false
  }
}

export const useAuthorization = () => {
  const user = useUser()

  if (!user.data) {
    throw Error('User does not exist!')
  }

  const checkAccess = useCallback(
    ({ allowedRoles }: { allowedRoles: RoleTypes[] }) => {
      if (allowedRoles && allowedRoles.length > 0 && user.data) {
        return allowedRoles?.includes(user.data.role)
      }

      return true
    },
    [user.data]
  )

  return { checkAccess, role: user.data.role }
}

type AuthorizationProps = {
  forbiddenFallback?: ReactNode
  children: ReactNode
} & (
  | {
      allowedRoles: RoleTypes[]
      policyCheck?: never
    }
  | {
      allowedRoles?: never
      policyCheck: boolean
    }
)

export const Authorization = ({
  policyCheck,
  allowedRoles,
  forbiddenFallback = null,
  children
}: AuthorizationProps) => {
  const { checkAccess } = useAuthorization()

  let canAccess = false

  if (allowedRoles) {
    canAccess = checkAccess({ allowedRoles })
  }

  if (typeof policyCheck !== 'undefined') {
    canAccess = policyCheck
  }

  return <>{canAccess ? children : forbiddenFallback}</>
}
