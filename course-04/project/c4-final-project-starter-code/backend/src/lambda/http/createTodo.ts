import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import { TodoItem } from '../../models/TodoItem'

import { createTodo } from '../../businessLogic/todos'

import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'

const logger = createLogger('createTodos')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("Create todo request", {
    event: event
  })
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item
  const userId : string = getUserId(event)
  const todo : TodoItem = await createTodo(userId, newTodo)
  return {
    statusCode: 200,
    body: JSON.stringify({
      item: todo
    })
  }
})

handler.use(
  cors()
)
