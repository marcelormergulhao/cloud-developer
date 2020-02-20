import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'

import { deleteTodo } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'

const logger = createLogger('deleteTodos')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  logger.info("Delete request",{
    event: event
  })

  // TODO: Remove a TODO item by id
  const userId : string = getUserId(event)
  await deleteTodo(userId, todoId)
  return {
    statusCode: 200,
    body: ""
  }
})

handler.use(
  cors()
)
