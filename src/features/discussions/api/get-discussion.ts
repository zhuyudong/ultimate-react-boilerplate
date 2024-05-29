import { useQuery, queryOptions } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import type { QueryConfig } from '@/lib/react-query'
import type { Discussion } from '@/types/api'

export const getDiscussion = ({
  discussionId
}: {
  discussionId: string
}): Promise<Discussion> => {
  return api.get(`/discussions/${discussionId}`)
}

export const getDiscussionQueryOptions = (discussionId: string) => {
  return queryOptions({
    queryKey: ['discussions', discussionId],
    queryFn: () => getDiscussion({ discussionId })
  })
}

type UseDiscussionOptions = {
  discussionId: string
  queryConfig?: QueryConfig<typeof getDiscussionQueryOptions>
}

export const useDiscussion = ({
  discussionId,
  queryConfig
}: UseDiscussionOptions) => {
  return useQuery({
    ...getDiscussionQueryOptions(discussionId),
    ...queryConfig
  })
}
