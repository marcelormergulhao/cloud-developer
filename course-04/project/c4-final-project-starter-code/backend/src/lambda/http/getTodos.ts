import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getTodos } from '../../businessLogic/todos'
import { getUserId } from '../utils'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const logger = createLogger('gettodos')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  logger.info("Get todos request", {
    event: event
  })

  const userId : string = getUserId(event)
  const items = await getTodos(userId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items
    })
  }

})

handler.use(
  cors()
)